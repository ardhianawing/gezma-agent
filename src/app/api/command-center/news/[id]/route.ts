import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCCAuthPayload, ccUnauthorizedResponse } from '@/lib/auth-command-center';
import { rateLimit } from '@/lib/rate-limiter';
import { updateNewsArticleSchema } from '@/lib/validations/news';
import { logger } from '@/lib/logger';

export async function PUT(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getCCAuthPayload(req);
  if (!auth) return ccUnauthorizedResponse();

  const { allowed } = rateLimit(req, { limit: 10, window: 60 });
  if (!allowed) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan, coba lagi nanti' }, { status: 429 });
  }

  const { id } = await params;

  try {
    const existing = await prisma.newsArticle.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Artikel tidak ditemukan' }, { status: 404 });
    }

    const body = await req.json();
    const parsed = updateNewsArticleSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validasi gagal', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = { ...parsed.data } as Record<string, unknown>;

    // Handle publishedAt
    if (parsed.data.isPublished && !existing.publishedAt) {
      data.publishedAt = parsed.data.publishedAt ? new Date(parsed.data.publishedAt) : new Date();
    } else if (parsed.data.publishedAt) {
      data.publishedAt = new Date(parsed.data.publishedAt);
    }

    const article = await prisma.newsArticle.update({ where: { id }, data });
    return NextResponse.json(article);
  } catch (error) {
    logger.error('PUT /api/command-center/news/[id] error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getCCAuthPayload(req);
  if (!auth) return ccUnauthorizedResponse();

  const { allowed } = rateLimit(req, { limit: 10, window: 60 });
  if (!allowed) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan, coba lagi nanti' }, { status: 429 });
  }

  const { id } = await params;

  try {
    const existing = await prisma.newsArticle.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: 'Artikel tidak ditemukan' }, { status: 404 });
    }

    await prisma.newsArticle.delete({ where: { id } });
    return NextResponse.json({ message: 'Artikel berhasil dihapus' });
  } catch (error) {
    logger.error('DELETE /api/command-center/news/[id] error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
