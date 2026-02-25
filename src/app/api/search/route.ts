import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const q = req.nextUrl.searchParams.get('q')?.trim();
  if (!q || q.length < 1) {
    return NextResponse.json({ pilgrims: [], packages: [], trips: [] });
  }

  try {
    const [pilgrims, packages, trips] = await Promise.all([
      prisma.pilgrim.findMany({
        where: {
          agencyId: auth.agencyId,
          OR: [
            { name: { contains: q, mode: 'insensitive' } },
            { nik: { contains: q, mode: 'insensitive' } },
            { phone: { contains: q, mode: 'insensitive' } },
          ],
        },
        select: {
          id: true,
          name: true,
          nik: true,
          phone: true,
          status: true,
        },
        take: 5,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.package.findMany({
        where: {
          agencyId: auth.agencyId,
          name: { contains: q, mode: 'insensitive' },
        },
        select: {
          id: true,
          name: true,
          category: true,
          publishedPrice: true,
          isActive: true,
        },
        take: 5,
        orderBy: { updatedAt: 'desc' },
      }),
      prisma.trip.findMany({
        where: {
          agencyId: auth.agencyId,
          name: { contains: q, mode: 'insensitive' },
        },
        select: {
          id: true,
          name: true,
          departureDate: true,
          status: true,
          registeredCount: true,
          capacity: true,
        },
        take: 5,
        orderBy: { updatedAt: 'desc' },
      }),
    ]);

    return NextResponse.json({ pilgrims, packages, trips });
  } catch (error) {
    logger.error('GET /api/search error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
