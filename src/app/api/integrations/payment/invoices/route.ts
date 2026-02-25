import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import {
  createInvoice,
  listInvoices,
  getChannelLabel,
} from '@/lib/services/payment-gateway.service';
import type { PaymentChannel } from '@/lib/services/payment-gateway.service';
import { logger } from '@/lib/logger';

const VALID_CHANNELS: PaymentChannel[] = [
  'va_bca', 'va_mandiri', 'va_bni', 'va_bri',
  'qris', 'ewallet_gopay', 'ewallet_ovo', 'ewallet_dana', 'credit_card',
];

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(req.url);
    const pilgrimId = searchParams.get('pilgrimId') || undefined;
    const status = searchParams.get('status') || undefined;

    const invoices = await listInvoices(auth.agencyId, { pilgrimId, status });
    return NextResponse.json({ data: invoices });
  } catch (error) {
    logger.error('GET /api/integrations/payment/invoices error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const body = await req.json();
    const { pilgrimId, amount, description, channel } = body;

    // Validate required fields
    if (!pilgrimId || typeof pilgrimId !== 'string') {
      return NextResponse.json({ error: 'Pilgrim ID wajib diisi' }, { status: 400 });
    }
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Jumlah harus lebih dari 0' }, { status: 400 });
    }
    if (!channel || !VALID_CHANNELS.includes(channel)) {
      return NextResponse.json({ error: 'Channel pembayaran tidak valid' }, { status: 400 });
    }

    // Verify pilgrim belongs to this agency
    const pilgrim = await prisma.pilgrim.findFirst({
      where: { id: pilgrimId, agencyId: auth.agencyId },
    });
    if (!pilgrim) {
      return NextResponse.json({ error: 'Jemaah tidak ditemukan' }, { status: 404 });
    }

    const invoice = await createInvoice({
      pilgrimId,
      amount,
      description: description || `Pembayaran Umrah - ${pilgrim.name}`,
      channel,
      agencyId: auth.agencyId,
      userId: auth.userId,
    });

    // Enrich with pilgrim name
    invoice.pilgrimName = pilgrim.name;
    invoice.channelLabel = getChannelLabel(channel);

    return NextResponse.json(invoice, { status: 201 });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan server';
    logger.error('POST /api/integrations/payment/invoices error', { error: String(error) });
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
