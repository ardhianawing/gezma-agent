import { NextRequest, NextResponse } from 'next/server';
import { handleWebhook } from '@/lib/services/payment-gateway.service';
import type { PaymentProvider } from '@/lib/services/payment-gateway.service';
import { logger } from '@/lib/logger';
import crypto from 'crypto';

// This endpoint does NOT require session authentication.
// Webhooks come from external payment gateway services (Midtrans, Xendit, Duitku).
// Instead, each provider's signature/token is verified before processing.

function verifyMidtransSignature(payload: Record<string, unknown>): boolean {
  const serverKey = process.env.MIDTRANS_SERVER_KEY;
  if (!serverKey) {
    logger.warn('[Webhook] MIDTRANS_SERVER_KEY not configured');
    return false;
  }
  const { order_id, status_code, gross_amount, signature_key } = payload;
  if (!signature_key || !order_id || !status_code || !gross_amount) return false;
  const hash = crypto.createHash('sha512')
    .update(`${order_id}${status_code}${gross_amount}${serverKey}`)
    .digest('hex');
  return hash === signature_key;
}

function verifyXenditCallback(req: NextRequest): boolean {
  const token = req.headers.get('x-callback-token');
  const expected = process.env.XENDIT_CALLBACK_TOKEN;
  if (!expected) {
    logger.warn('[Webhook] XENDIT_CALLBACK_TOKEN not configured');
    return false;
  }
  return token === expected;
}

function verifyDuitkuSignature(payload: Record<string, unknown>): boolean {
  const apiKey = process.env.DUITKU_API_KEY;
  if (!apiKey) {
    logger.warn('[Webhook] DUITKU_API_KEY not configured');
    return false;
  }
  const { merchantCode, amount, merchantOrderId, signature } = payload;
  if (!signature || !merchantCode || !merchantOrderId) return false;
  const hash = crypto.createHash('md5')
    .update(`${merchantCode}${amount}${merchantOrderId}${apiKey}`)
    .digest('hex');
  return hash === signature;
}

export async function POST(req: NextRequest) {
  try {
    const payload = await req.json();

    // Determine provider from payload structure or headers
    let provider: PaymentProvider = 'midtrans'; // default

    // Xendit sends x-callback-token header
    const xenditToken = req.headers.get('x-callback-token');
    if (xenditToken) {
      provider = 'xendit';
    }

    // Duitku sends merchantCode in body
    if (payload?.merchantCode) {
      provider = 'duitku';
    }

    // Midtrans sends signature_key in body
    if (payload?.signature_key) {
      provider = 'midtrans';
    }

    // Verify signature before processing
    let verified = false;
    switch (provider) {
      case 'midtrans': verified = verifyMidtransSignature(payload); break;
      case 'xendit': verified = verifyXenditCallback(req); break;
      case 'duitku': verified = verifyDuitkuSignature(payload); break;
    }

    if (!verified) {
      logger.warn(`[Payment Webhook] Invalid signature from ${provider}`, { provider });
      return NextResponse.json({ status: 'error', message: 'Invalid signature' }, { status: 403 });
    }

    logger.info(`[Payment Webhook] Verified from ${provider}`, { provider });

    await handleWebhook(provider, payload);

    // Always return 200 OK to acknowledge receipt
    // Payment gateways will retry if they don't get 200
    return NextResponse.json({ status: 'ok' });
  } catch (error) {
    logger.error('POST /api/integrations/payment/webhook error', { error: String(error) });
    // Still return 200 to prevent infinite retries from gateway
    return NextResponse.json({ status: 'error', message: 'Processing failed' }, { status: 200 });
  }
}
