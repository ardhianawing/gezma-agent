import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    totalPoints: 2450,
    level: 5,
    levelName: 'Travel Expert',
    badgeCount: 8,
    rank: 12,
    nextLevelPoints: 3000,
  });
}
