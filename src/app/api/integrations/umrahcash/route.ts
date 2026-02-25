import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { getUmrahCashConfig, updateUmrahCashConfig, getCurrentRate } from '@/lib/services/umrahcash.service';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const [config, rate] = await Promise.all([
      getUmrahCashConfig(auth.agencyId),
      getCurrentRate(),
    ]);

    return NextResponse.json({ data: { config, rate } });
  } catch (error) {
    logger.error('GET /api/integrations/umrahcash error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const body = await req.json();

    const { isEnabled, apiKey, partnerId, partnerStatus } = body as {
      isEnabled?: boolean;
      apiKey?: string;
      partnerId?: string;
      partnerStatus?: 'pending' | 'active' | 'suspended' | 'not_registered';
    };

    const updates: Record<string, unknown> = {};
    if (typeof isEnabled === 'boolean') updates.isEnabled = isEnabled;
    if (typeof apiKey === 'string') updates.apiKey = apiKey;
    if (typeof partnerId === 'string') updates.partnerId = partnerId;
    if (typeof partnerStatus === 'string') updates.partnerStatus = partnerStatus;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'Tidak ada data yang diperbarui' },
        { status: 400 }
      );
    }

    const config = await updateUmrahCashConfig(auth.agencyId, updates);
    return NextResponse.json({ data: config });
  } catch (error) {
    logger.error('POST /api/integrations/umrahcash error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
