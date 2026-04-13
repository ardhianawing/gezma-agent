import { NextRequest, NextResponse } from 'next/server';
import { getCCAuthPayload } from '@/lib/auth-command-center';
import { prisma } from '@/lib/prisma';
import { completeMultipartUpload } from '@/lib/storage-multipart';
import { generateThumbnail } from '@/lib/services/thumbnail.service';

export async function POST(req: NextRequest) {
  const auth = getCCAuthPayload(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { lessonId, uploadId, parts, storageKey } = body;

  if (!lessonId || !uploadId || !parts || !storageKey) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  await completeMultipartUpload(storageKey, uploadId, parts);

  await prisma.academyLesson.update({
    where: { id: lessonId },
    data: { videoStatus: 'processing' },
  });

  // Fire-and-forget thumbnail generation
  generateThumbnail(lessonId, storageKey)
    .then(async ({ thumbnailKey, videoDuration }) => {
      await prisma.academyLesson.update({
        where: { id: lessonId },
        data: { thumbnailKey, videoDuration, videoStatus: 'ready' },
      });
    })
    .catch(async (err) => {
      console.error('Thumbnail generation failed:', err);
      await prisma.academyLesson.update({
        where: { id: lessonId },
        data: { videoStatus: 'ready', videoError: 'Thumbnail generation failed' },
      });
    });

  return NextResponse.json({ success: true, status: 'processing' });
}
