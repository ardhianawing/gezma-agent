import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCCAuthPayload, ccUnauthorizedResponse } from '@/lib/auth-command-center';
import { createMarketplaceItemSchema } from '@/lib/validations/marketplace';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const auth = getCCAuthPayload(req);
  if (!auth) return ccUnauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';

  const where: Record<string, unknown> = {};
  if (category) where.category = category;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { vendor: { contains: search, mode: 'insensitive' } },
    ];
  }

  try {
    const data = await prisma.marketplaceItem.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      include: { _count: { select: { reviews: true } } },
    });
    return NextResponse.json({ data });
  } catch (error) {
    logger.error('GET /api/command-center/marketplace error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = getCCAuthPayload(req);
  if (!auth) return ccUnauthorizedResponse();

  try {
    const body = await req.json();
    const parsed = createMarketplaceItemSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validasi gagal', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const item = await prisma.marketplaceItem.create({
      data: {
        ...parsed.data,
        details: JSON.parse(JSON.stringify(parsed.data.details)),
        createdBy: auth.adminId,
      },
    });

    return NextResponse.json(item, { status: 201 });
  } catch (error) {
    logger.error('POST /api/command-center/marketplace error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
