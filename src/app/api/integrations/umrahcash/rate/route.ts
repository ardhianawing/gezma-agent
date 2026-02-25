import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { getCurrentRate, lockRate, getLockedRate } from '@/lib/services/umrahcash.service';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const [currentRate, locked] = await Promise.all([
      getCurrentRate(),
      getLockedRate(auth.agencyId),
    ]);

    return NextResponse.json({
      data: {
        current: currentRate,
        locked: locked || null,
      },
    });
  } catch (error) {
    logger.error('GET /api/integrations/umrahcash/rate error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const body = await req.json();
    const { amountSAR } = body as { amountSAR?: number };

    if (!amountSAR || amountSAR <= 0) {
      return NextResponse.json(
        { error: 'Jumlah SAR harus lebih dari 0' },
        { status: 400 }
      );
    }

    const locked = await lockRate(auth.agencyId, amountSAR);
    return NextResponse.json({ data: locked });
  } catch (error) {
    logger.error('POST /api/integrations/umrahcash/rate error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
