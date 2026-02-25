import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCCAuthPayload, ccUnauthorizedResponse } from '@/lib/auth-command-center';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const auth = getCCAuthPayload(req);
  if (!auth) return ccUnauthorizedResponse();

  try {
    // Find agencies with ppiuExpiryDate set
    const agencies = await prisma.agency.findMany({
      where: {
        ppiuExpiryDate: { not: null },
      },
      select: {
        id: true,
        name: true,
        ppiuNumber: true,
        ppiuExpiryDate: true,
      },
    });

    const now = new Date();
    const thirtyDaysMs = 30 * 24 * 60 * 60 * 1000;

    const alerts = agencies
      .map((agency) => {
        const expiryDate = new Date(agency.ppiuExpiryDate!);
        const daysRemaining = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
        return {
          id: agency.id,
          name: agency.name,
          ppiuNumber: agency.ppiuNumber,
          ppiuExpiryDate: agency.ppiuExpiryDate,
          daysRemaining,
        };
      })
      .filter((a) => {
        // Expiring within 30 days or already expired
        const expiryDate = new Date(a.ppiuExpiryDate!);
        return expiryDate.getTime() - now.getTime() <= thirtyDaysMs;
      })
      .sort((a, b) => a.daysRemaining - b.daysRemaining); // Most urgent first

    return NextResponse.json({ data: alerts });
  } catch (error) {
    logger.error('GET /api/command-center/alerts error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
