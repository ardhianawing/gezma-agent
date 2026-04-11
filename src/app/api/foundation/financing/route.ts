import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { rateLimit } from '@/lib/rate-limiter';
import { logger } from '@/lib/logger';
import { createFinancingSchema } from '@/lib/validations/foundation';

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { allowed } = rateLimit(req, { limit: 30, window: 60 });
  if (!allowed) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan' }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);

  try {
    const where = { agencyId: auth.agencyId };

    const [financings, total] = await Promise.all([
      prisma.foundationFinancing.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          installments: { orderBy: { installmentNo: 'asc' } },
        },
      }),
      prisma.foundationFinancing.count({ where }),
    ]);

    return NextResponse.json({
      financings,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    logger.error('GET /api/foundation/financing error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { allowed } = rateLimit(req, { limit: 5, window: 60 });
  if (!allowed) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = createFinancingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { amount, purpose, tenorMonths } = parsed.data;
    const monthlyAmount = amount / tenorMonths;

    const financing = await prisma.foundationFinancing.create({
      data: {
        agencyId: auth.agencyId,
        amount,
        purpose,
        tenorMonths,
        monthlyAmount,
        status: 'pending',
      },
    });

    return NextResponse.json(financing, { status: 201 });
  } catch (error) {
    logger.error('POST /api/foundation/financing error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
