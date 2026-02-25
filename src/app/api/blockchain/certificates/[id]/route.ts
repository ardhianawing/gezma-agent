import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { logger } from '@/lib/logger';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { id } = await params;

  try {
    const certificate = await prisma.blockchainCertificate.findFirst({
      where: { id, agencyId: auth.agencyId },
      include: {
        pilgrim: { select: { name: true, nik: true, phone: true, email: true } },
        agency: { select: { name: true } },
      },
    });

    if (!certificate) {
      return NextResponse.json({ error: 'Sertifikat tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ data: certificate });
  } catch (error) {
    logger.error('GET /api/blockchain/certificates/[id] error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
