import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  // Only owner/admin can export all agency data
  if (!['owner', 'admin'].includes(auth.role)) {
    return NextResponse.json({ error: 'Hanya owner/admin yang bisa export data' }, { status: 403 });
  }

  const { agencyId } = auth;

  try {
    const [pilgrims, packages, trips, payments, activityLogs] = await Promise.all([
      prisma.pilgrim.findMany({
        where: { agencyId },
        include: {
          documents: { select: { id: true, type: true, status: true, fileName: true, uploadedAt: true } },
        },
      }),
      prisma.package.findMany({ where: { agencyId } }),
      prisma.trip.findMany({ where: { agencyId } }),
      prisma.paymentRecord.findMany({
        where: { pilgrim: { agencyId } },
      }),
      prisma.activityLog.findMany({
        where: { agencyId },
        orderBy: { createdAt: 'desc' },
        take: 500,
      }),
    ]);

    const exportData = {
      exportedAt: new Date().toISOString(),
      agencyId,
      pilgrims,
      packages,
      trips,
      payments,
      activityLogs,
    };

    const json = JSON.stringify(exportData, null, 2);
    const dateStr = new Date().toISOString().split('T')[0];

    return new NextResponse(json, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="gezma-export-${dateStr}.json"`,
      },
    });
  } catch (error) {
    logger.error('GET /api/agency/export error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
