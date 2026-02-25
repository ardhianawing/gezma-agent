import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCCAuthPayload, ccUnauthorizedResponse } from '@/lib/auth-command-center';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const auth = getCCAuthPayload(req);
  if (!auth) return ccUnauthorizedResponse();

  try {
    const [totalAgencies, totalPilgrims, totalTrips, totalRevenue, recentAgencies] = await Promise.all([
      prisma.agency.count(),
      prisma.pilgrim.count(),
      prisma.trip.count(),
      prisma.paymentRecord.aggregate({ _sum: { amount: true } }),
      prisma.agency.findMany({
        orderBy: { createdAt: 'desc' },
        take: 5,
        select: { id: true, name: true, ppiuStatus: true, createdAt: true, _count: { select: { pilgrims: true } } },
      }),
    ]);

    return NextResponse.json({
      totalAgencies,
      totalPilgrims,
      totalTrips,
      totalRevenue: totalRevenue._sum.amount || 0,
      recentAgencies,
    });
  } catch (error) {
    logger.error('GET /api/command-center/stats error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
