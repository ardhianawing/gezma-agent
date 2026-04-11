import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const financing = await prisma.foundationFinancing.findFirst({
      where: { id: params.id, agencyId: auth.agencyId },
      include: { installments: { orderBy: { installmentNo: 'asc' } } },
    });

    if (!financing) {
      return NextResponse.json({ error: 'Pengajuan tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(financing);
  } catch (error) {
    logger.error('GET /api/foundation/financing/[id] error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const body = await req.json();
    const { notes } = body;

    const existing = await prisma.foundationFinancing.findFirst({
      where: { id: params.id, agencyId: auth.agencyId, status: 'pending' },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Pengajuan tidak ditemukan atau tidak dapat diubah' }, { status: 404 });
    }

    const updated = await prisma.foundationFinancing.update({
      where: { id: params.id },
      data: { notes },
    });

    return NextResponse.json(updated);
  } catch (error) {
    logger.error('PUT /api/foundation/financing/[id] error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
