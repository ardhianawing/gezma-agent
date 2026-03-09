import { NextRequest, NextResponse } from 'next/server';
import { newsArticles } from '@/data/mock-news';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const article = newsArticles.find((a) => a.id === id);

  if (!article) {
    return NextResponse.json({ error: 'Artikel tidak ditemukan' }, { status: 404 });
  }

  return NextResponse.json({ data: article });
}
