import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const data = await prisma.activityLog.findMany({
      where: { agencyId: auth.agencyId },
      orderBy: { createdAt: 'desc' },
      take: 20,
    });

    return NextResponse.json({ data });
  } catch (error) {
    console.error('GET /api/activities error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
