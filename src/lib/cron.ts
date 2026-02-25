import cron from 'node-cron';
import { logger } from '@/lib/logger';

export function initCronJobs() {
  const enabled = process.env.CRON_ENABLED !== 'false';
  if (!enabled) {
    logger.info('Cron jobs disabled (CRON_ENABLED=false)');
    return;
  }

  // Scheduled Reports — every hour
  cron.schedule('0 * * * *', async () => {
    logger.info('Cron: checking scheduled reports');
    try {
      const { prisma } = await import('@/lib/prisma');
      const { generateFinancialReport, generatePilgrimReport, generateTripReport } = await import('@/lib/services/report-generator.service');
      const nodemailer = (await import('nodemailer')).default;

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

      const reports = await prisma.scheduledReport.findMany({
        where: { isActive: true },
        include: { agency: { select: { name: true } } },
      });

      const now = new Date();
      const dayOfWeek = now.getDay(); // 0=Sun
      const dayOfMonth = now.getDate();
      let sentCount = 0;

      for (const report of reports) {
        let isDue = false;

        if (report.frequency === 'weekly') {
          const targetDay = report.dayOfWeek ?? 1; // default Monday
          if (dayOfWeek === targetDay) {
            const sixDaysAgo = new Date(now.getTime() - 6 * 24 * 60 * 60 * 1000);
            isDue = !report.lastSentAt || report.lastSentAt < sixDaysAgo;
          }
        } else if (report.frequency === 'monthly') {
          const targetDom = report.dayOfMonth ?? 1;
          if (dayOfMonth === targetDom) {
            const twentySevenDaysAgo = new Date(now.getTime() - 27 * 24 * 60 * 60 * 1000);
            isDue = !report.lastSentAt || report.lastSentAt < twentySevenDaysAgo;
          }
        }

        if (!isDue) continue;

        try {
          let htmlContent: string;
          const reportTypeLabels: Record<string, string> = {
            financial: 'Keuangan',
            pilgrim: 'Jemaah',
            trip: 'Trip',
          };

          switch (report.reportType) {
            case 'financial':
              htmlContent = await generateFinancialReport(report.agencyId);
              break;
            case 'pilgrim':
              htmlContent = await generatePilgrimReport(report.agencyId);
              break;
            case 'trip':
              htmlContent = await generateTripReport(report.agencyId);
              break;
            default:
              continue;
          }

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

          await prisma.scheduledReport.update({
            where: { id: report.id },
            data: { lastSentAt: now },
          });

          sentCount++;
        } catch (err) {
          logger.error('Cron: failed to send report', { reportId: report.id, error: String(err) });
        }
      }

      if (sentCount > 0) {
        logger.info('Cron: scheduled reports sent', { count: sentCount });
      }
    } catch (err) {
      logger.error('Cron: scheduled reports job failed', { error: String(err) });
    }
  });

  // PPIU Auto-Suspend — daily at 01:00
  cron.schedule('0 1 * * *', async () => {
    logger.info('Cron: checking PPIU expiry for auto-suspend');
    try {
      const { prisma } = await import('@/lib/prisma');
      const now = new Date();

      const result = await prisma.agency.updateMany({
        where: {
          ppiuExpiryDate: { lt: now },
          ppiuStatus: { not: 'expired' },
        },
        data: { ppiuStatus: 'expired' },
      });

      if (result.count > 0) {
        logger.warn('Cron: PPIU auto-suspended agencies', { count: result.count });
      }
    } catch (err) {
      logger.error('Cron: PPIU auto-suspend job failed', { error: String(err) });
    }
  });

  // PPIU Expiry Alerts — daily at 08:00
  cron.schedule('0 8 * * *', async () => {
    logger.info('Cron: checking PPIU expiry alerts');
    try {
      const { prisma } = await import('@/lib/prisma');
      const now = new Date();
      const thirtyDaysLater = new Date(now.getTime() + 30 * 24 * 60 * 60 * 1000);

      const expiring = await prisma.agency.findMany({
        where: {
          ppiuExpiryDate: { gte: now, lte: thirtyDaysLater },
          ppiuStatus: { not: 'expired' },
        },
        select: { id: true, name: true, ppiuExpiryDate: true },
      });

      if (expiring.length > 0) {
        for (const agency of expiring) {
          const daysLeft = Math.ceil((agency.ppiuExpiryDate!.getTime() - now.getTime()) / (24 * 60 * 60 * 1000));
          logger.warn('Cron: PPIU expiring soon', { agencyId: agency.id, name: agency.name, daysLeft });
        }
      }
    } catch (err) {
      logger.error('Cron: PPIU expiry alerts job failed', { error: String(err) });
    }
  });

  logger.info('Cron jobs initialized', { jobs: ['scheduled-reports', 'ppiu-auto-suspend', 'ppiu-expiry-alerts'] });
}
