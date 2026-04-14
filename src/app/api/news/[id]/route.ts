import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { newsArticles } from '@/data/mock-news';
import { logger } from '@/lib/logger';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  try {
    // Try by ID first, then by slug
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id);
    const article = await prisma.newsArticle.findFirst({
      where: isUUID ? { id } : { slug: id },
    });

    if (article) {
      return NextResponse.json({ data: article });
    }

    // Fallback to mock
    const mockArticle = newsArticles.find((a) => a.id === id);
    if (mockArticle) {
      return NextResponse.json({ data: mockArticle });
    }

    return NextResponse.json({ error: 'Artikel tidak ditemukan' }, { status: 404 });
  } catch (error) {
    logger.error('GET /api/news/[id] error', { error: String(error) });

    // Fallback to mock on DB error
    const mockArticle = newsArticles.find((a) => a.id === id);
    if (mockArticle) {
      return NextResponse.json({ data: mockArticle });
    }
    return NextResponse.json({ error: 'Artikel tidak ditemukan' }, { status: 404 });
  }
}
