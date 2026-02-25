import { NextRequest, NextResponse } from 'next/server';
import { getPilgrimPayload } from '@/lib/auth-pilgrim';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    const payload = getPilgrimPayload(req);
    if (!payload) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    const [doas, favorites] = await Promise.all([
      prisma.doaPrayer.findMany({
        where: { agencyId: payload.agencyId },
        orderBy: { order: 'asc' },
      }),
      prisma.pilgrimDoaFavorite.findMany({
        where: { pilgrimId: payload.pilgrimId },
        select: { doaId: true },
      }),
    ]);

    const favoriteIds = favorites.map(f => f.doaId);

    return NextResponse.json({
      doas: doas.map(d => ({
        id: d.id,
        title: d.title,
        category: d.category,
        arabic: d.arabic,
        latin: d.latin,
        translation: d.translation,
        occasion: d.occasion,
        source: d.source,
        emoji: d.emoji,
      })),
      favoriteIds,
    });
  } catch (error) {
    logger.error('Doa fetch error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
