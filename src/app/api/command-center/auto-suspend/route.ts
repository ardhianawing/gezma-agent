import { NextRequest, NextResponse } from 'next/server';
import { getCCAuthPayload, ccUnauthorizedResponse } from '@/lib/auth-command-center';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  const auth = getCCAuthPayload(req);
  if (!auth) return ccUnauthorizedResponse();

  try {
    const now = new Date();

    // Find agencies where PPIU is expired but status not yet 'expired'
    const expiredAgencies = await prisma.agency.findMany({
      where: {
        ppiuExpiryDate: { lt: now },
        ppiuStatus: { not: 'expired' },
      },
      select: {
        id: true,
        name: true,
        ppiuNumber: true,
        ppiuExpiryDate: true,
        ppiuStatus: true,
      },
    });

    if (expiredAgencies.length === 0) {
      return NextResponse.json({
        message: 'Tidak ada agensi dengan PPIU kedaluwarsa yang perlu diupdate.',
        affected: [],
        count: 0,
      });
    }

    // Update all expired agencies
    const ids = expiredAgencies.map(a => a.id);
    await prisma.agency.updateMany({
      where: { id: { in: ids } },
      data: { ppiuStatus: 'expired' },
    });

    return NextResponse.json({
      message: `${expiredAgencies.length} agensi berhasil diupdate ke status expired.`,
      affected: expiredAgencies.map(a => ({
        id: a.id,
        name: a.name,
        ppiuNumber: a.ppiuNumber,
        ppiuExpiryDate: a.ppiuExpiryDate,
        previousStatus: a.ppiuStatus,
      })),
      count: expiredAgencies.length,
    });
  } catch (error) {
    console.error('Auto-suspend error:', error);
    return NextResponse.json({ error: 'Gagal menjalankan auto-suspend' }, { status: 500 });
  }
}
