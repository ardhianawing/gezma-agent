import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const agency = await prisma.agency.findUnique({
      where: { verificationCode: code },
      select: {
        id: true,
        name: true,
        legalName: true,
        ppiuNumber: true,
        ppiuExpiryDate: true,
        isVerified: true,
        ppiuStatus: true,
        phone: true,
        email: true,
        city: true,
        province: true,
      },
    });

    if (!agency) {
      return NextResponse.json({ error: 'Agency tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ data: agency });
  } catch (error) {
    logger.error('GET /api/verify/[code] error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
