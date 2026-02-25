import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { logActivity } from '@/lib/activity-logger';
import nodemailer from 'nodemailer';
import { generateFinancialReport, generatePilgrimReport, generateTripReport } from '@/lib/services/report-generator.service';
import { logger } from '@/lib/logger';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: Number(process.env.SMTP_PORT) || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

const FROM = process.env.SMTP_FROM || process.env.SMTP_USER || 'noreply@gezma.com';
const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'GEZMA Agent';

export async function POST(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const body = await req.json();
    const { reportId } = body;

    if (!reportId) {
      return NextResponse.json({ error: 'reportId wajib diisi' }, { status: 400 });
    }

    const report = await prisma.scheduledReport.findFirst({
      where: { id: reportId, agencyId: auth.agencyId },
      include: { agency: { select: { name: true } } },
    });

    if (!report) {
      return NextResponse.json({ error: 'Laporan terjadwal tidak ditemukan' }, { status: 404 });
    }

    let htmlContent: string;
    const reportTypeLabels: Record<string, string> = {
      financial: 'Keuangan',
      pilgrim: 'Jemaah',
      trip: 'Trip',
    };

    switch (report.reportType) {
      case 'financial':
        htmlContent = await generateFinancialReport(auth.agencyId);
        break;
      case 'pilgrim':
        htmlContent = await generatePilgrimReport(auth.agencyId);
        break;
      case 'trip':
        htmlContent = await generateTripReport(auth.agencyId);
        break;
      default:
        return NextResponse.json({ error: 'Tipe laporan tidak dikenal' }, { status: 400 });
    }

    const now = new Date();
    const dateStr = now.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });

    const fullHtml = `
      <div style="font-family: sans-serif; max-width: 700px; margin: 0 auto; padding: 24px;">
        <div style="background: #2563eb; color: white; padding: 20px 24px; border-radius: 8px 8px 0 0;">
          <h1 style="margin: 0; font-size: 20px;">${APP_NAME} - Laporan ${reportTypeLabels[report.reportType] || report.reportType}</h1>
          <p style="margin: 4px 0 0 0; font-size: 14px; opacity: 0.9;">${report.agency.name} | ${dateStr}</p>
        </div>
        <div style="padding: 24px; border: 1px solid #e5e7eb; border-top: none; border-radius: 0 0 8px 8px;">
          ${htmlContent}
          <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 24px 0;" />
          <p style="font-size: 12px; color: #9ca3af;">Laporan ini dikirim otomatis oleh ${APP_NAME}. Frekuensi: ${report.frequency === 'weekly' ? 'Mingguan' : 'Bulanan'}</p>
        </div>
      </div>
    `;

    await transporter.sendMail({
      from: `"${APP_NAME}" <${FROM}>`,
      to: report.emailTo,
      subject: `[${APP_NAME}] Laporan ${reportTypeLabels[report.reportType] || report.reportType} - ${dateStr}`,
      html: fullHtml,
    });

    // Update lastSentAt
    await prisma.scheduledReport.update({
      where: { id: reportId },
      data: { lastSentAt: now },
    });

    logActivity({
      type: 'system',
      action: 'sent',
      title: 'Laporan terjadwal dikirim',
      description: `Laporan ${report.reportType} dikirim ke ${report.emailTo}`,
      userId: auth.userId,
      agencyId: auth.agencyId,
      metadata: { entityId: reportId },
    });

    return NextResponse.json({ success: true, sentTo: report.emailTo });
  } catch (error) {
    logger.error('POST /api/reports/send-scheduled error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
