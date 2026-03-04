import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCCAuthPayload, ccUnauthorizedResponse } from '@/lib/auth-command-center';
import { updateMarketplaceItemSchema } from '@/lib/validations/marketplace';
import { logger } from '@/lib/logger';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getCCAuthPayload(req);
  if (!auth) return ccUnauthorizedResponse();

  const { id } = await params;

  try {
    const existing = await prisma.marketplaceItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Item tidak ditemukan' }, { status: 404 });
    }

    const body = await req.json();
    const parsed = updateMarketplaceItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validasi gagal', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = { ...parsed.data } as Record<string, unknown>;
    if (data.details) {
      data.details = JSON.parse(JSON.stringify(data.details));
    }

    const item = await prisma.marketplaceItem.update({ where: { id }, data });
    return NextResponse.json(item);
  } catch (error) {
    logger.error('PUT /api/command-center/marketplace/[id] error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getCCAuthPayload(req);
  if (!auth) return ccUnauthorizedResponse();

  const { id } = await params;

  try {
    const existing = await prisma.marketplaceItem.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Item tidak ditemukan' }, { status: 404 });
    }

    await prisma.marketplaceItem.delete({ where: { id } });
    return NextResponse.json({ message: 'Item berhasil dihapus' });
  } catch (error) {
    logger.error('DELETE /api/command-center/marketplace/[id] error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
