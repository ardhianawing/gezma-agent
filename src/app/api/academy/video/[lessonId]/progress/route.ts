import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest, { params }: { params: Promise<{ lessonId: string }> }) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { lessonId } = await params;
  const progress = await prisma.academyVideoProgress.findUnique({
    where: { lessonId_userId: { lessonId, userId: auth.userId } },
  });

  return NextResponse.json({
    lastPosition: progress?.lastPosition ?? 0,
    completed: progress?.completed ?? false,
  });
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ lessonId: string }> }) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { lessonId } = await params;
  const body = await req.json();
  const { lastPosition, completed } = body;

  if (lastPosition !== undefined && (typeof lastPosition !== 'number' || lastPosition < 0)) {
    return NextResponse.json({ error: 'Invalid position' }, { status: 400 });
  }
  if (completed !== undefined && typeof completed !== 'boolean') {
    return NextResponse.json({ error: 'Invalid completed value' }, { status: 400 });
  }

  const progress = await prisma.academyVideoProgress.upsert({
    where: { lessonId_userId: { lessonId, userId: auth.userId } },
    create: {
      lessonId,
      userId: auth.userId,
      lastPosition: lastPosition ?? 0,
      completed: completed ?? false,
    },
    update: {
      ...(lastPosition !== undefined && { lastPosition }),
      ...(completed !== undefined && { completed }),
    },
  });

  return NextResponse.json(progress);
}
