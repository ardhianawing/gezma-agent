import { NextRequest, NextResponse } from 'next/server';
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
    return NextResponse.json({
      stats: {
        activeCampaigns: 8,
        totalRaised: 450000000,
        totalDonors: 1240,
        goodsAvailable: 45,
        activeFinancings: 3,
        peopleImpacted: 530,
      },
      recentCampaigns: [
        {
          id: 'c1',
          title: 'Renovasi Masjid Al-Ikhlas Bekasi',
          category: 'masjid',
          targetAmount: 200000000,
          currentAmount: 145000000,
          deadline: '2026-06-30',
          imageUrl: null,
          _count: { donations: 234 },
        },
        {
          id: 'c2',
          title: 'Bantu Korban Banjir Demak',
          category: 'bencana',
          targetAmount: 100000000,
          currentAmount: 78000000,
          deadline: '2026-05-15',
          imageUrl: null,
          _count: { donations: 189 },
        },
        {
          id: 'c3',
          title: 'Beasiswa Yatim Berprestasi 2026',
          category: 'yatim',
          targetAmount: 150000000,
          currentAmount: 92000000,
          deadline: '2026-08-01',
          imageUrl: null,
          _count: { donations: 156 },
        },
      ],
    });
  } catch (error) {
    logger.error('GET /api/foundation/stats error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
