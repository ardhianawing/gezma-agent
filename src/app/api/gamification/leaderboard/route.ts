import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { getLeaderboard } from '@/lib/services/gamification.service';
import { leaderboardQuerySchema } from '@/lib/validations/gamification';

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const params = Object.fromEntries(req.nextUrl.searchParams);
    const parsed = leaderboardQuerySchema.safeParse(params);
    const month = parsed.success ? parsed.data.month : undefined;
    const year = parsed.success ? parsed.data.year : undefined;

    const leaderboard = await getLeaderboard(month, year);

    return NextResponse.json({
      leaderboard: leaderboard.map((entry, index) => ({
        rank: index + 1,
        agencyId: entry.agencyId,
        agencyName: entry.agency.name,
        logoUrl: entry.agency.logoUrl,
        totalPoints: entry.totalPoints,
        pilgrimCount: entry.pilgrimCount,
        level: entry.level,
      })),
    });
  } catch (error) {
    console.error('GET /api/gamification/leaderboard error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
