import { NextRequest, NextResponse } from 'next/server';
import { getCCAuthPayload } from '@/lib/auth-command-center';
import { prisma } from '@/lib/prisma';
import { createMultipartUpload, getPartPresignedUrls, CHUNK_SIZE } from '@/lib/storage-multipart';

const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB
const ALLOWED_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];

export async function POST(req: NextRequest) {
  const auth = getCCAuthPayload(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { lessonId, fileName, fileSize, contentType } = body;

  if (!lessonId || !fileName || !fileSize || !contentType) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  if (fileSize > MAX_FILE_SIZE) {
    return NextResponse.json({ error: 'File terlalu besar. Maksimal 500MB' }, { status: 400 });
  }

  if (!ALLOWED_TYPES.includes(contentType)) {
    return NextResponse.json({ error: 'Tipe file tidak valid. Hanya mp4, webm, mov' }, { status: 400 });
  }

  const lesson = await prisma.academyLesson.findUnique({ where: { id: lessonId } });
  if (!lesson) return NextResponse.json({ error: 'Lesson not found' }, { status: 404 });

  const ext = fileName.split('.').pop() || 'mp4';
  const storageKey = `academy/videos/${lessonId}.${ext}`;

  const uploadId = await createMultipartUpload(storageKey, contentType);
  const parts = await getPartPresignedUrls(storageKey, uploadId, fileSize);

  await prisma.academyLesson.update({
    where: { id: lessonId },
    data: { videoStatus: 'uploading', videoStorageKey: storageKey, videoSize: BigInt(fileSize) },
  });

  return NextResponse.json({ uploadId, storageKey, parts, chunkSize: CHUNK_SIZE });
}
