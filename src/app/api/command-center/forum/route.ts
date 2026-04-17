import { NextRequest, NextResponse } from 'next/server';
import { getCCAuthPayload, ccUnauthorizedResponse } from '@/lib/auth-command-center';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const auth = getCCAuthPayload(req);
  if (!auth) return ccUnauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') || '';

  try {
    const where: Record<string, unknown> = { deletedAt: null };
    if (status === 'pinned') where.isPinned = true;
    if (status === 'locked') where.isLocked = true;

    const threads = await prisma.forumThread.findMany({
      where,
      orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
      take: 100,
    });

    const mapped = threads.map((t) => ({
      id: t.id,
      title: t.title,
      author: t.authorName,
      agencyName: t.agencyName,
      category: t.category,
      replies: t.replyCount,
      views: t.viewCount,
      status: t.isLocked ? 'locked' : t.isPinned ? 'pinned' : 'active',
      date: t.createdAt.toISOString().split('T')[0],
      isPinned: t.isPinned,
      isLocked: t.isLocked,
      isHot: t.isHot,
      _source: 'db' as const,
    }));

    const stats = {
      total: mapped.length,
      reported: 0,
      pinned: mapped.filter((t) => t.isPinned).length,
      locked: mapped.filter((t) => t.isLocked).length,
    };

    return NextResponse.json({ data: mapped, stats });
  } catch (error) {
    logger.error('GET /api/command-center/forum error', { error: String(error) });
    return NextResponse.json({ data: [], stats: { total: 0, reported: 0, pinned: 0, locked: 0 } });
  }
}
