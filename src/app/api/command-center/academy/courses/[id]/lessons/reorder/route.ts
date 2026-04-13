import { NextRequest, NextResponse } from 'next/server';
import { getCCAuthPayload } from '@/lib/auth-command-center';
import { prisma } from '@/lib/prisma';

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const auth = getCCAuthPayload(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = await params;
  const body = await req.json();
  const { lessonIds } = body as { lessonIds: string[] };

  if (!Array.isArray(lessonIds) || lessonIds.length === 0) {
    return NextResponse.json({ error: 'lessonIds array required' }, { status: 400 });
  }

  // Verify all lessonIds belong to this course
  const validLessons = await prisma.academyLesson.findMany({
    where: { id: { in: lessonIds }, courseId: id },
    select: { id: true },
  });
  if (validLessons.length !== lessonIds.length) {
    return NextResponse.json({ error: 'Invalid lesson IDs for this course' }, { status: 400 });
  }

  await prisma.$transaction(
    lessonIds.map((lessonId, index) =>
      prisma.academyLesson.update({ where: { id: lessonId }, data: { order: index } })
    )
  );

  return NextResponse.json({ success: true });
}
