import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { getPresignedDownloadUrl } from '@/lib/storage-multipart';
import { rateLimit } from '@/lib/rate-limiter';

export async function GET(req: NextRequest, { params }: { params: Promise<{ lessonId: string }> }) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const rl = rateLimit(req, { limit: 30, window: 60 });
  if (!rl.allowed) return NextResponse.json({ error: 'Rate limited' }, { status: 429 });

  // Check referrer
  const referer = req.headers.get('referer') || '';
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  if (referer && !referer.startsWith(appUrl)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const { lessonId } = await params;
  const lesson = await prisma.academyLesson.findUnique({
    where: { id: lessonId },
    select: { videoStorageKey: true, videoStatus: true },
  });

  if (!lesson || !lesson.videoStorageKey || lesson.videoStatus !== 'ready') {
    return NextResponse.json({ error: 'Video tidak tersedia' }, { status: 404 });
  }

  const url = await getPresignedDownloadUrl(lesson.videoStorageKey, 60);
  return NextResponse.redirect(url, 302);
}
