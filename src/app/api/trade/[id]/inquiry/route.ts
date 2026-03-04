import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { createTradeInquirySchema } from '@/lib/validations/trade';
import { rateLimit } from '@/lib/rate-limiter';
import { logger } from '@/lib/logger';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { allowed } = rateLimit(req, { limit: 10, window: 60 });
  if (!allowed) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan, coba lagi nanti' }, { status: 429 });
  }

  const { id } = await params;

  try {
    const product = await prisma.tradeProduct.findUnique({ where: { id } });
    if (!product || product.status !== 'active') {
      return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 });
    }

    const body = await req.json();
    const parsed = createTradeInquirySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validasi gagal', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { name: true },
    });
    if (!user) return unauthorizedResponse();

    const inquiry = await prisma.tradeInquiry.create({
      data: {
        productId: id,
        agencyId: auth.agencyId,
        userId: auth.userId,
        userName: user.name,
        message: parsed.data.message,
      },
    });

    // Increment inquiry count
    await prisma.tradeProduct.update({
      where: { id },
      data: { inquiryCount: { increment: 1 } },
    });

    return NextResponse.json(inquiry, { status: 201 });
  } catch (error) {
    logger.error('POST /api/trade/[id]/inquiry error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
