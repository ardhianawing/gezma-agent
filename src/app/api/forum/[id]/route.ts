import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { updateForumThreadSchema } from '@/lib/validations/forum';
import { logger } from '@/lib/logger';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { id } = await params;

  try {
    const thread = await prisma.forumThread.findUnique({
      where: { id },
      include: {
        replies: {
          orderBy: { createdAt: 'asc' },
        },
      },
    });

    if (!thread) {
      return NextResponse.json({ error: 'Thread tidak ditemukan' }, { status: 404 });
    }

    // Increment view count
    await prisma.forumThread.update({
      where: { id },
      data: { viewCount: { increment: 1 } },
    });

    return NextResponse.json({ data: thread });
  } catch (error) {
    logger.error('GET /api/forum/[id] error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { id } = await params;

  try {
    const thread = await prisma.forumThread.findUnique({ where: { id } });
    if (!thread) {
      return NextResponse.json({ error: 'Thread tidak ditemukan' }, { status: 404 });
    }

    // Only author can update content, CC can update moderation fields
    if (thread.authorId !== auth.userId) {
      return NextResponse.json({ error: 'Anda tidak memiliki akses' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = updateForumThreadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validasi gagal', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Authors can only update title, content, category, tags, isSolved
    const allowedFields = ['title', 'content', 'category', 'tags', 'isSolved'];
    const updateData: Record<string, unknown> = {};
    for (const key of allowedFields) {
      if (key in parsed.data) {
        updateData[key] = (parsed.data as Record<string, unknown>)[key];
      }
    }

    if (updateData.content && typeof updateData.content === 'string') {
      updateData.excerpt = updateData.content.length > 200
        ? updateData.content.substring(0, 200) + '...'
        : updateData.content;
    }

    const updated = await prisma.forumThread.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    logger.error('PATCH /api/forum/[id] error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
