import { NextRequest, NextResponse } from 'next/server';
import { getCCAuthPayload, ccUnauthorizedResponse } from '@/lib/auth-command-center';
import { getRecentErrors, getErrorStats } from '@/lib/error-monitor';

export async function GET(req: NextRequest) {
  const auth = getCCAuthPayload(req);
  if (!auth) return ccUnauthorizedResponse();

  const url = new URL(req.url);
  const limit = parseInt(url.searchParams.get('limit') || '20', 10);

  return NextResponse.json({
    stats: getErrorStats(),
    errors: getRecentErrors(Math.min(limit, 100)),
  });
}
