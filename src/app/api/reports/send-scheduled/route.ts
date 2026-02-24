import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import nodemailer from 'nodemailer';

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

function formatCurrency(amount: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(amount);
}

async function generateFinancialReport(agencyId: string) {
  const pilgrims = await prisma.pilgrim.findMany({
    where: { agencyId },
    select: { totalPaid: true, status: true },
  });
  const totalRevenue = pilgrims.reduce((sum, p) => sum + p.totalPaid, 0);
  const totalPilgrims = pilgrims.length;
  const paidCount = pilgrims.filter(p => p.totalPaid > 0).length;

  return `
    <h2>Laporan Keuangan</h2>
    <table style="border-collapse: collapse; width: 100%; font-family: sans-serif;">
      <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Total Pemasukan</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${formatCurrency(totalRevenue)}</td></tr>
      <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Total Jemaah</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${totalPilgrims}</td></tr>
      <tr><td style="padding: 8px; border: 1px solid #ddd;"><strong>Jemaah Sudah Bayar</strong></td><td style="padding: 8px; border: 1px solid #ddd;">${paidCount}</td></tr>
    </table>
  `;
}

async function generatePilgrimReport(agencyId: string) {
  const counts = await prisma.pilgrim.groupBy({
    by: ['status'],
    where: { agencyId },
    _count: true,
  });
  const total = counts.reduce((s, c) => s + c._count, 0);
  const rows = counts.map(c => `<tr><td style="padding: 8px; border: 1px solid #ddd;">${c.status}</td><td style="padding: 8px; border: 1px solid #ddd;">${c._count}</td></tr>`).join('');

  return `
    <h2>Laporan Jemaah</h2>
    <p>Total Jemaah: <strong>${total}</strong></p>
    <table style="border-collapse: collapse; width: 100%; font-family: sans-serif;">
      <tr style="background: #f5f5f5;"><th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Status</th><th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Jumlah</th></tr>
      ${rows}
    </table>
  `;
}

async function generateTripReport(agencyId: string) {
  const trips = await prisma.trip.findMany({
    where: { agencyId },
    select: { name: true, status: true, departureDate: true, registeredCount: true },
    orderBy: { departureDate: 'desc' },
    take: 10,
  });
  const rows = trips.map(t => `
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;">${t.name}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${t.status}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${t.departureDate ? new Date(t.departureDate).toLocaleDateString('id-ID') : '-'}</td>
      <td style="padding: 8px; border: 1px solid #ddd;">${t.registeredCount}</td>
    </tr>
  `).join('');

  return `
    <h2>Laporan Trip</h2>
    <table style="border-collapse: collapse; width: 100%; font-family: sans-serif;">
      <tr style="background: #f5f5f5;">
        <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Nama Trip</th>
        <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Status</th>
        <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Keberangkatan</th>
        <th style="padding: 8px; border: 1px solid #ddd; text-align: left;">Jemaah</th>
      </tr>
      ${rows}
    </table>
  `;
}

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

    return NextResponse.json({ success: true, sentTo: report.emailTo });
  } catch (error) {
    console.error('POST /api/reports/send-scheduled error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
