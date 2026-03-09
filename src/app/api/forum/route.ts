import { NextRequest, NextResponse } from 'next/server';
import { forumThreads, forumCategories, forumStats } from '@/data/mock-forum';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  let filtered = [...forumThreads];

  if (category && category !== 'all') {
    filtered = filtered.filter((t) => t.category === category);
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.author.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }

  const total = filtered.length;
  const start = (page - 1) * limit;
  const data = filtered.slice(start, start + limit);

  return NextResponse.json({
    data,
    total,
    page,
    limit,
    categories: forumCategories,
    stats: forumStats,
  });
}
