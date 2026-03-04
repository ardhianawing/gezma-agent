import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCCAuthPayload, ccUnauthorizedResponse } from '@/lib/auth-command-center';
import { logger } from '@/lib/logger';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getCCAuthPayload(req);
  if (!auth) return ccUnauthorizedResponse();

  const { id } = await params;

  try {
    const thread = await prisma.forumThread.findUnique({ where: { id } });
    if (!thread) {
      return NextResponse.json({ error: 'Thread tidak ditemukan' }, { status: 404 });
    }

    const body = await req.json();
    const updateData: Record<string, unknown> = {};

    if (typeof body.isPinned === 'boolean') updateData.isPinned = body.isPinned;
    if (typeof body.isLocked === 'boolean') updateData.isLocked = body.isLocked;
    if (typeof body.isHot === 'boolean') updateData.isHot = body.isHot;

    const updated = await prisma.forumThread.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    logger.error('PATCH /api/forum/[id]/pin error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
