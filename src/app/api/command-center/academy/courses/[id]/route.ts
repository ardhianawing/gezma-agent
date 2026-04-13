import { NextRequest, NextResponse } from 'next/server';
import { getCCAuthPayload } from '@/lib/auth-command-center';
import { prisma } from '@/lib/prisma';
import { deleteS3Object } from '@/lib/storage-multipart';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = getCCAuthPayload(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const course = await prisma.academyCourse.findUnique({
    where: { id },
    include: {
      lessons: { orderBy: { order: 'asc' } },
      _count: { select: { progress: true, reviews: true } },
    },
  });

  if (!course) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  const serialized = {
    ...course,
    lessons: course.lessons.map((l) => ({ ...l, videoSize: l.videoSize?.toString() ?? null })),
  };
  return NextResponse.json({ course: serialized });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = getCCAuthPayload(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { title, description, category, level, instructorName, duration, isPublished } = body;

  const course = await prisma.academyCourse.update({
    where: { id },
    data: {
      ...(title !== undefined && { title }),
      ...(description !== undefined && { description }),
      ...(category !== undefined && { category }),
      ...(level !== undefined && { level }),
      ...(instructorName !== undefined && { instructorName }),
      ...(duration !== undefined && { duration }),
      ...(isPublished !== undefined && { isPublished }),
    },
  });

  return NextResponse.json({ course });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = getCCAuthPayload(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;

  const lessons = await prisma.academyLesson.findMany({
    where: { courseId: id },
    select: { videoStorageKey: true, thumbnailKey: true },
  });

  for (const lesson of lessons) {
    if (lesson.videoStorageKey) await deleteS3Object(lesson.videoStorageKey).catch(() => {});
    if (lesson.thumbnailKey) await deleteS3Object(lesson.thumbnailKey).catch(() => {});
  }

  await prisma.academyCourse.delete({ where: { id } });
  return NextResponse.json({ success: true });
}
