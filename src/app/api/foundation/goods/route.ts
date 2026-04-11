import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { rateLimit } from '@/lib/rate-limiter';
import { logger } from '@/lib/logger';
import { createGoodsSchema } from '@/lib/validations/foundation';

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { allowed } = rateLimit(req, { limit: 30, window: 60 });
  if (!allowed) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan' }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '12', 10);
  const category = searchParams.get('category') || undefined;
  const status = searchParams.get('status') || undefined;

  try {
    const where: Record<string, unknown> = {};
    if (category) where.category = category;
    if (status) where.status = status;

    const [goods, total] = await Promise.all([
      prisma.foundationGoods.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: { agency: { select: { name: true } } },
      }),
      prisma.foundationGoods.count({ where }),
    ]);

    return NextResponse.json({
      goods,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    logger.error('GET /api/foundation/goods error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { allowed } = rateLimit(req, { limit: 10, window: 60 });
  if (!allowed) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = createGoodsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const goods = await prisma.foundationGoods.create({
      data: {
        ...parsed.data,
        imageUrl: parsed.data.imageUrl || null,
        agencyId: auth.agencyId,
      },
    });

    return NextResponse.json(goods, { status: 201 });
  } catch (error) {
    logger.error('POST /api/foundation/goods error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
