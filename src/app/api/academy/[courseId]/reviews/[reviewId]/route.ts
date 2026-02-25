import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { logger } from '@/lib/logger';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string; reviewId: string }> }
) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { reviewId } = await params;

  try {
    const review = await prisma.academyCourseReview.findUnique({
      where: { id: reviewId },
    });

    if (!review) {
      return NextResponse.json({ error: 'Ulasan tidak ditemukan' }, { status: 404 });
    }

    // Only own review can be deleted
    if (review.userId !== auth.userId) {
      return NextResponse.json({ error: 'Tidak memiliki izin untuk menghapus ulasan ini' }, { status: 403 });
    }

    await prisma.academyCourseReview.delete({ where: { id: reviewId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('DELETE /api/academy/[courseId]/reviews/[reviewId] error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
