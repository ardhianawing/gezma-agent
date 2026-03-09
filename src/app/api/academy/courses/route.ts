import { NextRequest, NextResponse } from 'next/server';
import { courses } from '@/data/mock-academy';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || undefined;
  const level = searchParams.get('level') || undefined;
  const search = searchParams.get('search') || undefined;
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  let filtered = [...courses];

  if (category && category !== 'all') {
    filtered = filtered.filter((c) => c.category === category);
  }
  if (level && level !== 'all') {
    filtered = filtered.filter((c) => c.level === level);
  }
  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (c) =>
        c.title.toLowerCase().includes(q) ||
        c.description.toLowerCase().includes(q)
    );
  }

  const total = filtered.length;
  const start = (page - 1) * limit;
  const data = filtered.slice(start, start + limit).map((course) => ({
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
    progress: course.progress != null
      ? {
          completedLessons: Math.round((course.progress / 100) * course.lessonCount),
          completedLessonIds: [],
          totalLessons: course.lessonCount,
          status: course.progress >= 100 ? 'completed' : 'in_progress',
          percent: course.progress,
        }
      : null,
  }));

  return NextResponse.json({
    courses: data,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  });
}
