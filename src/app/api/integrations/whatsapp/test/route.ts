import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { testConnection } from '@/lib/services/whatsapp.service';

export async function POST(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const result = await testConnection(auth.agencyId);
    return NextResponse.json({ data: result });
  } catch (error) {
    console.error('POST /api/integrations/whatsapp/test error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
