import { NextRequest, NextResponse } from 'next/server';
import { runAllMaintenance } from '@/lib/cron/db-maintenance';
import { logger } from '@/lib/logger';

/**
 * POST /api/cron/db-maintenance — Run database maintenance tasks.
 * Protected by CRON_SECRET header.
 *
 * Configure in Vercel: vercel.json > crons
 * Or call via external scheduler: curl -X POST -H "Authorization: Bearer $CRON_SECRET" .../api/cron/db-maintenance
 */
export async function POST(req: NextRequest) {
  // Verify cron secret
  const authHeader = req.headers.get('authorization');
  const cronSecret = process.env.CRON_SECRET;

  if (!cronSecret) {
    return NextResponse.json({ error: 'CRON_SECRET not configured' }, { status: 500 });
  }

  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const startTime = Date.now();
    const results = await runAllMaintenance();
    const duration = Date.now() - startTime;

    logger.info('DB maintenance completed', { duration, results });

    return NextResponse.json({
      message: 'Maintenance selesai',
      duration: `${duration}ms`,
      results,
    });
  } catch (error) {
    logger.error('DB maintenance cron error', { error: String(error) });
    return NextResponse.json({ error: 'Maintenance gagal' }, { status: 500 });
  }
}
