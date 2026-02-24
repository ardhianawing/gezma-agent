import { NextRequest, NextResponse } from 'next/server';
import { getPilgrimPayload } from '@/lib/auth-pilgrim';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const payload = getPilgrimPayload(req);
    if (!payload) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    const url = new URL(req.url);
    const page = Math.max(1, parseInt(url.searchParams.get('page') || '1'));
    const limit = Math.min(50, Math.max(1, parseInt(url.searchParams.get('limit') || '20')));
    const skip = (page - 1) * limit;

    const [data, total] = await Promise.all([
      prisma.pilgrimPointEvent.findMany({
        where: { pilgrimId: payload.pilgrimId },
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
      }),
      prisma.pilgrimPointEvent.count({
        where: { pilgrimId: payload.pilgrimId },
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
    console.error('GET /api/pilgrim-portal/gamification/history error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
