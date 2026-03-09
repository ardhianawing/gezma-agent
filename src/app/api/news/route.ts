import { NextRequest, NextResponse } from 'next/server';
import { newsArticles } from '@/data/mock-news';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  let filtered = [...newsArticles];

  if (category && category !== 'all') {
    filtered = filtered.filter((a) => a.category === category);
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (a) =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.tags.some((t) => t.toLowerCase().includes(q))
    );
  }

  const data = filtered.slice(0, limit);

  return NextResponse.json({ data, total: filtered.length, page: 1, limit });
}
