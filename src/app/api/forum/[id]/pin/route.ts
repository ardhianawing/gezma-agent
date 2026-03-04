import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCCAuthPayload, ccUnauthorizedResponse } from '@/lib/auth-command-center';
import { rateLimit } from '@/lib/rate-limiter';
import { logger } from '@/lib/logger';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getCCAuthPayload(req);
  if (!auth) return ccUnauthorizedResponse();

  const { allowed } = rateLimit(req, { limit: 10, window: 60 });
  if (!allowed) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan, coba lagi nanti' }, { status: 429 });
  }

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
