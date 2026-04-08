import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    leaderboard: [
      { rank: 1, agencyName: 'Vauza Tamma', totalPoints: 5200 },
      { rank: 2, agencyName: 'Vauza Abadi', totalPoints: 4800 },
      { rank: 3, agencyName: 'Vauza Tamma Umroh', totalPoints: 4350 },
      { rank: 4, agencyName: 'Bukan Ghufron', totalPoints: 3900 },
      { rank: 5, agencyName: 'Bukan Yang Lain', totalPoints: 2450 },
    ],
  });
}
