import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCCAuthPayload, ccUnauthorizedResponse } from '@/lib/auth-command-center';
import { rateLimit } from '@/lib/rate-limiter';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const auth = getCCAuthPayload(req);
  if (!auth) return ccUnauthorizedResponse();

  const { allowed } = rateLimit(req, { limit: 30, window: 60 });
  if (!allowed) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan, coba lagi nanti' }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || '';
  const category = searchParams.get('category') || '';

  const where: Record<string, unknown> = {};
  if (status) where.status = status;
  if (category) where.category = category;

  try {
    const data = await prisma.tradeProduct.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: {
        agency: { select: { name: true } },
        _count: { select: { inquiries: true } },
      },
    });

    return NextResponse.json({ data });
  } catch (error) {
    logger.error('GET /api/command-center/trade error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
