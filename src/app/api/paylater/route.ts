import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { rateLimit } from '@/lib/rate-limiter';
import { logger } from '@/lib/logger';

const MARGIN_RATE = 0.015; // 1.5% per month

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { allowed } = rateLimit(req, { limit: 30, window: 60 });
  if (!allowed) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan, coba lagi nanti' }, { status: 429 });
  }

  try {
    const applications = await prisma.payLaterApplication.findMany({
      where: { agencyId: auth.agencyId },
      orderBy: { createdAt: 'desc' },
      include: {
        installments: {
          orderBy: { installmentNo: 'asc' },
        },
      },
    });

    return NextResponse.json({ applications });
  } catch (error) {
    logger.error('GET /api/paylater error', { error: String(error) });
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
    const { pilgrimName, pilgrimPhone, totalAmount, tenorMonths, akadType } = body;

    if (!pilgrimName || !pilgrimPhone || !totalAmount || !tenorMonths) {
      return NextResponse.json({ error: 'Semua field wajib diisi' }, { status: 400 });
    }

    if (typeof totalAmount !== 'number' || totalAmount <= 0) {
      return NextResponse.json({ error: 'Total biaya tidak valid' }, { status: 400 });
    }

    const validTenors = [3, 6, 12];
    if (!validTenors.includes(tenorMonths)) {
      return NextResponse.json({ error: 'Tenor tidak valid. Pilih 3, 6, atau 12 bulan' }, { status: 400 });
    }

    const validAkad = ['murabahah', 'ijarah'];
    if (akadType && !validAkad.includes(akadType)) {
      return NextResponse.json({ error: 'Jenis akad tidak valid' }, { status: 400 });
    }

    // Calculate monthly amount: total * (1 + marginRate * tenorMonths / 12) / tenorMonths
    const monthlyAmount = (totalAmount * (1 + MARGIN_RATE * tenorMonths / 12)) / tenorMonths;

    const application = await prisma.$transaction(async (tx) => {
      const app = await tx.payLaterApplication.create({
        data: {
          agencyId: auth.agencyId,
          pilgrimName,
          pilgrimPhone,
          totalAmount,
          tenorMonths,
          monthlyAmount: Math.round(monthlyAmount),
          akadType: akadType || 'murabahah',
          marginRate: MARGIN_RATE,
          status: 'pending',
        },
      });

      // Create installment schedule
      const installments = [];
      const now = new Date();
      for (let i = 1; i <= tenorMonths; i++) {
        const dueDate = new Date(now);
        dueDate.setMonth(dueDate.getMonth() + i);

        installments.push({
          applicationId: app.id,
          installmentNo: i,
          amount: Math.round(monthlyAmount),
          dueDate,
          status: 'pending',
        });
      }

      await tx.payLaterInstallment.createMany({
        data: installments,
      });

      return tx.payLaterApplication.findUnique({
        where: { id: app.id },
        include: {
          installments: {
            orderBy: { installmentNo: 'asc' },
          },
        },
      });
    });

    return NextResponse.json({ application });
  } catch (error) {
    logger.error('POST /api/paylater error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
