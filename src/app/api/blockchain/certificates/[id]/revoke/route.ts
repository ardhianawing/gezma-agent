import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { revokeCertificate } from '@/lib/services/blockchain.service';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { id } = await params;

  try {
    const certificate = await revokeCertificate(id, auth.agencyId);
    return NextResponse.json({ data: certificate });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan server';
    const status = message.includes('tidak ditemukan') || message.includes('sudah dicabut') ? 400 : 500;
    console.error('POST /api/blockchain/certificates/[id]/revoke error:', error);
    return NextResponse.json({ error: message }, { status });
  }
}
