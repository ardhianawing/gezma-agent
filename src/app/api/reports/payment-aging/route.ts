import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req); if (!auth) return unauthorizedResponse();
  const agencyId = auth.agencyId;

  // Mock data (fallback)
  const mockData = {
    totalOutstanding: 450000000,
    agingBuckets: [
      { range: "0-30", amount: 225000000 },
      { range: "31-60", amount: 120000000 },
      { range: "61-90", amount: 60000000 },
      { range: "90+", amount: 45000000 },
    ],
    topDebtors: [
      { name: "Ahmad Fauzi", outstanding: 45000000, daysOverdue: 95 },
      { name: "Siti Aminah", outstanding: 38000000, daysOverdue: 72 },
      { name: "Budi Santoso", outstanding: 32000000, daysOverdue: 65 },
      { name: "Dewi Lestari", outstanding: 28000000, daysOverdue: 48 },
      { name: "Hasan Basri", outstanding: 25000000, daysOverdue: 35 },
      { name: "Fatimah Zahra", outstanding: 22000000, daysOverdue: 28 },
      { name: "Rizki Ramadhan", outstanding: 18000000, daysOverdue: 22 },
      { name: "Nur Hidayah", outstanding: 15000000, daysOverdue: 15 },
      { name: "Yusuf Hakim", outstanding: 12000000, daysOverdue: 10 },
      { name: "Aisyah Putri", outstanding: 10000000, daysOverdue: 5 },
    ],
  };

  try {
    // Real DB: get total outstanding from pilgrim balances
    const outstandingAgg = await prisma.pilgrim.aggregate({
      _sum: { remainingBalance: true },
      where: { agencyId, deletedAt: null, remainingBalance: { gt: 0 } },
    });

    const totalOutstanding = outstandingAgg._sum.remainingBalance || 0;

    if (totalOutstanding > 0) {
      // TODO: implement real aging calculation (requires date-based bucketing of payment records)
      // For now, use real totalOutstanding with mock aging buckets (proportionally scaled)
      const mockTotal = mockData.totalOutstanding;
      const scale = totalOutstanding / mockTotal;

      return NextResponse.json({
        totalOutstanding,
        // Scale mock aging buckets proportionally to real totalOutstanding
        agingBuckets: mockData.agingBuckets.map(b => ({
          ...b,
          amount: Math.round(b.amount * scale),
        })),
        // Top debtors: keep mock for now
        // TODO: implement real top debtors from pilgrims with highest remainingBalance
        topDebtors: mockData.topDebtors,
      });
    }
  } catch (error) {
    console.error('[reports/payment-aging] DB error, falling back to mock:', error);
  }

  // Fallback to mock data
  return NextResponse.json(mockData);
}
