import { NextRequest, NextResponse } from 'next/server';
import { getCCAuthPayload } from '@/lib/auth-command-center';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: Promise<{ lessonId: string }> }) {
  const auth = getCCAuthPayload(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { lessonId } = await params;
  const lesson = await prisma.academyLesson.findUnique({
    where: { id: lessonId },
    select: { videoStatus: true, videoError: true, videoDuration: true, thumbnailKey: true, videoSize: true },
  });

  if (!lesson) return NextResponse.json({ error: 'Not found' }, { status: 404 });
  return NextResponse.json({ ...lesson, videoSize: lesson.videoSize?.toString() ?? null });
}
