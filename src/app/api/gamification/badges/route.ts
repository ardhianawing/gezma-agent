import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { BADGE_DEFINITIONS } from '@/lib/services/gamification.service';

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const userBadges = await prisma.userBadge.findMany({
      where: { userId: auth.userId },
      select: { badgeKey: true, unlockedAt: true },
    });

    const unlockedMap = new Map(userBadges.map(b => [b.badgeKey, b.unlockedAt]));

    const badges = BADGE_DEFINITIONS.map(badge => ({
      key: badge.key,
      name: badge.name,
      emoji: badge.emoji,
      unlocked: unlockedMap.has(badge.key),
      unlockedAt: unlockedMap.get(badge.key) ?? null,
    }));

    return NextResponse.json({ badges });
  } catch (error) {
    console.error('GET /api/gamification/badges error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
