import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { logger } from '@/lib/logger';

const MOCK_GOODS_DETAIL = {
  id: 'g1',
  title: 'Baju Layak Pakai Anak-anak',
  description: 'Pakaian anak usia 3–10 tahun, kondisi baik, sudah dicuci dan disetrika.',
  category: 'pakaian',
  condition: 'baik',
  quantity: 50,
  unit: 'pcs',
  status: 'available',
  imageUrl: null,
  agencyId: 'agency-1',
  agency: { name: 'Agen Yayasan Bekasi' },
  createdAt: '2026-03-10T08:00:00.000Z',
};

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const goods = { ...MOCK_GOODS_DETAIL, id: params.id };
    return NextResponse.json(goods);
  } catch (error) {
    logger.error('GET /api/foundation/goods/[id] error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const body = await req.json();
    const { status } = body;

    if (!['available', 'requested', 'delivered'].includes(status)) {
      return NextResponse.json({ error: 'Status tidak valid' }, { status: 400 });
    }

    const updated = { ...MOCK_GOODS_DETAIL, id: params.id, status, updatedAt: new Date().toISOString() };
    return NextResponse.json(updated);
  } catch (error) {
    logger.error('PUT /api/foundation/goods/[id] error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('DELETE /api/foundation/goods/[id] error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
