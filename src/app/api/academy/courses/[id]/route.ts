import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { id } = await params;

  try {
  const course = await prisma.academyCourse.findUnique({
    where: { id },
    include: {
      lessons: {
        orderBy: { order: 'asc' },
        select: {
          id: true,
          title: true,
          order: true,
          duration: true,
          videoUrl: true,
        },
      },
      progress: {
        where: { userId: auth.userId },
        select: {
          id: true,
          completedLessons: true,
          completedLessonIds: true,
          totalLessons: true,
          status: true,
          startedAt: true,
          completedAt: true,
        },
      },
    },
  });

  if (!course) {
    return NextResponse.json({ error: 'Kursus tidak ditemukan' }, { status: 404 });
  }

  const userProgress = course.progress[0] || null;

  return NextResponse.json({
    id: course.id,
    title: course.title,
    description: course.description,
    category: course.category,
    level: course.level,
    thumbnailUrl: course.thumbnailUrl,
    duration: course.duration,
    instructorName: course.instructorName,
    totalLessons: course.totalLessons,
    isPublished: course.isPublished,
    lessons: course.lessons,
    progress: userProgress
      ? {
          completedLessons: userProgress.completedLessons,
          completedLessonIds: userProgress.completedLessonIds,
          totalLessons: userProgress.totalLessons,
          status: userProgress.status,
          startedAt: userProgress.startedAt,
          completedAt: userProgress.completedAt,
          percent:
            userProgress.totalLessons > 0
              ? Math.round((userProgress.completedLessons / userProgress.totalLessons) * 100)
              : 0,
        }
      : null,
  });
  } catch (error) {
    console.error('[ACADEMY_COURSE_GET] error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
