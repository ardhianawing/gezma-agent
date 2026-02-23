import { NextRequest, NextResponse } from 'next/server';
import { getPilgrimPayload } from '@/lib/auth-pilgrim';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const payload = getPilgrimPayload(req);
    if (!payload) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    const { doaId, favorite } = await req.json();

    if (!doaId || typeof favorite !== 'boolean') {
      return NextResponse.json({ error: 'doaId dan favorite diperlukan' }, { status: 400 });
    }

    if (favorite) {
      await prisma.pilgrimDoaFavorite.upsert({
        where: {
          pilgrimId_doaId: {
            pilgrimId: payload.pilgrimId,
            doaId,
          },
        },
        create: {
          pilgrimId: payload.pilgrimId,
          doaId,
        },
        update: {},
      });
    } else {
      await prisma.pilgrimDoaFavorite.deleteMany({
        where: {
          pilgrimId: payload.pilgrimId,
          doaId,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Doa favorite error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
