import { NextRequest, NextResponse } from 'next/server';
import { getCCAuthPayload } from '@/lib/auth-command-center';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const auth = getCCAuthPayload(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const url = new URL(req.url);
  const category = url.searchParams.get('category');
  const status = url.searchParams.get('status');
  const search = url.searchParams.get('search');

  const where: Record<string, unknown> = {};
  if (category) where.category = category;
  if (status === 'published') where.isPublished = true;
  if (status === 'draft') where.isPublished = false;
  if (search) where.title = { contains: search, mode: 'insensitive' };

  const courses = await prisma.academyCourse.findMany({
    where,
    include: {
      lessons: { select: { id: true, videoStatus: true }, orderBy: { order: 'asc' } },
      _count: { select: { progress: true, reviews: true } },
    },
    orderBy: { createdAt: 'desc' },
  });

  return NextResponse.json({ courses });
}

export async function POST(req: NextRequest) {
  const auth = getCCAuthPayload(req);
  if (!auth) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const body = await req.json();
  const { title, description, category, level, instructorName, duration } = body;

  if (!title || !description || !category || !level || !instructorName) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }

  const course = await prisma.academyCourse.create({
    data: { title, description, category, level, instructorName, duration: duration || '0 jam' },
  });

  return NextResponse.json({ course }, { status: 201 });
}
