import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { logger } from '@/lib/logger';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { id } = await params;

  try {
    const item = await prisma.marketplaceItem.findUnique({
      where: { id },
      include: {
        reviews: {
          orderBy: { createdAt: 'desc' },
          take: 20,
        },
      },
    });

    if (!item) {
      return NextResponse.json({ error: 'Item tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ data: item });
  } catch (error) {
    logger.error('GET /api/marketplace/[id] error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
