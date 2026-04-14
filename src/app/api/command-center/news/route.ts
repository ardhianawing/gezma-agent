import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCCAuthPayload, ccUnauthorizedResponse } from '@/lib/auth-command-center';
import { rateLimit } from '@/lib/rate-limiter';
import { createNewsArticleSchema } from '@/lib/validations/news';
import { logger } from '@/lib/logger';
import { slugify } from '@/lib/utils';

export async function GET(req: NextRequest) {
  const auth = getCCAuthPayload(req);
  if (!auth) return ccUnauthorizedResponse();

  const { allowed } = rateLimit(req, { limit: 30, window: 60 });
  if (!allowed) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan, coba lagi nanti' }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || '';

  const where: Record<string, unknown> = {};
  if (category) where.category = category;

  try {
    const data = await prisma.newsArticle.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    });
    return NextResponse.json({ data });
  } catch (error) {
    logger.error('GET /api/command-center/news error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = getCCAuthPayload(req);
  if (!auth) return ccUnauthorizedResponse();

  const { allowed } = rateLimit(req, { limit: 10, window: 60 });
  if (!allowed) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan, coba lagi nanti' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = createNewsArticleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validasi gagal', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    // Auto-generate slug from title if not provided
    let slug = parsed.data.slug || slugify(parsed.data.title);
    // Ensure slug is unique
    const existingSlug = await prisma.newsArticle.findUnique({ where: { slug } });
    if (existingSlug) {
      slug = `${slug}-${Date.now().toString(36)}`;
    }

    const article = await prisma.newsArticle.create({
      data: {
        ...parsed.data,
        slug,
        publishedAt: parsed.data.isPublished ? (parsed.data.publishedAt ? new Date(parsed.data.publishedAt) : new Date()) : null,
        createdBy: auth.adminId,
      },
    });

    return NextResponse.json(article, { status: 201 });
  } catch (error) {
    logger.error('POST /api/command-center/news error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
