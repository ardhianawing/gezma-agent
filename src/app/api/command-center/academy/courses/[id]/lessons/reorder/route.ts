import { NextRequest, NextResponse } from 'next/server';
import { getCCAuthPayload } from '@/lib/auth-command-center';
import { prisma } from '@/lib/prisma';

export async function PUT(req: NextRequest) {
  const auth = getCCAuthPayload(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { lessonIds } = body as { lessonIds: string[] };

  if (!Array.isArray(lessonIds) || lessonIds.length === 0) {
    return NextResponse.json({ error: 'lessonIds array required' }, { status: 400 });
  }

  await prisma.$transaction(
    lessonIds.map((id, index) =>
      prisma.academyLesson.update({ where: { id }, data: { order: index } })
    )
  );

  return NextResponse.json({ success: true });
}
