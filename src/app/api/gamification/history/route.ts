import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { historyQuerySchema } from '@/lib/validations/gamification';

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const params = Object.fromEntries(req.nextUrl.searchParams);
    const parsed = historyQuerySchema.safeParse(params);
    const page = parsed.success ? parsed.data.page : 1;
    const limit = parsed.success ? parsed.data.limit : 20;
    const skip = (page - 1) * limit;

    const [events, total] = await Promise.all([
      prisma.pointEvent.findMany({
        where: { userId: auth.userId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.pointEvent.count({ where: { userId: auth.userId } }),
    ]);

    return NextResponse.json({
      data: events,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GET /api/gamification/history error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
