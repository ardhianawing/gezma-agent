import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { agencyId } = auth;

  try {
    // Get all pilgrims with payments for this agency
    const pilgrims = await prisma.pilgrim.findMany({
      where: { agencyId },
      select: {
        id: true,
        name: true,
        totalPaid: true,
        remainingBalance: true,
        tripId: true,
        payments: {
          select: {
            amount: true,
            type: true,
            method: true,
            date: true,
          },
          orderBy: { date: 'desc' },
        },
      },
    });

    // Get trips for grouping
    const trips = await prisma.trip.findMany({
      where: { agencyId },
      select: { id: true, name: true, status: true },
    });

    const tripMap = new Map(trips.map((t) => [t.id, t]));

    // Aggregate totals
    let totalRevenue = 0;
    let totalOutstanding = 0;
    const methodBreakdown: Record<string, number> = {};
    const typeBreakdown: Record<string, number> = {};
    const tripRevenue: Record<string, { name: string; revenue: number; outstanding: number; pilgrimCount: number }> = {};
    const monthlyRevenue: Record<string, number> = {};

    for (const p of pilgrims) {
      totalRevenue += p.totalPaid;
      totalOutstanding += p.remainingBalance;

      // Group by trip
      const tripId = p.tripId || '_unassigned';
      if (!tripRevenue[tripId]) {
        const trip = p.tripId ? tripMap.get(p.tripId) : null;
        tripRevenue[tripId] = {
          name: trip?.name || 'Belum ditugaskan',
          revenue: 0,
          outstanding: 0,
          pilgrimCount: 0,
        };
      }
      tripRevenue[tripId].revenue += p.totalPaid;
      tripRevenue[tripId].outstanding += p.remainingBalance;
      tripRevenue[tripId].pilgrimCount += 1;

      for (const pay of p.payments) {
        // Method breakdown
        methodBreakdown[pay.method] = (methodBreakdown[pay.method] || 0) + pay.amount;
        // Type breakdown
        typeBreakdown[pay.type] = (typeBreakdown[pay.type] || 0) + pay.amount;
        // Monthly
        const month = new Date(pay.date).toISOString().slice(0, 7); // YYYY-MM
        monthlyRevenue[month] = (monthlyRevenue[month] || 0) + pay.amount;
      }
    }

    // Sort monthly desc
    const monthlySorted = Object.entries(monthlyRevenue)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 12)
      .map(([month, amount]) => ({ month, amount }));

    // Sort trip revenue by revenue desc
    const tripRevenueSorted = Object.values(tripRevenue).sort((a, b) => b.revenue - a.revenue);

    return NextResponse.json({
      totalRevenue,
      totalOutstanding,
      totalPilgrims: pilgrims.length,
      paidPilgrims: pilgrims.filter((p) => p.remainingBalance <= 0).length,
      methodBreakdown,
      typeBreakdown,
      tripRevenue: tripRevenueSorted,
      monthlyRevenue: monthlySorted,
    });
  } catch (error) {
    console.error('GET /api/reports/financial error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
