import { NextRequest, NextResponse } from 'next/server';
import { verifyCertificate } from '@/lib/services/blockchain.service';
import { logger } from '@/lib/logger';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ number: string }> }
) {
  const { number } = await params;

  try {
    const certificate = await verifyCertificate(number);

    if (!certificate) {
      return NextResponse.json(
        { error: 'Sertifikat tidak ditemukan' },
        { status: 404 }
      );
    }

    return NextResponse.json({ data: certificate });
  } catch (error) {
    logger.error('GET /api/blockchain/verify/[number] error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
