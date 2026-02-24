import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; lessonId: string }> }
) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { id, lessonId } = await params;

  const lesson = await prisma.academyLesson.findFirst({
    where: {
      id: lessonId,
      courseId: id,
    },
    select: {
      id: true,
      courseId: true,
      title: true,
      content: true,
      videoUrl: true,
      order: true,
      duration: true,
    },
  });

  if (!lesson) {
    return NextResponse.json({ error: 'Pelajaran tidak ditemukan' }, { status: 404 });
  }

  return NextResponse.json(lesson);
}
