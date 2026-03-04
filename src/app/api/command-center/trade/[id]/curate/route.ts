import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCCAuthPayload, ccUnauthorizedResponse } from '@/lib/auth-command-center';
import { curateTradeProductSchema } from '@/lib/validations/trade';
import { rateLimit } from '@/lib/rate-limiter';
import { logger } from '@/lib/logger';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getCCAuthPayload(req);
  if (!auth) return ccUnauthorizedResponse();

  const { allowed } = rateLimit(req, { limit: 10, window: 60 });
  if (!allowed) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan, coba lagi nanti' }, { status: 429 });
  }

  const { id } = await params;

  try {
    const product = await prisma.tradeProduct.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 });
    }

    if (product.status !== 'pending') {
      return NextResponse.json({ error: 'Hanya produk pending yang bisa dikurasi' }, { status: 400 });
    }

    const body = await req.json();
    const parsed = curateTradeProductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validasi gagal', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updated = await prisma.tradeProduct.update({
      where: { id },
      data: {
        status: parsed.data.status,
        rejectionReason: parsed.data.status === 'rejected' ? parsed.data.rejectionReason : null,
        curatedBy: auth.adminId,
        curatedAt: new Date(),
      },
    });

    return NextResponse.json(updated);
  } catch (error) {
    logger.error('PATCH /api/command-center/trade/[id]/curate error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
