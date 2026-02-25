import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export const dynamic = 'force-dynamic';

export async function GET() {
  const checks: Record<string, boolean> = {
    database: false,
    cron: process.env.CRON_ENABLED !== 'false',
  };

  try {
    await prisma.$queryRaw`SELECT 1`;
    checks.database = true;
  } catch {
    // database unreachable
  }

  const allReady = Object.values(checks).every(Boolean);

  return NextResponse.json(
    {
      ready: allReady,
      checks,
      timestamp: new Date().toISOString(),
    },
    { status: allReady ? 200 : 503 }
  );
}
