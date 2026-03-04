import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { checkPermission } from '@/lib/auth-permissions';
import { PERMISSIONS } from '@/lib/permissions';
import { updateTradeProductSchema } from '@/lib/validations/trade';
import { logger } from '@/lib/logger';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const denied = await checkPermission(auth, PERMISSIONS.TRADE_VIEW);
  if (denied) return denied;

  const { id } = await params;

  try {
    const product = await prisma.tradeProduct.findUnique({
      where: { id },
      include: {
        _count: { select: { inquiries: true } },
      },
    });

    if (!product) {
      return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ data: product });
  } catch (error) {
    logger.error('GET /api/trade/[id] error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const denied = await checkPermission(auth, PERMISSIONS.TRADE_SUBMIT);
  if (denied) return denied;

  const { id } = await params;

  try {
    const product = await prisma.tradeProduct.findUnique({ where: { id } });
    if (!product) {
      return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 });
    }

    // Only own agency's pending products
    if (product.agencyId !== auth.agencyId) {
      return NextResponse.json({ error: 'Anda tidak memiliki akses' }, { status: 403 });
    }

    if (product.status !== 'pending') {
      return NextResponse.json({ error: 'Hanya produk pending yang bisa diupdate' }, { status: 400 });
    }

    const body = await req.json();
    const parsed = updateTradeProductSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validasi gagal', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const updated = await prisma.tradeProduct.update({
      where: { id },
      data: parsed.data,
    });

    return NextResponse.json(updated);
  } catch (error) {
    logger.error('PUT /api/trade/[id] error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
