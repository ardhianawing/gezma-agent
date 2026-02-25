import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { getWAConfig, updateWAConfig, WAProvider } from '@/lib/services/whatsapp.service';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const config = await getWAConfig(auth.agencyId);
    return NextResponse.json({ data: config });
  } catch (error) {
    logger.error('GET /api/integrations/whatsapp error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const body = await req.json();

    const { provider, isEnabled, apiKey, senderNumber } = body as {
      provider?: WAProvider;
      isEnabled?: boolean;
      apiKey?: string;
      senderNumber?: string;
    };

    const updates: Record<string, unknown> = {};
    if (provider !== undefined) updates.provider = provider;
    if (typeof isEnabled === 'boolean') updates.isEnabled = isEnabled;
    if (typeof apiKey === 'string') updates.apiKey = apiKey;
    if (typeof senderNumber === 'string') updates.senderNumber = senderNumber;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'Tidak ada data yang diperbarui' },
        { status: 400 }
      );
    }

    const config = await updateWAConfig(auth.agencyId, updates);
    return NextResponse.json({ data: config });
  } catch (error) {
    logger.error('POST /api/integrations/whatsapp error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
