import { NextRequest, NextResponse } from 'next/server';
import { getCCAuthPayload } from '@/lib/auth-command-center';
import { prisma } from '@/lib/prisma';
import { deleteS3Object } from '@/lib/storage-multipart';

type Params = { params: Promise<{ id: string; lessonId: string }> };

export async function PUT(req: NextRequest, { params }: Params) {
  const auth = getCCAuthPayload(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { lessonId } = await params;
  const body = await req.json();
  const { title, content, duration } = body;

  const lesson = await prisma.academyLesson.update({
    where: { id: lessonId },
    data: {
      ...(title !== undefined && { title }),
      ...(content !== undefined && { content }),
      ...(duration !== undefined && { duration }),
    },
  });

  return NextResponse.json({ lesson });
}

export async function DELETE(req: NextRequest, { params }: Params) {
  const auth = getCCAuthPayload(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id, lessonId } = await params;

  const lesson = await prisma.academyLesson.findUnique({
    where: { id: lessonId },
    select: { videoStorageKey: true, thumbnailKey: true },
  });

  if (lesson?.videoStorageKey) await deleteS3Object(lesson.videoStorageKey).catch(() => {});
  if (lesson?.thumbnailKey) await deleteS3Object(lesson.thumbnailKey).catch(() => {});

  await prisma.academyLesson.delete({ where: { id: lessonId } });

  const count = await prisma.academyLesson.count({ where: { courseId: id } });
  await prisma.academyCourse.update({ where: { id }, data: { totalLessons: count } });

  return NextResponse.json({ success: true });
}
