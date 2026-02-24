import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const progressList = await prisma.academyCourseProgress.findMany({
    where: { userId: auth.userId },
    include: {
      course: {
        select: {
          id: true,
          title: true,
          category: true,
          level: true,
          duration: true,
          instructorName: true,
          totalLessons: true,
        },
      },
    },
    orderBy: { startedAt: 'desc' },
  });

  const data = progressList.map((p) => ({
    courseId: p.courseId,
    course: p.course,
    completedLessons: p.completedLessons,
    completedLessonIds: p.completedLessonIds,
    totalLessons: p.totalLessons,
    status: p.status,
    startedAt: p.startedAt,
    completedAt: p.completedAt,
    percent:
      p.totalLessons > 0
        ? Math.round((p.completedLessons / p.totalLessons) * 100)
        : 0,
  }));

  return NextResponse.json({ progress: data });
}
