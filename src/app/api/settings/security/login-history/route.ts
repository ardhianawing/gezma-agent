import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthPayload(req);
    if (!auth) return unauthorizedResponse();

    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '20')));
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.loginHistory.findMany({
        where: { userId: auth.userId },
        orderBy: { loginAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.loginHistory.count({
        where: { userId: auth.userId },
      }),
    ]);

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GET /api/settings/security/login-history error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
