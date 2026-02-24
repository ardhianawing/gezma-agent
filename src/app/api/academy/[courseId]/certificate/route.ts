import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { generateCertificatePdf } from '@/lib/services/academy-certificate.service';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { courseId } = await params;

  try {
    // Check course progress is completed
    const progress = await prisma.academyCourseProgress.findUnique({
      where: { userId_courseId: { userId: auth.userId, courseId } },
    });

    if (!progress || progress.status !== 'completed') {
      return NextResponse.json({ error: 'Kursus belum selesai' }, { status: 400 });
    }

    // Check quiz passed
    const quiz = await prisma.academyQuiz.findUnique({ where: { courseId } });
    if (!quiz) {
      return NextResponse.json({ error: 'Quiz tidak ditemukan' }, { status: 404 });
    }

    const bestAttempt = await prisma.academyQuizAttempt.findFirst({
      where: { quizId: quiz.id, userId: auth.userId, passed: true },
      orderBy: { score: 'desc' },
    });

    if (!bestAttempt) {
      return NextResponse.json({ error: 'Belum lulus quiz' }, { status: 400 });
    }

    // Get user and course info
    const [user, course] = await Promise.all([
      prisma.user.findUnique({ where: { id: auth.userId }, select: { name: true } }),
      prisma.academyCourse.findUnique({ where: { id: courseId }, select: { title: true } }),
    ]);

    if (!user || !course) {
      return NextResponse.json({ error: 'Data tidak ditemukan' }, { status: 404 });
    }

    const pdfBuffer = generateCertificatePdf(
      { name: user.name },
      { title: course.title },
      { score: bestAttempt.score, attemptedAt: bestAttempt.attemptedAt },
    );

    return new NextResponse(new Uint8Array(pdfBuffer), {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="sertifikat-${course.title.replace(/[^a-zA-Z0-9]/g, '-')}.pdf"`,
      },
    });
  } catch (error) {
    console.error('GET /api/academy/[courseId]/certificate error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
