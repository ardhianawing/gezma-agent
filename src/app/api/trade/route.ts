import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { checkPermission } from '@/lib/auth-permissions';
import { PERMISSIONS } from '@/lib/permissions';
import { createTradeProductSchema } from '@/lib/validations/trade';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const denied = await checkPermission(auth, PERMISSIONS.TRADE_VIEW);
  if (denied) return denied;

  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  const where: Record<string, unknown> = { status: 'active' };

  if (category && category !== 'all') {
    where.category = category;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { producer: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  try {
    const [data, total] = await Promise.all([
      prisma.tradeProduct.findMany({
        where,
        orderBy: { rating: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.tradeProduct.count({ where }),
    ]);

    // Stats
    const stats = await prisma.tradeProduct.aggregate({
      where: { status: 'active' },
      _count: true,
    });

    const producerCount = await prisma.tradeProduct.groupBy({
      by: ['producer'],
      where: { status: 'active' },
    });

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      stats: {
        totalProducts: stats._count,
        activeListings: stats._count,
        producers: producerCount.length,
      },
    });
  } catch (error) {
    logger.error('GET /api/trade error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const denied = await checkPermission(auth, PERMISSIONS.TRADE_SUBMIT);
  if (denied) return denied;

  try {
    const body = await req.json();
    const parsed = createTradeProductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validasi gagal', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { name: true },
    });
    if (!user) return unauthorizedResponse();

    const product = await prisma.tradeProduct.create({
      data: {
        ...parsed.data,
        status: 'pending',
        agencyId: auth.agencyId,
        submittedBy: auth.userId,
        submitterName: user.name,
      },
    });

    return NextResponse.json(product, { status: 201 });
  } catch (error) {
    logger.error('POST /api/trade error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
