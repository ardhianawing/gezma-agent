import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const pilgrims = await prisma.pilgrim.findMany({
      where: { agencyId: auth.agencyId },
      select: { gender: true, province: true, birthDate: true },
    });

    // Gender breakdown
    const genderCount: Record<string, number> = {};
    for (const p of pilgrims) {
      const g = p.gender || 'unknown';
      genderCount[g] = (genderCount[g] || 0) + 1;
    }

    // Province breakdown
    const provinceCount: Record<string, number> = {};
    for (const p of pilgrims) {
      const prov = p.province || 'Tidak Diketahui';
      provinceCount[prov] = (provinceCount[prov] || 0) + 1;
    }
    const provinceBreakdown = Object.entries(provinceCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 10)
      .map(([province, count]) => ({ province, count }));

    // Age breakdown
    const now = new Date();
    const ageBuckets: Record<string, number> = {
      '< 25': 0, '25-34': 0, '35-44': 0, '45-54': 0, '55-64': 0, '65+': 0,
    };
    for (const p of pilgrims) {
      if (!p.birthDate) continue;
      const birth = new Date(p.birthDate);
      const age = now.getFullYear() - birth.getFullYear();
      if (age < 25) ageBuckets['< 25']++;
      else if (age < 35) ageBuckets['25-34']++;
      else if (age < 45) ageBuckets['35-44']++;
      else if (age < 55) ageBuckets['45-54']++;
      else if (age < 65) ageBuckets['55-64']++;
      else ageBuckets['65+']++;
    }
    const ageBreakdown = Object.entries(ageBuckets).map(([range, count]) => ({ range, count }));

    return NextResponse.json({
      total: pilgrims.length,
      genderBreakdown: Object.entries(genderCount).map(([gender, count]) => ({ gender, count })),
      provinceBreakdown,
      ageBreakdown,
    });
  } catch (error) {
    console.error('GET /api/reports/demographics error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
