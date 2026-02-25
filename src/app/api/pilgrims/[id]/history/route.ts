import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { logger } from '@/lib/logger';

type Context = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Context) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { id } = await params;

  try {
    // Verify pilgrim belongs to this agency
    const pilgrim = await prisma.pilgrim.findFirst({
      where: { id, agencyId: auth.agencyId },
      select: { id: true, name: true, status: true, createdAt: true, createdBy: true },
    });

    if (!pilgrim) {
      return NextResponse.json({ error: 'Jemaah tidak ditemukan' }, { status: 404 });
    }

    // Fetch status change logs from ActivityLog
    const logs = await prisma.activityLog.findMany({
      where: {
        agencyId: auth.agencyId,
        type: 'pilgrim',
        metadata: {
          path: ['entityId'],
          equals: id,
        },
        action: 'updated',
        title: { contains: 'Status' },
      },
      orderBy: { createdAt: 'asc' },
      select: {
        id: true,
        action: true,
        title: true,
        description: true,
        metadata: true,
        userId: true,
        createdAt: true,
      },
    });

    // Build the history array
    // Start with creation event
    const history: Array<{
      id: string;
      action: string;
      details: Record<string, unknown>;
      createdAt: string;
      userId: string | null;
    }> = [
      {
        id: `${pilgrim.id}-created`,
        action: 'created',
        details: { newStatus: 'lead' },
        createdAt: pilgrim.createdAt.toISOString(),
        userId: pilgrim.createdBy,
      },
    ];

    // Add each status change from activity logs
    for (const log of logs) {
      const meta = (log.metadata ?? {}) as Record<string, unknown>;
      history.push({
        id: log.id,
        action: 'status_change',
        details: {
          oldStatus: meta.oldStatus ?? null,
          newStatus: meta.newStatus ?? null,
        },
        createdAt: log.createdAt.toISOString(),
        userId: log.userId,
      });
    }

    return NextResponse.json({ data: history, currentStatus: pilgrim.status });
  } catch (error) {
    logger.error('GET /api/pilgrims/[id]/history error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
