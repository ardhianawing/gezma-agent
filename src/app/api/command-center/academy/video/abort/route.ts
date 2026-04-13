import { NextRequest, NextResponse } from 'next/server';
import { getCCAuthPayload } from '@/lib/auth-command-center';
import { prisma } from '@/lib/prisma';
import { abortMultipartUpload } from '@/lib/storage-multipart';

export async function POST(req: NextRequest) {
  const auth = getCCAuthPayload(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { lessonId, uploadId, storageKey } = body;

  if (!lessonId || !uploadId || !storageKey) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  await abortMultipartUpload(storageKey, uploadId).catch(() => {});

  await prisma.academyLesson.update({
    where: { id: lessonId },
    data: { videoStatus: 'none', videoStorageKey: null, videoSize: null },
  });

  return NextResponse.json({ success: true });
}
