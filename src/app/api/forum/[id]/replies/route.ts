import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { checkPermission } from '@/lib/auth-permissions';
import { PERMISSIONS } from '@/lib/permissions';
import { createForumReplySchema } from '@/lib/validations/forum';
import { logger } from '@/lib/logger';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const denied = await checkPermission(auth, PERMISSIONS.FORUM_CREATE);
  if (denied) return denied;

  const { id } = await params;

  try {
    const thread = await prisma.forumThread.findUnique({ where: { id } });
    if (!thread) {
      return NextResponse.json({ error: 'Thread tidak ditemukan' }, { status: 404 });
    }

    if (thread.isLocked) {
      return NextResponse.json({ error: 'Thread ini sudah dikunci' }, { status: 403 });
    }

    const body = await req.json();
    const parsed = createForumReplySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validasi gagal', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { name: true, avatarUrl: true },
    });
    if (!user) return unauthorizedResponse();

    const reply = await prisma.forumReply.create({
      data: {
        threadId: id,
        content: parsed.data.content,
        authorId: auth.userId,
        authorName: user.name,
        authorAvatar: user.avatarUrl || user.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase(),
      },
    });

    // Update thread counters
    await prisma.forumThread.update({
      where: { id },
      data: {
        replyCount: { increment: 1 },
        lastReplyBy: user.name,
        lastReplyAt: new Date(),
      },
    });

    return NextResponse.json(reply, { status: 201 });
  } catch (error) {
    logger.error('POST /api/forum/[id]/replies error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
