import { NextRequest, NextResponse } from 'next/server';
import { handleWebhook } from '@/lib/services/payment-gateway.service';
import type { PaymentProvider } from '@/lib/services/payment-gateway.service';
import { logger } from '@/lib/logger';

// This endpoint does NOT require authentication.
// Webhooks come from external payment gateway services (Midtrans, Xendit, Duitku).

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

    console.log(`[Payment Webhook] Received from ${provider}:`, JSON.stringify(payload, null, 2));

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
