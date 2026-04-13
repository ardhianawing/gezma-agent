import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req); if (!auth) return unauthorizedResponse();
  return NextResponse.json({
    revenueTrend: [
      { month: 'Sep 2025', amount: 350000000 },
      { month: 'Oct 2025', amount: 420000000 },
      { month: 'Nov 2025', amount: 380000000 },
      { month: 'Dec 2025', amount: 510000000 },
      { month: 'Jan 2026', amount: 460000000 },
      { month: 'Feb 2026', amount: 730000000 },
    ],
    pilgrimStatus: [
      { status: 'lead', count: 23 },
      { status: 'dp', count: 18 },
      { status: 'lunas', count: 31 },
      { status: 'dokumen', count: 15 },
      { status: 'visa', count: 12 },
      { status: 'ready', count: 28 },
      { status: 'departed', count: 19 },
      { status: 'completed', count: 10 },
    ],
    tripCapacity: [
      { name: 'Umrah Reguler Mar 2026', capacity: 45, registered: 42 },
      { name: 'Umrah VIP Apr 2026', capacity: 20, registered: 18 },
      { name: 'Umrah Ramadhan 2026', capacity: 45, registered: 45 },
    ],
  });
}
