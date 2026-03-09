import { NextRequest, NextResponse } from 'next/server';
import { tradeProducts, tradeCategories, tradeStats } from '@/data/mock-trade';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';

  let filtered = [...tradeProducts];

  if (category && category !== 'all') {
    filtered = filtered.filter((p) => p.category === category);
  }

  if (status) {
    filtered = filtered.filter((p) => p.status === status);
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.producer.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }

  const total = filtered.length;

  return NextResponse.json({
    data: filtered,
    total,
    stats: tradeStats,
    categories: tradeCategories,
  });
}
