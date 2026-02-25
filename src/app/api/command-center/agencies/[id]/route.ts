import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCCAuthPayload, ccUnauthorizedResponse } from '@/lib/auth-command-center';
import { agencyStatusSchema } from '@/lib/validations/command-center';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = getCCAuthPayload(req);
  if (!auth) return ccUnauthorizedResponse();

  const { id } = await params;

  try {
    const agency = await prisma.agency.findUnique({
      where: { id },
      include: {
        users: { select: { id: true, name: true, email: true, role: true, isActive: true, lastLoginAt: true } },
        _count: { select: { pilgrims: true, packages: true, trips: true } },
      },
    });

    if (!agency) {
      return NextResponse.json({ error: 'Agency tidak ditemukan' }, { status: 404 });
    }

    // Get revenue stats
    const revenue = await prisma.paymentRecord.aggregate({
      where: { pilgrim: { agencyId: id } },
      _sum: { amount: true },
    });

    return NextResponse.json({
      ...agency,
      totalRevenue: revenue._sum.amount || 0,
    });
  } catch (error) {
    logger.error('GET /api/command-center/agencies/[id] error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = getCCAuthPayload(req);
  if (!auth) return ccUnauthorizedResponse();

  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = agencyStatusSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Data tidak valid', fields: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const agency = await prisma.agency.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json(agency);
  } catch (error) {
    logger.error('PATCH /api/command-center/agencies/[id] error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
