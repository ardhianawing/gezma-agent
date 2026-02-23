import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { getNusukConfig, updateNusukConfig } from '@/lib/services/nusuk.service';

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const config = await getNusukConfig(auth.agencyId);
    return NextResponse.json({ data: config });
  } catch (error) {
    console.error('GET /api/integrations/nusuk error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const body = await req.json();

    const { isEnabled, apiKey, baseUrl } = body as {
      isEnabled?: boolean;
      apiKey?: string;
      baseUrl?: string;
    };

    const updates: Record<string, unknown> = {};
    if (typeof isEnabled === 'boolean') updates.isEnabled = isEnabled;
    if (typeof apiKey === 'string') updates.apiKey = apiKey;
    if (typeof baseUrl === 'string') updates.baseUrl = baseUrl;

    if (Object.keys(updates).length === 0) {
      return NextResponse.json(
        { error: 'Tidak ada data yang diperbarui' },
        { status: 400 }
      );
    }

    const config = await updateNusukConfig(auth.agencyId, updates);
    return NextResponse.json({ data: config });
  } catch (error) {
    console.error('POST /api/integrations/nusuk error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
