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
    return NextResponse.json({ error: 'Terlalu banyak permintaan, coba lagi nanti' }, { status: 429 });
  }

  try {
    const data = await prisma.tradeProduct.findMany({
      where: { agencyId: auth.agencyId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data });
  } catch (error) {
    logger.error('GET /api/trade/my-products error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
