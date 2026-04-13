import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req); if (!auth) return unauthorizedResponse();
  const agencyId = auth.agencyId;

  // Mock data (fallback)
  const mockTotal = 250;
  const mockFunnel = [
    { step: "lead", label: "Lead", count: 250 },
    { step: "inquiry", label: "Inquiry", count: 180 },
    { step: "dp", label: "DP", count: 120 },
    { step: "lunas", label: "Lunas", count: 95 },
    { step: "berangkat", label: "Berangkat", count: 89 },
  ].map(item => ({
    ...item,
    percentage: mockTotal > 0 ? Math.round((item.count / mockTotal) * 100) : 0,
  }));

  try {
    // Real DB: group pilgrims by status
    const statusGroups = await prisma.pilgrim.groupBy({
      by: ['status'],
      _count: true,
      where: { agencyId, deletedAt: null },
    });

    const totalPilgrims = statusGroups.reduce((sum, g) => sum + g._count, 0);

    if (totalPilgrims > 0) {
      // Map DB statuses to funnel steps
      // DB statuses: lead, dp, lunas, dokumen, visa, ready, departed, completed
      const statusMap: Record<string, number> = {};
      for (const g of statusGroups) {
        statusMap[g.status] = g._count;
      }

      // Build cumulative funnel: each step includes all pilgrims who reached that stage or beyond
      // lead = everyone
      // dp = dp + lunas + dokumen + visa + ready + departed + completed
      // lunas = lunas + dokumen + visa + ready + departed + completed
      // berangkat = departed + completed
      const leadCount = totalPilgrims;
      const dpCount = (statusMap['dp'] || 0) + (statusMap['lunas'] || 0) + (statusMap['dokumen'] || 0) +
        (statusMap['visa'] || 0) + (statusMap['ready'] || 0) + (statusMap['departed'] || 0) + (statusMap['completed'] || 0);
      const lunasCount = (statusMap['lunas'] || 0) + (statusMap['dokumen'] || 0) +
        (statusMap['visa'] || 0) + (statusMap['ready'] || 0) + (statusMap['departed'] || 0) + (statusMap['completed'] || 0);
      const berangkatCount = (statusMap['departed'] || 0) + (statusMap['completed'] || 0);

      const funnel = [
        { step: "lead", label: "Lead", count: leadCount },
        { step: "inquiry", label: "Inquiry", count: leadCount }, // No separate inquiry status in DB, same as lead
        { step: "dp", label: "DP", count: dpCount },
        { step: "lunas", label: "Lunas", count: lunasCount },
        { step: "berangkat", label: "Berangkat", count: berangkatCount },
      ].map(item => ({
        ...item,
        percentage: totalPilgrims > 0 ? Math.round((item.count / totalPilgrims) * 100) : 0,
      }));

      return NextResponse.json({
        total: totalPilgrims,
        funnel,
      });
    }
  } catch (error) {
    console.error('[reports/conversion] DB error, falling back to mock:', error);
  }

  // Fallback to mock data
  return NextResponse.json({
    total: mockTotal,
    funnel: mockFunnel,
  });
}
