import { NextRequest, NextResponse } from 'next/server';
import { getCCAuthPayload } from '@/lib/auth-command-center';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = getCCAuthPayload(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const lessons = await prisma.academyLesson.findMany({
    where: { courseId: id },
    orderBy: { order: 'asc' },
  });

  return NextResponse.json({ lessons });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = getCCAuthPayload(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { title, content, duration } = body;

  if (!title) return NextResponse.json({ error: 'Title required' }, { status: 400 });

  const lastLesson = await prisma.academyLesson.findFirst({
    where: { courseId: id },
    orderBy: { order: 'desc' },
    select: { order: true },
  });
  const nextOrder = (lastLesson?.order ?? -1) + 1;

  const lesson = await prisma.academyLesson.create({
    data: {
      courseId: id,
      title,
      content: content || '',
      duration: duration || null,
      order: nextOrder,
    },
  });

  const count = await prisma.academyLesson.count({ where: { courseId: id } });
  await prisma.academyCourse.update({ where: { id }, data: { totalLessons: count } });

  return NextResponse.json({ lesson }, { status: 201 });
}
