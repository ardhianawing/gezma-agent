import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    const pilgrim = await prisma.pilgrim.findUnique({
      where: { verificationCode: code },
      select: {
        name: true,
        nik: true,
        gender: true,
        birthPlace: true,
        birthDate: true,
        status: true,
        bookingCode: true,
        roomType: true,
        agency: {
          select: {
            name: true,
            legalName: true,
            ppiuNumber: true,
            isVerified: true,
            ppiuStatus: true,
          },
        },
      },
    });

    if (!pilgrim) {
      return NextResponse.json({ error: 'Data jemaah tidak ditemukan' }, { status: 404 });
    }

    // Mask NIK for privacy (show first 6 and last 4)
    const maskedNik = pilgrim.nik.length >= 10
      ? pilgrim.nik.slice(0, 6) + '****' + pilgrim.nik.slice(-4)
      : pilgrim.nik;

    return NextResponse.json({
      data: {
        name: pilgrim.name,
        nik: maskedNik,
        gender: pilgrim.gender,
        birthPlace: pilgrim.birthPlace,
        birthDate: pilgrim.birthDate,
        status: pilgrim.status,
        bookingCode: pilgrim.bookingCode,
        roomType: pilgrim.roomType,
        agency: pilgrim.agency,
      },
    });
  } catch (error) {
    logger.error('GET /api/verify/pilgrim/[code] error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
