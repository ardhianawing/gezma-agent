import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req); if (!auth) return unauthorizedResponse();
  return NextResponse.json({
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
  });
}
