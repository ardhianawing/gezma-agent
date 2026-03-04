import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'popular';
  const city = searchParams.get('city') || '';
  const minRating = parseFloat(searchParams.get('minRating') || '0');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  const where: Record<string, unknown> = { isActive: true };

  if (category) {
    where.category = category;
  }

  if (city) {
    where.city = city;
  }

  if (minRating > 0) {
    where.rating = { gte: minRating };
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { vendor: { contains: search, mode: 'insensitive' } },
      { description: { contains: search, mode: 'insensitive' } },
    ];
  }

  let orderBy: Record<string, string>;
  switch (sort) {
    case 'rating':
      orderBy = { rating: 'desc' };
      break;
    case 'price_asc':
      orderBy = { priceAmount: 'asc' };
      break;
    default:
      orderBy = { reviewCount: 'desc' };
  }

  try {
    const [data, total] = await Promise.all([
      prisma.marketplaceItem.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.marketplaceItem.count({ where }),
    ]);

    return NextResponse.json({ data, total, page, limit });
  } catch (error) {
    logger.error('GET /api/marketplace error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
