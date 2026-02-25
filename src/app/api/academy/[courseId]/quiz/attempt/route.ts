import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { logger } from '@/lib/logger';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { courseId } = await params;

  try {
    const body = await req.json();
    const { answers } = body;

    if (!answers || !Array.isArray(answers)) {
      return NextResponse.json({ error: 'answers wajib berupa array' }, { status: 400 });
    }

    // Get quiz with questions
    const quiz = await prisma.academyQuiz.findUnique({
      where: { courseId },
      include: {
        questions: { orderBy: { order: 'asc' } },
      },
    });

    if (!quiz) {
      return NextResponse.json({ error: 'Quiz tidak ditemukan' }, { status: 404 });
    }

    // Calculate score
    let correctAnswers = 0;
    const totalQuestions = quiz.questions.length;

    for (let i = 0; i < quiz.questions.length; i++) {
      const question = quiz.questions[i];
      const userAnswer = answers[i];
      if (userAnswer !== undefined && userAnswer !== null && userAnswer === question.correctIndex) {
        correctAnswers++;
      }
    }

    const score = totalQuestions > 0 ? Math.round((correctAnswers / totalQuestions) * 100) : 0;
    const passed = score >= quiz.passScore;

    // Store attempt
    const attempt = await prisma.academyQuizAttempt.create({
      data: {
        quizId: quiz.id,
        userId: auth.userId,
        answers: JSON.parse(JSON.stringify(answers)),
        score,
        passed,
      },
    });

    return NextResponse.json({
      attemptId: attempt.id,
      score,
      passed,
      correctAnswers,
      totalQuestions,
      passScore: quiz.passScore,
    });
  } catch (error) {
    logger.error('POST /api/academy/[courseId]/quiz/attempt error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
