import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { rateLimit } from '@/lib/rate-limiter';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { allowed } = rateLimit(req, { limit: 10, window: 60 });
  if (!allowed) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan, coba lagi nanti' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const { savingsId, amount, method, notes } = body;

    if (!savingsId || !amount || !method) {
      return NextResponse.json({ error: 'ID tabungan, jumlah, dan metode wajib diisi' }, { status: 400 });
    }

    if (typeof amount !== 'number' || amount <= 0) {
      return NextResponse.json({ error: 'Jumlah setoran tidak valid' }, { status: 400 });
    }

    const validMethods = ['transfer', 'cash', 'auto_debit'];
    if (!validMethods.includes(method)) {
      return NextResponse.json({ error: 'Metode pembayaran tidak valid' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      const savings = await tx.umrahSavings.findFirst({
        where: { id: savingsId, agencyId: auth.agencyId },
      });

      if (!savings) {
        throw new Error('NOT_FOUND');
      }

      if (savings.status !== 'active') {
        throw new Error('INACTIVE');
      }

      const newBalance = savings.currentAmount + amount;

      const updatedSavings = await tx.umrahSavings.update({
        where: { id: savingsId },
        data: {
          currentAmount: newBalance,
          status: newBalance >= savings.targetAmount ? 'completed' : 'active',
        },
      });

      const deposit = await tx.umrahSavingsDeposit.create({
        data: {
          savingsId,
          amount,
          method,
          notes: notes || null,
          balanceAfter: newBalance,
        },
      });

      return { deposit, savings: updatedSavings };
    });

    return NextResponse.json({
      deposit: result.deposit,
      savings: result.savings,
    });
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);

    if (errorMessage === 'NOT_FOUND') {
      return NextResponse.json({ error: 'Rencana tabungan tidak ditemukan' }, { status: 404 });
    }

    if (errorMessage === 'INACTIVE') {
      return NextResponse.json({ error: 'Rencana tabungan tidak aktif' }, { status: 400 });
    }

    logger.error('POST /api/tabungan/deposit error', { error: errorMessage });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
