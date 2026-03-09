import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
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
  });
}
