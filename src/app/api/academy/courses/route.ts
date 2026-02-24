import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get('category') || undefined;
    const level = searchParams.get('level') || undefined;
    const search = searchParams.get('search') || undefined;
    const page = parseInt(searchParams.get('page') || '1', 10);
    const limit = parseInt(searchParams.get('limit') || '20', 10);
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = { isPublished: true };
    if (category && category !== 'all') where.category = category;
    if (level && level !== 'all') where.level = level;
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { description: { contains: search, mode: 'insensitive' } },
      ];
    }

    const [courses, total] = await Promise.all([
      prisma.academyCourse.findMany({
        where,
        include: {
          _count: { select: { lessons: true } },
          progress: {
            where: { userId: auth.userId },
            select: {
              id: true,
              completedLessons: true,
              completedLessonIds: true,
              totalLessons: true,
              status: true,
            },
          },
        },
        orderBy: [{ order: 'asc' }, { createdAt: 'desc' }],
        skip,
        take: limit,
      }),
      prisma.academyCourse.count({ where }),
    ]);

    const data = courses.map((course) => {
      const userProgress = course.progress[0] || null;
      return {
        id: course.id,
        title: course.title,
        description: course.description,
        category: course.category,
        level: course.level,
        thumbnailUrl: course.thumbnailUrl,
        duration: course.duration,
        instructorName: course.instructorName,
        totalLessons: course.totalLessons,
        lessonCount: course._count.lessons,
        progress: userProgress
          ? {
              completedLessons: userProgress.completedLessons,
              completedLessonIds: userProgress.completedLessonIds,
              totalLessons: userProgress.totalLessons,
              status: userProgress.status,
              percent:
                userProgress.totalLessons > 0
                  ? Math.round((userProgress.completedLessons / userProgress.totalLessons) * 100)
                  : 0,
            }
          : null,
      };
    });

    return NextResponse.json({
      courses: data,
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    });
  } catch (error) {
    console.error('[ACADEMY_COURSES_GET] error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
