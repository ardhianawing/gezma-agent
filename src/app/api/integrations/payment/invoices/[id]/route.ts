import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { getInvoice, cancelInvoice } from '@/lib/services/payment-gateway.service';
import { logger } from '@/lib/logger';

type Context = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Context) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { id } = await params;

  try {
    const invoice = await getInvoice(id, auth.agencyId);
    if (!invoice) {
      return NextResponse.json({ error: 'Invoice tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json(invoice);
  } catch (error) {
    logger.error('GET /api/integrations/payment/invoices/[id] error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Context) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { id } = await params;

  try {
    const invoice = await cancelInvoice(id, auth.agencyId);
    return NextResponse.json(invoice);
  } catch (error) {
    logger.error('DELETE /api/integrations/payment/invoices/[id] error', { error: String(error) });
    return NextResponse.json({ error: 'Gagal membatalkan invoice' }, { status: 400 });
  }
}
