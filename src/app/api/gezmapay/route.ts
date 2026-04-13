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

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '10', 10);

  try {
    const wallet = await prisma.gezmaPayWallet.findUnique({
      where: { agencyId: auth.agencyId },
    });

    if (!wallet) {
      return NextResponse.json({
        wallet: { balance: 0, currency: 'IDR' },
        transactions: [],
        pagination: { page: 1, limit, total: 0, totalPages: 0 },
      });
    }

    const [transactions, total] = await Promise.all([
      prisma.gezmaPayTransaction.findMany({
        where: { walletId: wallet.id },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.gezmaPayTransaction.count({
        where: { walletId: wallet.id },
      }),
    ]);

    return NextResponse.json({
      wallet: {
        balance: wallet.balance,
        currency: wallet.currency,
      },
      transactions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('GET /api/gezmapay error', { error: String(error) });
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
    const { amount } = body;

    if (typeof amount !== 'number' || amount <= 0 || amount > 100000000) {
      return NextResponse.json({ error: 'Jumlah tidak valid (maks Rp 100 juta)' }, { status: 400 });
    }

    const result = await prisma.$transaction(async (tx) => {
      let wallet = await tx.gezmaPayWallet.findUnique({
        where: { agencyId: auth.agencyId },
      });

      if (!wallet) {
        wallet = await tx.gezmaPayWallet.create({
          data: {
            agencyId: auth.agencyId,
            balance: 0,
            currency: 'IDR',
          },
        });
      }

      const newBalance = wallet.balance + amount;

      const updatedWallet = await tx.gezmaPayWallet.update({
        where: { id: wallet.id },
        data: { balance: newBalance },
      });

      await tx.gezmaPayTransaction.create({
        data: {
          walletId: wallet.id,
          type: 'topup',
          amount,
          description: `Top up saldo Rp ${amount.toLocaleString('id-ID')}`,
          status: 'completed',
          balanceAfter: newBalance,
        },
      });

      return updatedWallet;
    });

    return NextResponse.json({
      wallet: {
        balance: result.balance,
        currency: result.currency,
      },
    });
  } catch (error) {
    logger.error('POST /api/gezmapay error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
