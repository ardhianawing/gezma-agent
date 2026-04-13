import { NextRequest, NextResponse } from 'next/server';
import { courses as mockCourses } from '@/data/mock-academy';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || undefined;
  const level = searchParams.get('level') || undefined;
  const search = searchParams.get('search') || undefined;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  // 1. Mock data (for presentation)
  const mockData = mockCourses.map((course) => ({
    id: course.id,
    title: course.title,
    description: course.description,
    category: course.category,
    level: course.level,
    thumbnailUrl: course.imageUrl || null,
    duration: course.duration,
    instructorName: course.instructor,
    totalLessons: course.lessonCount,
    lessonCount: course.lessonCount,
    isPublished: true,
    _source: 'mock' as const,
  }));

  // 2. Real data from DB
  let dbData: typeof mockData = [];
  try {
    const dbCourses = await prisma.academyCourse.findMany({
      where: { isPublished: true },
      include: { lessons: { select: { id: true }, orderBy: { order: 'asc' } } },
      orderBy: { createdAt: 'desc' },
    });
    dbData = dbCourses.map((c) => ({
      id: c.id,
      title: c.title,
      description: c.description,
      category: c.category,
      level: c.level,
      thumbnailUrl: c.thumbnailUrl || null,
      duration: c.duration,
      instructorName: c.instructorName,
      totalLessons: c.lessons.length,
      lessonCount: c.lessons.length,
      isPublished: c.isPublished,
      _source: 'db' as const,
    }));
  } catch {
    // DB not available, continue with mock only
  }

  // 3. Merge: DB courses first, then mock
  let all = [...dbData, ...mockData];

  // Filter
  if (category && category !== 'all') {
    all = all.filter((c) => c.category === category);
  }
  if (level && level !== 'all') {
    all = all.filter((c) => c.level === level);
  }
  if (search) {
    const q = search.toLowerCase();
    all = all.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  }

  const total = all.length;
  const start = (page - 1) * limit;
  const data = all.slice(start, start + limit);

  return NextResponse.json({
    courses: data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}
