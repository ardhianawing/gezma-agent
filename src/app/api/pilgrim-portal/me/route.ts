import { NextRequest, NextResponse } from 'next/server';
import { getPilgrimPayload } from '@/lib/auth-pilgrim';
import { getPilgrimPortalData } from '@/lib/services/pilgrim-portal.service';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    const payload = getPilgrimPayload(req);

    if (!payload) {
      return NextResponse.json(
        { error: 'Tidak terautentikasi' },
        { status: 401 }
      );
    }

    const data = await getPilgrimPortalData(payload.pilgrimId);

    if (!data) {
      return NextResponse.json(
        { error: 'Data jemaah tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data });
  } catch (error) {
    logger.error('Pilgrim me error', { error: String(error) });
    return NextResponse.json(
      { error: 'Terjadi kesalahan server' },
      { status: 500 }
    );
  }
}
