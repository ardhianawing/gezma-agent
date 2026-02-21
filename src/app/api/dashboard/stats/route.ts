import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { agencyId } = auth;

  try {
    const [totalPilgrims, activePackages, activeTrips, pendingDocsResult, upcomingTrips] =
      await Promise.all([
        prisma.pilgrim.count({ where: { agencyId } }),

        prisma.package.count({ where: { agencyId, isActive: true } }),

        prisma.trip.count({
          where: {
            agencyId,
            status: { notIn: ['completed', 'cancelled'] },
          },
        }),

        prisma.pilgrim.count({
          where: {
            agencyId,
            documents: {
              some: { status: { not: 'verified' } },
            },
          },
        }),

        prisma.trip.findMany({
          where: {
            agencyId,
            status: { notIn: ['completed', 'cancelled'] },
          },
          select: {
            id: true,
            name: true,
            departureDate: true,
            registeredCount: true,
            status: true,
          },
          orderBy: { departureDate: 'asc' },
          take: 10,
        }),
      ]);

    return NextResponse.json({
      totalPilgrims,
      activePackages,
      activeTrips,
      pendingDocs: pendingDocsResult,
      upcomingTrips,
    });
  } catch (error) {
    console.error('GET /api/dashboard/stats error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
