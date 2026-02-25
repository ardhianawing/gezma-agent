import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { logger } from '@/lib/logger';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { courseId } = await params;

  try {
    const quiz = await prisma.academyQuiz.findUnique({
      where: { courseId },
      include: {
        questions: {
          orderBy: { order: 'asc' },
        },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz tidak ditemukan' }, { status: 404 });
    }

    // MASK correctIndex from response
    const maskedQuestions = quiz.questions.map(q => ({
      id: q.id,
      question: q.question,
      options: q.options,
      order: q.order,
    }));

    // Get user's best attempt
    const bestAttempt = await prisma.academyQuizAttempt.findFirst({
      where: { quizId: quiz.id, userId: auth.userId },
      orderBy: { score: 'desc' },
    });

    return NextResponse.json({
      id: quiz.id,
      courseId: quiz.courseId,
      title: quiz.title,
      passScore: quiz.passScore,
      questions: maskedQuestions,
      totalQuestions: maskedQuestions.length,
      bestAttempt: bestAttempt ? {
        score: bestAttempt.score,
        passed: bestAttempt.passed,
        attemptedAt: bestAttempt.attemptedAt,
      } : null,
    });
  } catch (error) {
    logger.error('GET /api/academy/[courseId]/quiz error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  // Only admin/owner can create quizzes
  if (!['owner', 'admin'].includes(auth.role)) {
    return NextResponse.json({ error: 'Tidak memiliki izin' }, { status: 403 });
  }

  const { courseId } = await params;

  try {
    const body = await req.json();
    const { title, passScore, questions } = body;

    if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
      return NextResponse.json({ error: 'title dan questions wajib diisi' }, { status: 400 });
    }

    // Verify course exists
    const course = await prisma.academyCourse.findUnique({ where: { id: courseId } });
    if (!course) {
      return NextResponse.json({ error: 'Kursus tidak ditemukan' }, { status: 404 });
    }

    // Check if quiz already exists
    const existing = await prisma.academyQuiz.findUnique({ where: { courseId } });
    if (existing) {
      return NextResponse.json({ error: 'Quiz sudah ada untuk kursus ini' }, { status: 409 });
    }

    const quiz = await prisma.academyQuiz.create({
      data: {
        courseId,
        title,
        passScore: passScore ?? 70,
        questions: {
          create: questions.map((q: { question: string; options: string[]; correctIndex: number }, idx: number) => ({
            question: q.question,
            options: q.options,
            correctIndex: q.correctIndex,
            order: idx,
          })),
        },
      },
      include: { questions: true },
    });

    return NextResponse.json(quiz, { status: 201 });
  } catch (error) {
    logger.error('POST /api/academy/[courseId]/quiz error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
