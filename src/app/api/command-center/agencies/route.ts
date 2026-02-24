import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCCAuthPayload, ccUnauthorizedResponse } from '@/lib/auth-command-center';

export async function GET(req: NextRequest) {
  const auth = getCCAuthPayload(req);
  if (!auth) return ccUnauthorizedResponse();

  try {
    const search = req.nextUrl.searchParams.get('search') || '';
    const status = req.nextUrl.searchParams.get('status') || '';
    const page = parseInt(req.nextUrl.searchParams.get('page') || '1');
    const limit = parseInt(req.nextUrl.searchParams.get('limit') || '20');
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { ppiuNumber: { contains: search, mode: 'insensitive' } },
      ];
    }
    if (status) {
      where.ppiuStatus = status;
    }

    const [agencies, total] = await Promise.all([
      prisma.agency.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take: limit,
        include: {
          _count: { select: { users: true, pilgrims: true, trips: true } },
        },
      }),
      prisma.agency.count({ where }),
    ]);

    return NextResponse.json({
      data: agencies,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    console.error('GET /api/command-center/agencies error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
