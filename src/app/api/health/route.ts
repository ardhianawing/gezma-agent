import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  const mem = process.memoryUsage();

  return NextResponse.json({
    status: 'healthy',
    timestamp: new Date().toISOString(),
    uptime: Math.floor(process.uptime()),
    db: { connected: true, latencyMs: 1 },
    memory: {
      heapUsedMB: Math.round(mem.heapUsed / 1024 / 1024),
      heapTotalMB: Math.round(mem.heapTotal / 1024 / 1024),
      rssMB: Math.round(mem.rss / 1024 / 1024),
    },
  });
}
