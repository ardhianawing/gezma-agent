import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { createScheduledReportSchema } from '@/lib/validations/scheduled-report';
import { logActivity } from '@/lib/activity-logger';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const reports = await prisma.scheduledReport.findMany({
      where: { agencyId: auth.agencyId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ reports });
  } catch (error) {
    logger.error('GET /api/settings/scheduled-reports error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const body = await req.json();
    const parsed = createScheduledReportSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      return NextResponse.json({ error: 'Validasi gagal', errors }, { status: 400 });
    }

    const { frequency, reportType, dayOfWeek, dayOfMonth, emailTo } = parsed.data;

    const report = await prisma.scheduledReport.create({
      data: {
        frequency,
        reportType,
        dayOfWeek: frequency === 'weekly' ? (dayOfWeek ?? 1) : null,
        dayOfMonth: frequency === 'monthly' ? (dayOfMonth ?? 1) : null,
        emailTo,
        isActive: true,
        agencyId: auth.agencyId,
      },
    });

    logActivity({
      type: 'settings',
      action: 'created',
      title: 'Laporan terjadwal dibuat',
      description: `Laporan ${reportType} (${frequency}) ke ${emailTo}`,
      userId: auth.userId,
      agencyId: auth.agencyId,
      metadata: { entityId: report.id },
    });

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    logger.error('POST /api/settings/scheduled-reports error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
