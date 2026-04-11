import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { rateLimit } from '@/lib/rate-limiter';
import { logger } from '@/lib/logger';
import { createCampaignSchema } from '@/lib/validations/foundation';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const campaign = await prisma.foundationCampaign.findUnique({
      where: { id: params.id },
      include: {
        donations: {
          where: { status: 'completed' },
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        impactReports: { orderBy: { createdAt: 'desc' } },
        _count: { select: { donations: true } },
      },
    });

    if (!campaign) {
      return NextResponse.json({ error: 'Kampanye tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(campaign);
  } catch (error) {
    logger.error('GET /api/foundation/campaigns/[id] error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { allowed } = rateLimit(req, { limit: 10, window: 60 });
  if (!allowed) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = createCampaignSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const existing = await prisma.foundationCampaign.findFirst({
      where: { id: params.id, agencyId: auth.agencyId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Kampanye tidak ditemukan atau akses ditolak' }, { status: 404 });
    }

    const updated = await prisma.foundationCampaign.update({
      where: { id: params.id },
      data: {
        ...parsed.data,
        deadline: parsed.data.deadline ? new Date(parsed.data.deadline) : undefined,
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    logger.error('PUT /api/foundation/campaigns/[id] error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const existing = await prisma.foundationCampaign.findFirst({
      where: { id: params.id, agencyId: auth.agencyId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Kampanye tidak ditemukan atau akses ditolak' }, { status: 404 });
    }

    await prisma.foundationCampaign.update({
      where: { id: params.id },
      data: { status: 'cancelled' },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('DELETE /api/foundation/campaigns/[id] error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
