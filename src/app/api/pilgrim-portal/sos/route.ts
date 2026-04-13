import { NextRequest, NextResponse } from 'next/server';
import { getPilgrimPayload } from '@/lib/auth-pilgrim';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const payload = getPilgrimPayload(req);
    if (!payload) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    const body = await req.json();
    const { contactName, contactPhone } = body;

    // Validate required SOS fields
    if (typeof contactName !== 'string' || contactName.trim() === '') {
      return NextResponse.json({ error: 'Nama kontak darurat harus diisi' }, { status: 400 });
    }
    if (typeof contactPhone !== 'string' || contactPhone.trim() === '') {
      return NextResponse.json({ error: 'Nomor telepon kontak darurat harus diisi' }, { status: 400 });
    }

    // Get pilgrim info for logging
    const pilgrim = await prisma.pilgrim.findUnique({
      where: { id: payload.pilgrimId },
      select: { name: true, agencyId: true },
    });

    if (!pilgrim) {
      return NextResponse.json({ error: 'Jemaah tidak ditemukan' }, { status: 404 });
    }

    // Log SOS alert as activity
    await prisma.activityLog.create({
      data: {
        type: 'system',
        action: 'created',
        description: `SOS ALERT: ${pilgrim.name} menghubungi ${contactName} (${contactPhone})`,
        agencyId: pilgrim.agencyId,
        metadata: {
          pilgrimId: payload.pilgrimId,
          pilgrimName: pilgrim.name,
          contactName,
          contactPhone,
          sosTimestamp: new Date().toISOString(),
        },
      },
    });

    logger.warn('SOS Alert triggered', {
      pilgrimId: payload.pilgrimId,
      pilgrimName: pilgrim.name,
      contactName,
      contactPhone,
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('POST /api/pilgrim-portal/sos error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
