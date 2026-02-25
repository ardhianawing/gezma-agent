import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { createReviewSchema } from '@/lib/validations/academy-review';
import { logger } from '@/lib/logger';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;

  try {
    const reviews = await prisma.academyCourseReview.findMany({
      where: { courseId },
      include: {
        user: { select: { id: true, name: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    // Calculate avg rating
    const totalRating = reviews.reduce((sum, r) => sum + r.rating, 0);
    const avgRating = reviews.length > 0 ? Math.round((totalRating / reviews.length) * 10) / 10 : 0;

    return NextResponse.json({
      reviews: reviews.map(r => ({
        id: r.id,
        rating: r.rating,
        comment: r.comment,
        userName: r.user.name,
        userId: r.user.id,
        createdAt: r.createdAt,
      })),
      avgRating,
      totalReviews: reviews.length,
    });
  } catch (error) {
    logger.error('GET /api/academy/[courseId]/reviews error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { courseId } = await params;

  try {
    const body = await req.json();
    const parsed = createReviewSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      return NextResponse.json({ error: 'Validasi gagal', errors }, { status: 400 });
    }

    const { rating, comment } = parsed.data;

    // Check course exists
    const course = await prisma.academyCourse.findUnique({ where: { id: courseId } });
    if (!course) {
      return NextResponse.json({ error: 'Kursus tidak ditemukan' }, { status: 404 });
    }

    // Check if already reviewed (unique constraint)
    const existing = await prisma.academyCourseReview.findUnique({
      where: { courseId_userId: { courseId, userId: auth.userId } },
    });
    if (existing) {
      return NextResponse.json({ error: 'Anda sudah memberikan ulasan untuk kursus ini' }, { status: 409 });
    }

    const review = await prisma.academyCourseReview.create({
      data: {
        courseId,
        userId: auth.userId,
        rating,
        comment: comment || null,
      },
      include: {
        user: { select: { name: true } },
      },
    });

    return NextResponse.json({
      id: review.id,
      rating: review.rating,
      comment: review.comment,
      userName: review.user.name,
      userId: review.userId,
      createdAt: review.createdAt,
    }, { status: 201 });
  } catch (error) {
    logger.error('POST /api/academy/[courseId]/reviews error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
