import { NextRequest, NextResponse } from 'next/server';
import { getCCAuthPayload, ccUnauthorizedResponse } from '@/lib/auth-command-center';
import { getApiMetrics, getSlowRoutes } from '@/lib/api-metrics';
import { getCircuitBreakerStatus } from '@/lib/circuit-breaker';
import { logger } from '@/lib/logger';

/**
 * GET /api/command-center/metrics
 * Performance metrics dashboard for CC admins.
 */
export async function GET(req: NextRequest) {
  const auth = getCCAuthPayload(req);
  if (!auth) return ccUnauthorizedResponse();

  try {
    const metrics = getApiMetrics();
    const slowRoutes = getSlowRoutes(500);
    const circuitBreakers = getCircuitBreakerStatus();

    return NextResponse.json({
      metrics,
      slowRoutes,
      circuitBreakers,
      serverUptime: Math.round(process.uptime()),
      memoryUsage: {
        heapUsedMB: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        heapTotalMB: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        rssMB: Math.round(process.memoryUsage().rss / 1024 / 1024),
      },
    });
  } catch (error) {
    logger.error('GET /api/command-center/metrics error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
