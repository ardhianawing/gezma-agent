import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { rateLimit } from '@/lib/rate-limiter';
import { logger } from '@/lib/logger';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { allowed } = rateLimit(req, { limit: 30, window: 60 });
  if (!allowed) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan, coba lagi nanti' }, { status: 429 });
  }

  const { id } = await params;

  try {
    const article = await prisma.newsArticle.findUnique({ where: { id } });

    if (!article || !article.isPublished) {
      return NextResponse.json({ error: 'Artikel tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ data: article });
  } catch (error) {
    logger.error('GET /api/news/[id] error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
