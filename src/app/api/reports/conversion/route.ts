import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { logger } from '@/lib/logger';

const FUNNEL_STEPS = ['lead', 'dp', 'lunas', 'dokumen', 'visa', 'ready', 'departed', 'completed'];

const STEP_LABELS: Record<string, string> = {
  lead: 'Lead', dp: 'DP', lunas: 'Lunas', dokumen: 'Dokumen',
  visa: 'Visa', ready: 'Ready', departed: 'Berangkat', completed: 'Selesai',
};

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const pilgrims = await prisma.pilgrim.findMany({
      where: { agencyId: auth.agencyId },
      select: { status: true },
    });

    const total = pilgrims.length;
    const statusCount: Record<string, number> = {};
    for (const p of pilgrims) {
      statusCount[p.status] = (statusCount[p.status] || 0) + 1;
    }

    // Build funnel: each step shows count of pilgrims AT or PAST that step
    const funnel = FUNNEL_STEPS.map((step, i) => {
      const atOrPast = FUNNEL_STEPS.slice(i).reduce((sum, s) => sum + (statusCount[s] || 0), 0);
      return {
        step,
        label: STEP_LABELS[step] || step,
        count: atOrPast,
        percentage: total > 0 ? Math.round((atOrPast / total) * 100) : 0,
      };
    });

    return NextResponse.json({ total, funnel });
  } catch (error) {
    logger.error('GET /api/reports/conversion error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
