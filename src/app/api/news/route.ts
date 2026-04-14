import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { newsArticles } from '@/data/mock-news';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const limit = Math.min(parseInt(searchParams.get('limit') || '20', 10), 100);
  const page = Math.max(parseInt(searchParams.get('page') || '1', 10), 1);
  const offset = (page - 1) * limit;

  try {
    // Build Prisma where clause
    const where: Record<string, unknown> = { isPublished: true };
    if (category && category !== 'all') {
      where.category = category;
    }
    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { excerpt: { contains: search, mode: 'insensitive' } },
        { tags: { hasSome: [search] } },
      ];
    }

    const [data, total] = await Promise.all([
      prisma.newsArticle.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip: offset,
        take: limit,
        select: {
          id: true,
          title: true,
          slug: true,
          excerpt: true,
          category: true,
          emoji: true,
          tags: true,
          author: true,
          authorRole: true,
          readTime: true,
          isBreaking: true,
          isOfficial: true,
          isFeatured: true,
          publishedAt: true,
          imageUrl: true,
        },
      }),
      prisma.newsArticle.count({ where }),
    ]);

    if (data.length > 0) {
      return NextResponse.json({ data, total, page, limit });
    }

    // Fallback to mock data
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
    const mockData = filtered.slice(offset, offset + limit);
    return NextResponse.json({ data: mockData, total: filtered.length, page, limit });
  } catch (error) {
    logger.error('GET /api/news error', { error: String(error) });

    // Fallback to mock on DB error
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
    const mockData = filtered.slice(offset, offset + limit);
    return NextResponse.json({ data: mockData, total: filtered.length, page, limit });
  }
}
