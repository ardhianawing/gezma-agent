import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';

interface PaymentItem {
  amount: number;
  type: string;
  method: string;
  date: Date;
}

interface PilgrimWithPayments {
  totalPaid: number;
  tripId: string | null;
  payments: PaymentItem[];
}

function computeFinancials(
  pilgrims: PilgrimWithPayments[],
  tripMap: Map<string, { name: string; packagePrice: number }>,
  dateFrom?: Date,
  dateTo?: Date,
) {
  let totalRevenue = 0;
  let totalOutstanding = 0;
  let paidPilgrims = 0;
  const methodBreakdown: Record<string, number> = {};
  const typeBreakdown: Record<string, number> = {};
  const tripRevenue: Record<string, { name: string; revenue: number; outstanding: number; pilgrimCount: number }> = {};
  const monthlyRevenue: Record<string, number> = {};

  for (const p of pilgrims) {
    // Filter payments by date range if provided
    const filteredPayments = (dateFrom && dateTo)
      ? p.payments.filter(pay => {
          const d = new Date(pay.date);
          return d >= dateFrom && d <= dateTo;
        })
      : p.payments;

    const periodRevenue = filteredPayments.reduce((s, pay) => s + pay.amount, 0);
    totalRevenue += periodRevenue;

    const trip = p.tripId ? tripMap.get(p.tripId) : null;
    const packagePrice = trip?.packagePrice || 0;
    const outstanding = Math.max(0, packagePrice - p.totalPaid);
    totalOutstanding += outstanding;

    if (outstanding <= 0 && p.totalPaid > 0) {
      paidPilgrims++;
    }

    const tripId = p.tripId || '_unassigned';
    if (!tripRevenue[tripId]) {
      tripRevenue[tripId] = {
        name: trip?.name || 'Belum ditugaskan',
        revenue: 0,
        outstanding: 0,
        pilgrimCount: 0,
      };
    }
    tripRevenue[tripId].revenue += periodRevenue;
    tripRevenue[tripId].outstanding += outstanding;
    tripRevenue[tripId].pilgrimCount += 1;

    for (const pay of filteredPayments) {
      methodBreakdown[pay.method] = (methodBreakdown[pay.method] || 0) + pay.amount;
      typeBreakdown[pay.type] = (typeBreakdown[pay.type] || 0) + pay.amount;
      const month = new Date(pay.date).toISOString().slice(0, 7);
      monthlyRevenue[month] = (monthlyRevenue[month] || 0) + pay.amount;
    }
  }

  const monthlySorted = Object.entries(monthlyRevenue)
    .sort(([a], [b]) => b.localeCompare(a))
    .slice(0, 12)
    .map(([month, amount]) => ({ month, amount }));

  const tripRevenueSorted = Object.values(tripRevenue).sort((a, b) => b.revenue - a.revenue);

  return {
    totalRevenue,
    totalOutstanding,
    totalPilgrims: pilgrims.length,
    paidPilgrims,
    methodBreakdown,
    typeBreakdown,
    tripRevenue: tripRevenueSorted,
    monthlyRevenue: monthlySorted,
  };
}

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { agencyId } = auth;
  const url = new URL(req.url);
  const compareFrom = url.searchParams.get('compareFrom');
  const compareTo = url.searchParams.get('compareTo');

  try {
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
      { name: t.name, packagePrice: t.packageId ? (packageMap.get(t.packageId) || 0) : 0 },
    ]));

    // Main result (no date filter — all time)
    const result = computeFinancials(pilgrims, tripMap);

    // Comparison period if requested
    let comparison = null;
    if (compareFrom && compareTo) {
      const cFrom = new Date(compareFrom);
      const cTo = new Date(compareTo);
      if (!isNaN(cFrom.getTime()) && !isNaN(cTo.getTime())) {
        comparison = computeFinancials(pilgrims, tripMap, cFrom, cTo);
      }
    }

    return NextResponse.json({
      ...result,
      ...(comparison ? { comparison } : {}),
    });
  } catch (error) {
    console.error('GET /api/reports/financial error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
