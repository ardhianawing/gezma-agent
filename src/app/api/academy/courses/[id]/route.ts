import { NextRequest, NextResponse } from 'next/server';
import { courses as mockCourses } from '@/data/mock-academy';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  // 1. Try real DB first
  try {
    const course = await prisma.academyCourse.findUnique({
      where: { id },
      include: {
        lessons: { orderBy: { order: 'asc' } },
      },
    });

    if (course) {
      return NextResponse.json({
        id: course.id,
        title: course.title,
        description: course.description,
        category: course.category,
        level: course.level,
        thumbnailUrl: course.thumbnailUrl || null,
        duration: course.duration,
        instructorName: course.instructorName,
        totalLessons: course.lessons.length,
        isPublished: course.isPublished,
        lessons: course.lessons.map((l) => ({
          id: l.id,
          title: l.title,
          order: l.order,
          duration: l.duration,
          videoUrl: l.videoUrl,
          videoStatus: l.videoStatus,
          thumbnailKey: l.thumbnailKey,
        })),
        progress: null,
      });
    }
  } catch {
    // DB not available, fall through to mock
  }

  // 2. Fallback to mock data
  const course = mockCourses.find((c) => c.id === id);
  if (!course) {
    return NextResponse.json({ error: 'Kursus tidak ditemukan' }, { status: 404 });
  }

  const lessons = Array.from({ length: course.lessonCount }, (_, i) => ({
    id: `${course.id}-lesson-${i + 1}`,
    title: `Pelajaran ${i + 1}: ${course.title} - Bagian ${i + 1}`,
    order: i + 1,
    duration: `${Math.floor(Math.random() * 20 + 10)} menit`,
    videoUrl: course.videoUrl,
    videoStatus: 'none',
    thumbnailKey: null,
  }));

  const progressPercent = course.progress ?? 0;
  const completedCount = Math.round((progressPercent / 100) * course.lessonCount);

  return NextResponse.json({
    id: course.id,
    title: course.title,
    description: course.description,
    category: course.category,
    level: course.level,
    thumbnailUrl: course.imageUrl || null,
    duration: course.duration,
    instructorName: course.instructor,
    totalLessons: course.lessonCount,
    isPublished: true,
    lessons,
    progress: course.progress != null
      ? {
          completedLessons: completedCount,
          completedLessonIds: lessons.slice(0, completedCount).map((l) => l.id),
          totalLessons: course.lessonCount,
          status: course.progress >= 100 ? 'completed' : 'in_progress',
          startedAt: '2025-01-15T08:00:00Z',
          completedAt: course.progress >= 100 ? '2025-02-20T14:30:00Z' : null,
          percent: course.progress,
        }
      : null,
  });
}
