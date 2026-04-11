import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { rateLimit } from '@/lib/rate-limiter';
import { logger } from '@/lib/logger';
import { createCampaignSchema } from '@/lib/validations/foundation';

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
  const category = searchParams.get('category') || undefined;
  const status = searchParams.get('status') || 'active';

  try {
    const where: Record<string, unknown> = {};
    if (category) where.category = category;
    if (status !== 'all') where.status = status;

    const [campaigns, total] = await Promise.all([
      prisma.foundationCampaign.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
        include: {
          _count: { select: { donations: true } },
        },
      }),
      prisma.foundationCampaign.count({ where }),
    ]);

    return NextResponse.json({
      campaigns,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    logger.error('GET /api/foundation/campaigns error', { error: String(error) });
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
    const parsed = createCampaignSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { title, description, category, targetAmount, deadline, imageUrl } = parsed.data;

    const campaign = await prisma.foundationCampaign.create({
      data: {
        title,
        description,
        category,
        targetAmount,
        deadline: deadline ? new Date(deadline) : null,
        imageUrl: imageUrl || null,
        agencyId: auth.agencyId,
      },
    });

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    logger.error('POST /api/foundation/campaigns error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
