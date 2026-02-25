import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { calculateLevel } from '@/lib/services/gamification.service';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const [user, badgeCount, agency] = await Promise.all([
      prisma.user.findUnique({
        where: { id: auth.userId },
        select: { totalPoints: true, level: true },
      }),
      prisma.userBadge.count({ where: { userId: auth.userId } }),
      prisma.agency.findUnique({
        where: { id: auth.agencyId },
        select: { totalPoints: true },
      }),
    ]);

    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    // Calculate rank among all agencies
    const higherAgencies = await prisma.agency.count({
      where: { totalPoints: { gt: agency?.totalPoints ?? 0 } },
    });
    const rank = higherAgencies + 1;

    return NextResponse.json({
      totalPoints: user.totalPoints,
      level: calculateLevel(user.totalPoints),
      badgeCount,
      rank,
      agencyPoints: agency?.totalPoints ?? 0,
    });
  } catch (error) {
    logger.error('GET /api/gamification/stats error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
