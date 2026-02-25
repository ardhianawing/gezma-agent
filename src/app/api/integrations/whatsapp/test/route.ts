import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { testConnection } from '@/lib/services/whatsapp.service';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const result = await testConnection(auth.agencyId);
    return NextResponse.json({ data: result });
  } catch (error) {
    logger.error('POST /api/integrations/whatsapp/test error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
