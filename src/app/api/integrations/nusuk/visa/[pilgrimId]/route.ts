import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { getVisaStatus, submitVisa } from '@/lib/services/nusuk.service';

type RouteContext = { params: Promise<{ pilgrimId: string }> };

export async function GET(req: NextRequest, context: RouteContext) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const { pilgrimId } = await context.params;

    if (!pilgrimId) {
      return NextResponse.json(
        { error: 'Parameter pilgrimId wajib diisi' },
        { status: 400 }
      );
    }

    const status = await getVisaStatus(pilgrimId, auth.agencyId);
    return NextResponse.json({ data: status });
  } catch (error) {
    console.error('GET /api/integrations/nusuk/visa/[pilgrimId] error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, context: RouteContext) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const { pilgrimId } = await context.params;

    if (!pilgrimId) {
      return NextResponse.json(
        { error: 'Parameter pilgrimId wajib diisi' },
        { status: 400 }
      );
    }

    const result = await submitVisa(pilgrimId, auth.agencyId);
    return NextResponse.json({ data: result }, { status: 201 });
  } catch (error) {
    console.error('POST /api/integrations/nusuk/visa/[pilgrimId] error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
