import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

// Mock stats for fallback
const mockStats = {
  totalPilgrims: 156,
  activePilgrims: 89,
  activePackages: 8,
  activeTrips: 3,
  pendingDocs: 12,
  upcomingTrips: [
    {
      id: 'trip-1',
      name: 'Umrah Reguler Mar 2026',
      departureDate: '2026-03-15T00:00:00Z',
      registeredCount: 42,
      status: 'ready',
    },
    {
      id: 'trip-2',
      name: 'Umrah VIP Apr 2026',
      departureDate: '2026-04-10T00:00:00Z',
      registeredCount: 18,
      status: 'preparing',
    },
  ],
  totalRevenue: 2850000000,
  outstandingPayments: 450000000,
};

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req); if (!auth) return unauthorizedResponse();

  try {
    const [pilgrimCount, tripCount, packageCount] = await Promise.all([
      prisma.pilgrim.count({ where: { agencyId: auth.agencyId, deletedAt: null } }),
      prisma.trip.count({ where: { agencyId: auth.agencyId, deletedAt: null } }),
      prisma.package.count({ where: { agencyId: auth.agencyId, deletedAt: null } }),
    ]);

    // Hybrid: real counts merged with mock structure
    return NextResponse.json({
      ...mockStats,
      totalPilgrims: pilgrimCount || mockStats.totalPilgrims,
      activePackages: packageCount || mockStats.activePackages,
      activeTrips: tripCount || mockStats.activeTrips,
      _source: 'hybrid',
    });
  } catch {
    // Fallback to full mock stats
    return NextResponse.json({ ...mockStats, _source: 'mock' });
  }
}
