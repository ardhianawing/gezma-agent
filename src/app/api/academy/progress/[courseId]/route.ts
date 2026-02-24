import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { courseId } = await params;
  const body = await req.json();
  const { lessonId } = body as { lessonId: string };

  if (!lessonId) {
    return NextResponse.json({ error: 'lessonId diperlukan' }, { status: 400 });
  }

  // Verify lesson belongs to course
  const lesson = await prisma.academyLesson.findFirst({
    where: { id: lessonId, courseId },
  });
  if (!lesson) {
    return NextResponse.json({ error: 'Pelajaran tidak ditemukan di kursus ini' }, { status: 404 });
  }

  // Get course total lessons
  const course = await prisma.academyCourse.findUnique({
    where: { id: courseId },
    select: { totalLessons: true },
  });
  if (!course) {
    return NextResponse.json({ error: 'Kursus tidak ditemukan' }, { status: 404 });
  }

  // Get or create progress
  let progress = await prisma.academyCourseProgress.findUnique({
    where: { userId_courseId: { userId: auth.userId, courseId } },
  });

  if (!progress) {
    progress = await prisma.academyCourseProgress.create({
      data: {
        userId: auth.userId,
        courseId,
        completedLessons: 0,
        completedLessonIds: [],
        totalLessons: course.totalLessons,
        status: 'in_progress',
        startedAt: new Date(),
      },
    });
  }

  // Check if lesson already completed
  if (progress.completedLessonIds.includes(lessonId)) {
    return NextResponse.json({
      message: 'Pelajaran sudah diselesaikan',
      progress: {
        completedLessons: progress.completedLessons,
        completedLessonIds: progress.completedLessonIds,
        totalLessons: progress.totalLessons,
        status: progress.status,
        percent:
          progress.totalLessons > 0
            ? Math.round((progress.completedLessons / progress.totalLessons) * 100)
            : 0,
      },
    });
  }

  // Add lesson to completed
  const newCompletedIds = [...progress.completedLessonIds, lessonId];
  const newCompletedCount = newCompletedIds.length;
  const isCompleted = newCompletedCount >= progress.totalLessons;

  const updated = await prisma.academyCourseProgress.update({
    where: { id: progress.id },
    data: {
      completedLessons: newCompletedCount,
      completedLessonIds: newCompletedIds,
      status: isCompleted ? 'completed' : 'in_progress',
      completedAt: isCompleted ? new Date() : null,
    },
  });

  return NextResponse.json({
    message: isCompleted ? 'Kursus selesai!' : 'Pelajaran diselesaikan',
    progress: {
      completedLessons: updated.completedLessons,
      completedLessonIds: updated.completedLessonIds,
      totalLessons: updated.totalLessons,
      status: updated.status,
      percent:
        updated.totalLessons > 0
          ? Math.round((updated.completedLessons / updated.totalLessons) * 100)
          : 0,
    },
  });
}
