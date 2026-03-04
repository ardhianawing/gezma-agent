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
    const savings = await prisma.umrahSavings.findFirst({
      where: { agencyId: auth.agencyId },
      orderBy: { createdAt: 'desc' },
      include: {
        deposits: {
          orderBy: { createdAt: 'desc' },
        },
      },
    });

    return NextResponse.json({
      savings: savings || null,
    });
  } catch (error) {
    logger.error('GET /api/tabungan error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { allowed } = rateLimit(req, { limit: 10, window: 60 });
  if (!allowed) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan, coba lagi nanti' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { pilgrimName, targetAmount, targetDate, packageName } = body;

    if (!pilgrimName || !targetAmount || !targetDate) {
      return NextResponse.json({ error: 'Nama jamaah, target tabungan, dan target tanggal wajib diisi' }, { status: 400 });
    }

    if (typeof targetAmount !== 'number' || targetAmount <= 0) {
      return NextResponse.json({ error: 'Target tabungan tidak valid' }, { status: 400 });
    }

    const savings = await prisma.umrahSavings.create({
      data: {
        agencyId: auth.agencyId,
        pilgrimName,
        targetAmount,
        targetDate: new Date(targetDate),
        packageName: packageName || null,
        status: 'active',
      },
      include: {
        deposits: true,
      },
    });

    return NextResponse.json({ savings });
  } catch (error) {
    logger.error('POST /api/tabungan error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
