import { NextRequest, NextResponse } from 'next/server';
import { getPilgrimPayload } from '@/lib/auth-pilgrim';
import { prisma } from '@/lib/prisma';
import { PILGRIM_BADGE_DEFINITIONS } from '@/lib/services/pilgrim-gamification.service';

export async function GET(req: NextRequest) {
  try {
    const payload = getPilgrimPayload(req);
    if (!payload) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    const earnedBadges = await prisma.pilgrimBadge.findMany({
      where: { pilgrimId: payload.pilgrimId },
    });

    const earnedKeys = new Set(earnedBadges.map(b => b.badgeKey));

    const allBadges = PILGRIM_BADGE_DEFINITIONS.map(def => {
      const earned = earnedBadges.find(b => b.badgeKey === def.key);
      return {
        key: def.key,
        name: def.name,
        description: def.description,
        icon: def.icon,
        earned: earnedKeys.has(def.key),
        earnedAt: earned?.earnedAt || null,
      };
    });

    return NextResponse.json({ data: allBadges });
  } catch (error) {
    console.error('GET /api/pilgrim-portal/gamification/badges error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
