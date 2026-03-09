import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    leaderboard: [
      { rank: 1, agencyName: 'Al Haramain Travel', totalPoints: 5200 },
      { rank: 2, agencyName: 'Shafira Tour', totalPoints: 4800 },
      { rank: 3, agencyName: 'Cahaya Hati Tours', totalPoints: 4350 },
      { rank: 4, agencyName: 'Nahdlatul Umrah', totalPoints: 3900 },
      { rank: 5, agencyName: 'GEZMA Travel', totalPoints: 2450 },
    ],
  });
}
