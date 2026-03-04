import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { createMarketplaceReviewSchema } from '@/lib/validations/marketplace';
import { logger } from '@/lib/logger';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { id } = await params;

  try {
    const item = await prisma.marketplaceItem.findUnique({ where: { id } });
    if (!item) {
      return NextResponse.json({ error: 'Item tidak ditemukan' }, { status: 404 });
    }

    const body = await req.json();
    const parsed = createMarketplaceReviewSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validasi gagal', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Get user info
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { name: true, agency: { select: { name: true } } },
    });

    if (!user) {
      return unauthorizedResponse();
    }

    // Check existing review
    const existing = await prisma.marketplaceReview.findUnique({
      where: { itemId_userId: { itemId: id, userId: auth.userId } },
    });

    if (existing) {
      return NextResponse.json({ error: 'Anda sudah memberikan review untuk item ini' }, { status: 409 });
    }

    const review = await prisma.marketplaceReview.create({
      data: {
        itemId: id,
        userId: auth.userId,
        userName: user.name,
        agencyName: user.agency.name,
        rating: parsed.data.rating,
        comment: parsed.data.comment,
      },
    });

    // Update item rating
    const allReviews = await prisma.marketplaceReview.findMany({
      where: { itemId: id },
      select: { rating: true },
    });
    const avgRating = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    await prisma.marketplaceItem.update({
      where: { id },
      data: {
        rating: Math.round(avgRating * 10) / 10,
        reviewCount: allReviews.length,
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (error) {
    logger.error('POST /api/marketplace/[id]/reviews error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
