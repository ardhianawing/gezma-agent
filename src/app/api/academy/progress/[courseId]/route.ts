import { NextRequest, NextResponse } from 'next/server';
import { courses } from '@/data/mock-academy';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;

  const body = await req.json();
  const { lessonId } = body as { lessonId: string };

  if (!lessonId) {
    return NextResponse.json({ error: 'lessonId diperlukan' }, { status: 400 });
  }

  const course = courses.find((c) => c.id === courseId);
  if (!course) {
    return NextResponse.json({ error: 'Kursus tidak ditemukan' }, { status: 404 });
  }

  // Simulate progress update
  const currentProgress = course.progress ?? 0;
  const completedBefore = Math.round((currentProgress / 100) * course.lessonCount);
  const newCompleted = Math.min(completedBefore + 1, course.lessonCount);
  const newPercent = Math.round((newCompleted / course.lessonCount) * 100);
  const isCompleted = newCompleted >= course.lessonCount;

  return NextResponse.json({
    message: isCompleted ? 'Kursus selesai!' : 'Pelajaran diselesaikan',
    progress: {
      completedLessons: newCompleted,
      completedLessonIds: [lessonId],
      totalLessons: course.lessonCount,
      status: isCompleted ? 'completed' : 'in_progress',
      percent: newPercent,
    },
  });
}
