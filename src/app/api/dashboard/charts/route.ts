import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

// Mock data kept as fallbacks (hybrid approach)
const mockRevenueTrend = [
  { month: 'Sep 2025', amount: 350000000 },
  { month: 'Oct 2025', amount: 420000000 },
  { month: 'Nov 2025', amount: 380000000 },
  { month: 'Dec 2025', amount: 510000000 },
  { month: 'Jan 2026', amount: 460000000 },
  { month: 'Feb 2026', amount: 730000000 },
];

const mockPilgrimStatus = [
  { status: 'lead', count: 23 },
  { status: 'dp', count: 18 },
  { status: 'lunas', count: 31 },
  { status: 'dokumen', count: 15 },
  { status: 'visa', count: 12 },
  { status: 'ready', count: 28 },
  { status: 'departed', count: 19 },
  { status: 'completed', count: 10 },
];

const mockTripCapacity = [
  { name: 'Umrah Reguler Mar 2026', capacity: 45, registered: 42 },
  { name: 'Umrah VIP Apr 2026', capacity: 20, registered: 18 },
  { name: 'Umrah Ramadhan 2026', capacity: 45, registered: 45 },
];

const mockData = {
  revenueTrend: mockRevenueTrend,
  pilgrimStatus: mockPilgrimStatus,
  tripCapacity: mockTripCapacity,
};

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req); if (!auth) return unauthorizedResponse();

  try {
    const [statusGroups, trips] = await Promise.all([
      prisma.pilgrim.groupBy({
        by: ['status'],
        _count: true,
        where: { agencyId: auth.agencyId, deletedAt: null },
      }),
      prisma.trip.findMany({
        where: { agencyId: auth.agencyId, deletedAt: null },
        select: { name: true, capacity: true, registeredCount: true },
        orderBy: { departureDate: 'asc' },
        take: 5,
      }),
    ]);

    const dbPilgrimStatus = statusGroups.map(g => ({
      status: g.status,
      count: g._count,
    }));

    const dbTripCapacity = trips.map(t => ({
      name: t.name,
      capacity: t.capacity,
      registered: t.registeredCount,
    }));

    return NextResponse.json({
      revenueTrend: mockRevenueTrend, // keep mock for now
      pilgrimStatus: dbPilgrimStatus.length > 0 ? dbPilgrimStatus : mockPilgrimStatus,
      tripCapacity: dbTripCapacity.length > 0 ? dbTripCapacity : mockTripCapacity,
    });
  } catch {
    return NextResponse.json(mockData);
  }
}
