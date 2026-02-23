import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { listTemplates } from '@/lib/services/whatsapp.service';

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const templates = await listTemplates(auth.agencyId);
    return NextResponse.json({ data: templates });
  } catch (error) {
    console.error('GET /api/integrations/whatsapp/templates error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
