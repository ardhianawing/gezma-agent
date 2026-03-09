import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const compareFrom = searchParams.get('compareFrom');
  const compareTo = searchParams.get('compareTo');

  const mainData = {
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

  const response: Record<string, unknown> = { ...mainData };

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
