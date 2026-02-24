import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { agencyId } = auth;

  try {
    // 1. Revenue trend (last 12 months)
    const payments = await prisma.paymentRecord.findMany({
      where: {
        pilgrim: { agencyId },
      },
      select: { amount: true, date: true },
      orderBy: { date: 'asc' },
    });

    const monthlyMap: Record<string, number> = {};
    const now = new Date();
    // Initialize last 12 months
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
      monthlyMap[key] = 0;
    }
    for (const p of payments) {
      const key = `${p.date.getFullYear()}-${String(p.date.getMonth() + 1).padStart(2, '0')}`;
      if (key in monthlyMap) {
        monthlyMap[key] += p.amount;
      }
    }
    const revenueTrend = Object.entries(monthlyMap).map(([month, amount]) => ({
      month,
      amount,
    }));

    // 2. Pilgrim status distribution
    const pilgrims = await prisma.pilgrim.findMany({
      where: { agencyId },
      select: { status: true },
    });
    const statusCount: Record<string, number> = {};
    for (const p of pilgrims) {
      statusCount[p.status] = (statusCount[p.status] || 0) + 1;
    }
    const pilgrimStatus = Object.entries(statusCount).map(([status, count]) => ({
      status,
      count,
    }));

    // 3. Trip capacity vs registered
    const trips = await prisma.trip.findMany({
      where: { agencyId, status: { in: ['open', 'preparing', 'ready'] } },
      select: { id: true, name: true, capacity: true },
    });

    const tripIds = trips.map(t => t.id);
    const pilgrimsByTrip = tripIds.length > 0
      ? await prisma.pilgrim.groupBy({
          by: ['tripId'],
          where: { tripId: { in: tripIds } },
          _count: true,
        })
      : [];
    const tripCountMap = new Map(pilgrimsByTrip.map(p => [p.tripId, p._count]));

    const tripCapacity = trips.map(t => ({
      name: t.name.length > 20 ? t.name.slice(0, 20) + '...' : t.name,
      capacity: t.capacity,
      registered: tripCountMap.get(t.id) || 0,
    }));

    return NextResponse.json({ revenueTrend, pilgrimStatus, tripCapacity });
  } catch (error) {
    console.error('GET /api/dashboard/charts error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
