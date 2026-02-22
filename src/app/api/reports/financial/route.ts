import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { agencyId } = auth;

  try {
    // Get all pilgrims with payments
    const pilgrims = await prisma.pilgrim.findMany({
      where: { agencyId },
      include: {
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

    // Get trips and packages for outstanding calculation
    const trips = await prisma.trip.findMany({
      where: { agencyId },
    });

    const packageIds = [...new Set(trips.map((t) => t.packageId).filter(Boolean))] as string[];
    const packages = packageIds.length > 0
      ? await prisma.package.findMany({
          where: { id: { in: packageIds } },
          select: { id: true, publishedPrice: true },
        })
      : [];
    const packageMap = new Map(packages.map((p) => [p.id, p.publishedPrice]));

    const tripMap = new Map(trips.map((t) => [
      t.id,
      { ...t, packagePrice: t.packageId ? (packageMap.get(t.packageId) || 0) : 0 },
    ]));

    // Aggregate totals
    let totalRevenue = 0;
    let totalOutstanding = 0;
    let paidPilgrims = 0;
    const methodBreakdown: Record<string, number> = {};
    const typeBreakdown: Record<string, number> = {};
    const tripRevenue: Record<string, { name: string; revenue: number; outstanding: number; pilgrimCount: number }> = {};
    const monthlyRevenue: Record<string, number> = {};

    for (const p of pilgrims) {
      totalRevenue += p.totalPaid;

      // Calculate outstanding from package price via trip
      const trip = p.tripId ? tripMap.get(p.tripId) : null;
      const packagePrice = trip?.packagePrice || 0;
      const outstanding = Math.max(0, packagePrice - p.totalPaid);
      totalOutstanding += outstanding;

      if (outstanding <= 0 && p.totalPaid > 0) {
        paidPilgrims++;
      }

      // Group by trip
      const tripId = p.tripId || '_unassigned';
      if (!tripRevenue[tripId]) {
        tripRevenue[tripId] = {
          name: trip?.name || 'Belum ditugaskan',
          revenue: 0,
          outstanding: 0,
          pilgrimCount: 0,
        };
      }
      tripRevenue[tripId].revenue += p.totalPaid;
      tripRevenue[tripId].outstanding += outstanding;
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
      paidPilgrims,
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
