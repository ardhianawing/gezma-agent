import { NextResponse } from 'next/server';

export async function GET() {
  const total = 250;

  const funnel = [
    { step: "lead", label: "Lead", count: 250 },
    { step: "inquiry", label: "Inquiry", count: 180 },
    { step: "dp", label: "DP", count: 120 },
    { step: "lunas", label: "Lunas", count: 95 },
    { step: "berangkat", label: "Berangkat", count: 89 },
  ].map(item => ({
    ...item,
    percentage: total > 0 ? Math.round((item.count / total) * 100) : 0,
  }));

  return NextResponse.json({
    total,
    funnel,
  });
}
