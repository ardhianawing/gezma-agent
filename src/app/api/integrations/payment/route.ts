import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import {
  getPaymentGatewayConfig,
  updatePaymentGatewayConfig,
} from '@/lib/services/payment-gateway.service';
import type { PaymentProvider, PaymentChannel } from '@/lib/services/payment-gateway.service';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const config = await getPaymentGatewayConfig(auth.agencyId);
    return NextResponse.json(config);
  } catch (error) {
    logger.error('GET /api/integrations/payment error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

const VALID_PROVIDERS: PaymentProvider[] = ['midtrans', 'xendit', 'duitku'];
const VALID_CHANNELS: PaymentChannel[] = [
  'va_bca', 'va_mandiri', 'va_bni', 'va_bri',
  'qris', 'ewallet_gopay', 'ewallet_ovo', 'ewallet_dana', 'credit_card',
];

export async function POST(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const body = await req.json();
    const { provider, isEnabled, serverKey, clientKey, isProduction, enabledChannels } = body;

    // Validate provider
    if (provider !== null && !VALID_PROVIDERS.includes(provider)) {
      return NextResponse.json({ error: 'Provider tidak valid' }, { status: 400 });
    }

    // Validate channels
    if (enabledChannels && Array.isArray(enabledChannels)) {
      for (const ch of enabledChannels) {
        if (!VALID_CHANNELS.includes(ch)) {
          return NextResponse.json({ error: `Channel tidak valid: ${ch}` }, { status: 400 });
        }
      }
    }

    const config = await updatePaymentGatewayConfig(auth.agencyId, {
      provider: provider ?? undefined,
      isEnabled: typeof isEnabled === 'boolean' ? isEnabled : undefined,
      serverKey: serverKey !== undefined ? serverKey : undefined,
      clientKey: clientKey !== undefined ? clientKey : undefined,
      isProduction: typeof isProduction === 'boolean' ? isProduction : undefined,
      enabledChannels: enabledChannels ?? undefined,
    });

    return NextResponse.json(config);
  } catch (error) {
    logger.error('POST /api/integrations/payment error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
