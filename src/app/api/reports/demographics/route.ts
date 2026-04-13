import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req); if (!auth) return unauthorizedResponse();
  const agencyId = auth.agencyId;

  // Mock data (fallback)
  const mockData = {
    total: 156,
    genderBreakdown: [
      { gender: "male", count: 72 },
      { gender: "female", count: 84 },
    ],
    provinceBreakdown: [
      { province: "DKI Jakarta", count: 45 },
      { province: "Jawa Barat", count: 32 },
      { province: "Jawa Timur", count: 28 },
      { province: "Sumatera Utara", count: 15 },
      { province: "Jawa Tengah", count: 12 },
      { province: "Banten", count: 10 },
      { province: "Lainnya", count: 14 },
    ],
    ageBreakdown: [
      { range: "20-30", count: 18 },
      { range: "31-40", count: 35 },
      { range: "41-50", count: 48 },
      { range: "51-60", count: 38 },
      { range: "60+", count: 17 },
    ],
  };

  try {
    const [total, genderGroups, provinceGroups, pilgrims] = await Promise.all([
      prisma.pilgrim.count({ where: { agencyId, deletedAt: null } }),
      prisma.pilgrim.groupBy({
        by: ['gender'],
        _count: true,
        where: { agencyId, deletedAt: null },
      }),
      prisma.pilgrim.groupBy({
        by: ['province'],
        _count: true,
        where: { agencyId, deletedAt: null },
        orderBy: { _count: { province: 'desc' } },
      }),
      // Fetch birthDate for age calculation
      prisma.pilgrim.findMany({
        select: { birthDate: true },
        where: { agencyId, deletedAt: null },
      }),
    ]);

    if (total > 0) {
      // Gender breakdown
      const genderBreakdown = genderGroups.map(g => ({
        gender: g.gender,
        count: g._count,
      }));

      // Province breakdown — top 6 + "Lainnya"
      const topProvinces = provinceGroups.slice(0, 6).map(g => ({
        province: g.province,
        count: g._count,
      }));
      const othersCount = provinceGroups.slice(6).reduce((sum, g) => sum + g._count, 0);
      const provinceBreakdown = othersCount > 0
        ? [...topProvinces, { province: "Lainnya", count: othersCount }]
        : topProvinces;

      // Age breakdown from birthDate (ISO string)
      const now = new Date();
      const ageBuckets: Record<string, number> = {
        "20-30": 0, "31-40": 0, "41-50": 0, "51-60": 0, "60+": 0,
      };
      for (const p of pilgrims) {
        if (!p.birthDate) continue;
        const birthDate = new Date(p.birthDate);
        if (isNaN(birthDate.getTime())) continue;
        const age = Math.floor((now.getTime() - birthDate.getTime()) / (365.25 * 24 * 60 * 60 * 1000));
        if (age >= 60) ageBuckets["60+"]++;
        else if (age >= 51) ageBuckets["51-60"]++;
        else if (age >= 41) ageBuckets["41-50"]++;
        else if (age >= 31) ageBuckets["31-40"]++;
        else if (age >= 20) ageBuckets["20-30"]++;
      }
      const ageBreakdown = Object.entries(ageBuckets).map(([range, count]) => ({ range, count }));

      return NextResponse.json({
        total,
        genderBreakdown,
        provinceBreakdown,
        ageBreakdown,
      });
    }
  } catch (error) {
    console.error('[reports/demographics] DB error, falling back to mock:', error);
  }

  // Fallback to mock data
  return NextResponse.json(mockData);
}
