import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { rateLimit } from '@/lib/rate-limiter';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { allowed } = rateLimit(req, { limit: 30, window: 60 });
  if (!allowed) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan' }, { status: 429 });
  }

  try {
    const [
      activeCampaigns,
      totalRaisedResult,
      totalDonors,
      goodsAvailable,
      activeFinancings,
      recentCampaigns,
    ] = await Promise.all([
      prisma.foundationCampaign.count({ where: { status: 'active' } }),
      prisma.foundationDonation.aggregate({
        where: { status: 'completed' },
        _sum: { amount: true },
      }),
      prisma.foundationDonation.count({ where: { status: 'completed' } }),
      prisma.foundationGoods.count({ where: { status: 'available' } }),
      prisma.foundationFinancing.count({ where: { status: { in: ['approved', 'active'] } } }),
      prisma.foundationCampaign.findMany({
        where: { status: 'active' },
        orderBy: { createdAt: 'desc' },
        take: 3,
        select: {
          id: true,
          title: true,
          category: true,
          targetAmount: true,
          currentAmount: true,
          deadline: true,
          imageUrl: true,
          _count: { select: { donations: true } },
        },
      }),
    ]);

    return NextResponse.json({
      stats: {
        activeCampaigns,
        totalRaised: totalRaisedResult._sum.amount || 0,
        totalDonors,
        goodsAvailable,
        activeFinancings,
        // Approximate: 5 people impacted per donation on average
        peopleImpacted: totalDonors * 5,
      },
      recentCampaigns,
    });
  } catch (error) {
    logger.error('GET /api/foundation/stats error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
