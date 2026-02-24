import { NextRequest, NextResponse } from 'next/server';
import { getPilgrimPayload } from '@/lib/auth-pilgrim';
import { getPilgrimStats } from '@/lib/services/pilgrim-gamification.service';

export async function GET(req: NextRequest) {
  try {
    const payload = getPilgrimPayload(req);
    if (!payload) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    const stats = await getPilgrimStats(payload.pilgrimId);
    return NextResponse.json(stats);
  } catch (error) {
    console.error('GET /api/pilgrim-portal/gamification/stats error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
