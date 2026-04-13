import { NextRequest, NextResponse } from 'next/server';
import { getCCAuthPayload } from '@/lib/auth-command-center';
import { prisma } from '@/lib/prisma';
import { getStorage } from '@/lib/storage';
import { deleteS3Object } from '@/lib/storage-multipart';

const MAX_THUMB_SIZE = 5 * 1024 * 1024; // 5MB

export async function POST(req: NextRequest, { params }: { params: Promise<{ lessonId: string }> }) {
  const auth = getCCAuthPayload(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { lessonId } = await params;
  const formData = await req.formData();
  const file = formData.get('thumbnail') as File | null;

  if (!file) return NextResponse.json({ error: 'No file' }, { status: 400 });
  if (file.size > MAX_THUMB_SIZE) return NextResponse.json({ error: 'Maksimal 5MB' }, { status: 400 });
  if (!file.type.startsWith('image/')) return NextResponse.json({ error: 'Harus file gambar' }, { status: 400 });

  const ext = file.name.split('.').pop() || 'jpg';
  const thumbnailKey = `academy/thumbnails/${lessonId}.${ext}`;
  const buffer = Buffer.from(await file.arrayBuffer());

  const storage = getStorage();
  await storage.upload(thumbnailKey, buffer, file.type);

  await prisma.academyLesson.update({
    where: { id: lessonId },
    data: { thumbnailKey },
  });

  return NextResponse.json({ thumbnailKey });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ lessonId: string }> }) {
  const auth = getCCAuthPayload(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { lessonId } = await params;
  const lesson = await prisma.academyLesson.findUnique({
    where: { id: lessonId },
    select: { thumbnailKey: true },
  });

  if (lesson?.thumbnailKey) {
    await deleteS3Object(lesson.thumbnailKey).catch(() => {});
    await prisma.academyLesson.update({
      where: { id: lessonId },
      data: { thumbnailKey: null },
    });
  }

  return NextResponse.json({ success: true });
}
