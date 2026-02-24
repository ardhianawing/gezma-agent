import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';

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
    console.error('GET /api/settings/scheduled-reports error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const body = await req.json();
    const { frequency, reportType, dayOfWeek, dayOfMonth, emailTo } = body;

    if (!frequency || !reportType || !emailTo) {
      return NextResponse.json({ error: 'frequency, reportType, dan emailTo wajib diisi' }, { status: 400 });
    }

    if (!['weekly', 'monthly'].includes(frequency)) {
      return NextResponse.json({ error: 'Frequency harus weekly atau monthly' }, { status: 400 });
    }

    if (!['financial', 'pilgrim', 'trip'].includes(reportType)) {
      return NextResponse.json({ error: 'Report type harus financial, pilgrim, atau trip' }, { status: 400 });
    }

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

    return NextResponse.json(report, { status: 201 });
  } catch (error) {
    console.error('POST /api/settings/scheduled-reports error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
