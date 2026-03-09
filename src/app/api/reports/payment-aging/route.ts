import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    totalOutstanding: 450000000,
    agingBuckets: [
      { range: "0-30", amount: 225000000 },
      { range: "31-60", amount: 120000000 },
      { range: "61-90", amount: 60000000 },
      { range: "90+", amount: 45000000 },
    ],
    topDebtors: [
      { name: "Ahmad Fauzi", outstanding: 45000000, daysOverdue: 95 },
      { name: "Siti Aminah", outstanding: 38000000, daysOverdue: 72 },
      { name: "Budi Santoso", outstanding: 32000000, daysOverdue: 65 },
      { name: "Dewi Lestari", outstanding: 28000000, daysOverdue: 48 },
      { name: "Hasan Basri", outstanding: 25000000, daysOverdue: 35 },
      { name: "Fatimah Zahra", outstanding: 22000000, daysOverdue: 28 },
      { name: "Rizki Ramadhan", outstanding: 18000000, daysOverdue: 22 },
      { name: "Nur Hidayah", outstanding: 15000000, daysOverdue: 15 },
      { name: "Yusuf Hakim", outstanding: 12000000, daysOverdue: 10 },
      { name: "Aisyah Putri", outstanding: 10000000, daysOverdue: 5 },
    ],
  });
}
