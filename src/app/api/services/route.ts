import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET() {
  try {
    const [services, documents] = await Promise.all([
      prisma.platformService.findMany({
        where: { isActive: true },
        orderBy: { order: 'asc' },
      }),
      prisma.platformDocument.findMany({
        where: { isActive: true },
        orderBy: { createdAt: 'desc' },
      }),
    ]);

    return NextResponse.json({ services, documents });
  } catch (error) {
    logger.error('GET /api/services error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
