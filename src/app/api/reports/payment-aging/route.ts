import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const pilgrims = await prisma.pilgrim.findMany({
      where: { agencyId: auth.agencyId },
      select: {
        id: true, name: true, totalPaid: true, remainingBalance: true,
        tripId: true, createdAt: true,
      },
    });

    // Get package prices via trips
    const tripIds = [...new Set(pilgrims.map(p => p.tripId).filter(Boolean))] as string[];
    const trips = tripIds.length > 0
      ? await prisma.trip.findMany({ where: { id: { in: tripIds } }, select: { id: true, packageId: true } })
      : [];
    const packageIds = [...new Set(trips.map(t => t.packageId).filter(Boolean))] as string[];
    const packages = packageIds.length > 0
      ? await prisma.package.findMany({ where: { id: { in: packageIds } }, select: { id: true, publishedPrice: true } })
      : [];
    const pkgMap = new Map(packages.map(p => [p.id, p.publishedPrice]));
    const tripPkgMap = new Map(trips.map(t => [t.id, t.packageId ? (pkgMap.get(t.packageId) || 0) : 0]));

    const now = new Date();
    const buckets = { '0-30': 0, '31-60': 0, '61-90': 0, '90+': 0 };
    const debtors: { name: string; outstanding: number; daysOverdue: number }[] = [];

    for (const p of pilgrims) {
      const packagePrice = p.tripId ? (tripPkgMap.get(p.tripId) || 0) : 0;
      const outstanding = Math.max(0, packagePrice - p.totalPaid);
      if (outstanding <= 0) continue;

      const daysSinceCreated = Math.floor((now.getTime() - new Date(p.createdAt).getTime()) / (1000 * 60 * 60 * 24));

      if (daysSinceCreated <= 30) buckets['0-30'] += outstanding;
      else if (daysSinceCreated <= 60) buckets['31-60'] += outstanding;
      else if (daysSinceCreated <= 90) buckets['61-90'] += outstanding;
      else buckets['90+'] += outstanding;

      debtors.push({ name: p.name, outstanding, daysOverdue: daysSinceCreated });
    }

    // Top 10 debtors
    debtors.sort((a, b) => b.outstanding - a.outstanding);
    const topDebtors = debtors.slice(0, 10);

    const agingBuckets = Object.entries(buckets).map(([range, amount]) => ({ range, amount }));
    const totalOutstanding = Object.values(buckets).reduce((a, b) => a + b, 0);

    return NextResponse.json({ totalOutstanding, agingBuckets, topDebtors });
  } catch (error) {
    logger.error('GET /api/reports/payment-aging error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
