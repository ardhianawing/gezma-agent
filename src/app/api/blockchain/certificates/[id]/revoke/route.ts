import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { revokeCertificate } from '@/lib/services/blockchain.service';
import { logActivity } from '@/lib/activity-logger';
import { logger } from '@/lib/logger';

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { id } = await params;

  try {
    const certificate = await revokeCertificate(id, auth.agencyId);

    logActivity({
      type: 'system',
      action: 'revoked',
      title: 'Sertifikat dicabut',
      description: `Sertifikat blockchain ${id} dicabut`,
      userId: auth.userId,
      agencyId: auth.agencyId,
      metadata: { entityId: id },
    });

    return NextResponse.json({ data: certificate });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Terjadi kesalahan server';
    const status = message.includes('tidak ditemukan') || message.includes('sudah dicabut') ? 400 : 500;
    logger.error('POST /api/blockchain/certificates/[id]/revoke error', { error: String(error) });
    return NextResponse.json({ error: message }, { status });
  }
}
