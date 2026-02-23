import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { getInvoice, cancelInvoice } from '@/lib/services/payment-gateway.service';

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
    console.error('GET /api/integrations/payment/invoices/[id] error:', error);
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
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan server';
    console.error('DELETE /api/integrations/payment/invoices/[id] error:', error);
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
