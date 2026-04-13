import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { issueCertificate } from '@/lib/services/blockchain.service';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
  const status = searchParams.get('status') || '';

  const where: Record<string, unknown> = { agencyId: auth.agencyId };

  if (status) {
    where.status = status;
  }

  try {
    const [data, total, verified, revoked] = await Promise.all([
      prisma.blockchainCertificate.findMany({
        where,
        include: {
          pilgrim: { select: { name: true, nik: true } },
          agency: { select: { name: true } },
        },
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.blockchainCertificate.count({ where }),
      prisma.blockchainCertificate.count({ where: { agencyId: auth.agencyId, status: 'verified' } }),
      prisma.blockchainCertificate.count({ where: { agencyId: auth.agencyId, status: 'revoked' } }),
    ]);

    return NextResponse.json({
      data,
      stats: {
        total,
        verified,
        revoked,
      },
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('GET /api/blockchain/certificates error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const body = await req.json();
    const { pilgrimId } = body;

    if (!pilgrimId) {
      return NextResponse.json({ error: 'pilgrimId wajib diisi' }, { status: 400 });
    }

    const certificate = await issueCertificate(pilgrimId, auth.agencyId);

    return NextResponse.json({ data: certificate }, { status: 201 });
  } catch (error) {
    const internalMsg = error instanceof Error ? error.message : 'Terjadi kesalahan server';
    const isClientError = internalMsg.includes('tidak ditemukan') || internalMsg.includes('sudah memiliki');
    const status = isClientError ? 400 : 500;
    logger.error('POST /api/blockchain/certificates error', { error: String(error) });
    return NextResponse.json({ error: isClientError ? internalMsg : 'Terjadi kesalahan server' }, { status });
  }
}
