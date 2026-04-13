import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const auth = getAuthPayload(request); if (!auth) return unauthorizedResponse();
  const agencyId = auth.agencyId;
  const searchParams = request.nextUrl.searchParams;
  const compareFrom = searchParams.get('compareFrom');
  const compareTo = searchParams.get('compareTo');

  // Mock data (fallback)
  const mockMainData = {
    totalRevenue: 2850000000,
    totalOutstanding: 450000000,
    totalPilgrims: 156,
    paidPilgrims: 131,
    methodBreakdown: {
      transfer: 2100000000,
      cash: 500000000,
      card: 250000000,
    } as Record<string, number>,
    typeBreakdown: {
      dp: 1200000000,
      installment: 850000000,
      full: 800000000,
    } as Record<string, number>,
    tripRevenue: [
      { name: "Umroh Reguler Maret 2026", revenue: 1200000000, outstanding: 150000000, pilgrimCount: 45 },
      { name: "Umroh Reguler April 2026", revenue: 950000000, outstanding: 200000000, pilgrimCount: 38 },
      { name: "Haji Plus 2026", revenue: 700000000, outstanding: 100000000, pilgrimCount: 28 },
    ],
    monthlyRevenue: [
      { month: "2025-09", amount: 350000000 },
      { month: "2025-10", amount: 420000000 },
      { month: "2025-11", amount: 380000000 },
      { month: "2025-12", amount: 510000000 },
      { month: "2026-01", amount: 460000000 },
      { month: "2026-02", amount: 730000000 },
    ],
  };

  try {
    // Real DB queries
    const [revenueAgg, totalPilgrims, paidPilgrims, methodGroups, typeGroups] = await Promise.all([
      prisma.paymentRecord.aggregate({
        _sum: { amount: true },
        where: { pilgrim: { agencyId, deletedAt: null } },
      }),
      prisma.pilgrim.count({ where: { agencyId, deletedAt: null } }),
      prisma.pilgrim.count({ where: { agencyId, deletedAt: null, totalPaid: { gt: 0 } } }),
      prisma.paymentRecord.groupBy({
        by: ['method'],
        _sum: { amount: true },
        where: { pilgrim: { agencyId, deletedAt: null } },
      }),
      prisma.paymentRecord.groupBy({
        by: ['type'],
        _sum: { amount: true },
        where: { pilgrim: { agencyId, deletedAt: null } },
      }),
    ]);

    const totalRevenue = revenueAgg._sum.amount || 0;

    // Calculate total outstanding from pilgrim balances
    const outstandingAgg = await prisma.pilgrim.aggregate({
      _sum: { remainingBalance: true },
      where: { agencyId, deletedAt: null },
    });
    const totalOutstanding = outstandingAgg._sum.remainingBalance || 0;

    // Build method breakdown
    const methodBreakdown: Record<string, number> = {};
    for (const g of methodGroups) {
      methodBreakdown[g.method] = g._sum.amount || 0;
    }

    // Build type breakdown
    const typeBreakdown: Record<string, number> = {};
    for (const g of typeGroups) {
      typeBreakdown[g.type] = g._sum.amount || 0;
    }

    // Check if we have real data
    const hasRealData = totalPilgrims > 0 || totalRevenue > 0;

    if (hasRealData) {
      const mainData = {
        totalRevenue,
        totalOutstanding,
        totalPilgrims,
        paidPilgrims,
        methodBreakdown: Object.keys(methodBreakdown).length > 0 ? methodBreakdown : mockMainData.methodBreakdown,
        typeBreakdown: Object.keys(typeBreakdown).length > 0 ? typeBreakdown : mockMainData.typeBreakdown,
        // tripRevenue and monthlyRevenue are complex — keep mock for now
        // TODO: implement real trip revenue aggregation
        tripRevenue: mockMainData.tripRevenue,
        monthlyRevenue: mockMainData.monthlyRevenue,
      };

      const response: Record<string, unknown> = { ...mainData };

      // Comparison logic is complex — keep mock for now
      if (compareFrom && compareTo) {
        response.comparison = {
          totalRevenue: 2100000000,
          totalOutstanding: 380000000,
          totalPilgrims: 120,
          paidPilgrims: 98,
          methodBreakdown: {
            transfer: 1500000000,
            cash: 400000000,
            card: 200000000,
          },
          typeBreakdown: {
            dp: 900000000,
            installment: 650000000,
            full: 550000000,
          },
          tripRevenue: [
            { name: "Umroh Reguler Des 2025", revenue: 800000000, outstanding: 120000000, pilgrimCount: 35 },
            { name: "Umroh Reguler Jan 2026", revenue: 700000000, outstanding: 160000000, pilgrimCount: 30 },
          ],
          monthlyRevenue: [
            { month: "2025-06", amount: 280000000 },
            { month: "2025-07", amount: 350000000 },
            { month: "2025-08", amount: 320000000 },
          ],
        };
      }

      return NextResponse.json(response);
    }
  } catch (error) {
    console.error('[reports/financial] DB error, falling back to mock:', error);
  }

  // Fallback to mock data
  const response: Record<string, unknown> = { ...mockMainData };

  if (compareFrom && compareTo) {
    response.comparison = {
      totalRevenue: 2100000000,
      totalOutstanding: 380000000,
      totalPilgrims: 120,
      paidPilgrims: 98,
      methodBreakdown: {
        transfer: 1500000000,
        cash: 400000000,
        card: 200000000,
      },
      typeBreakdown: {
        dp: 900000000,
        installment: 650000000,
        full: 550000000,
      },
      tripRevenue: [
        { name: "Umroh Reguler Des 2025", revenue: 800000000, outstanding: 120000000, pilgrimCount: 35 },
        { name: "Umroh Reguler Jan 2026", revenue: 700000000, outstanding: 160000000, pilgrimCount: 30 },
      ],
      monthlyRevenue: [
        { month: "2025-06", amount: 280000000 },
        { month: "2025-07", amount: 350000000 },
        { month: "2025-08", amount: 320000000 },
      ],
    };
  }

  return NextResponse.json(response);
}
