import { NextRequest, NextResponse } from 'next/server';
import { marketItems, marketCategories } from '@/data/mock-marketplace';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const city = searchParams.get('city') || '';
  const minRating = parseFloat(searchParams.get('minRating') || '0');
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '50', 10);

  let filtered = [...marketItems];

  if (category) {
    filtered = filtered.filter((item) => item.category === category);
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (item) =>
        item.name.toLowerCase().includes(q) ||
        item.vendor.toLowerCase().includes(q) ||
        item.description.toLowerCase().includes(q)
    );
  }

  if (city) {
    filtered = filtered.filter((item) => item.city === city);
  }

  if (minRating > 0) {
    filtered = filtered.filter((item) => item.rating >= minRating);
  }

  const total = filtered.length;
  const start = (page - 1) * limit;
  const data = filtered.slice(start, start + limit);

  return NextResponse.json({ data, total, page, limit, categories: marketCategories });
}
