import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const goods = await prisma.foundationGoods.findUnique({
      where: { id: params.id },
      include: { agency: { select: { name: true } } },
    });

    if (!goods) {
      return NextResponse.json({ error: 'Barang tidak ditemukan' }, { status: 404 });
    }

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

    const existing = await prisma.foundationGoods.findFirst({
      where: { id: params.id, agencyId: auth.agencyId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Barang tidak ditemukan atau akses ditolak' }, { status: 404 });
    }

    const updated = await prisma.foundationGoods.update({
      where: { id: params.id },
      data: { status },
    });

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
    const existing = await prisma.foundationGoods.findFirst({
      where: { id: params.id, agencyId: auth.agencyId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Barang tidak ditemukan atau akses ditolak' }, { status: 404 });
    }

    await prisma.foundationGoods.delete({ where: { id: params.id } });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('DELETE /api/foundation/goods/[id] error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
