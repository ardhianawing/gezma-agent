import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { checkPermission } from '@/lib/auth-permissions';
import { PERMISSIONS } from '@/lib/permissions';
import { createForumThreadSchema } from '@/lib/validations/forum';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category') || '';
  const search = searchParams.get('search') || '';
  const sort = searchParams.get('sort') || 'latest';
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '20', 10);

  const where: Record<string, unknown> = {};

  if (category && category !== 'all') {
    where.category = category;
  }

  if (search) {
    where.OR = [
      { title: { contains: search, mode: 'insensitive' } },
      { authorName: { contains: search, mode: 'insensitive' } },
      { tags: { hasSome: [search] } },
    ];
  }

  let orderBy: Record<string, unknown>[];
  switch (sort) {
    case 'hot':
      orderBy = [{ isPinned: 'desc' }, { isHot: 'desc' }, { viewCount: 'desc' }];
      break;
    case 'top':
      orderBy = [{ isPinned: 'desc' }, { replyCount: 'desc' }];
      break;
    default:
      orderBy = [{ isPinned: 'desc' }, { createdAt: 'desc' }];
  }

  try {
    const [data, total] = await Promise.all([
      prisma.forumThread.findMany({
        where,
        orderBy,
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.forumThread.count({ where }),
    ]);

    // Category counts
    const categoryCounts = await prisma.forumThread.groupBy({
      by: ['category'],
      _count: true,
    });

    const stats = {
      totalThreads: total,
      categoryCounts: Object.fromEntries(
        categoryCounts.map((c) => [c.category, c._count])
      ),
    };

    return NextResponse.json({ data, total, page, limit, stats });
  } catch (error) {
    logger.error('GET /api/forum error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const denied = await checkPermission(auth, PERMISSIONS.FORUM_CREATE);
  if (denied) return denied;

  try {
    const body = await req.json();
    const parsed = createForumThreadSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validasi gagal', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { name: true, avatarUrl: true, agency: { select: { name: true } } },
    });
    if (!user) return unauthorizedResponse();

    const excerpt = parsed.data.content.length > 200
      ? parsed.data.content.substring(0, 200) + '...'
      : parsed.data.content;

    const thread = await prisma.forumThread.create({
      data: {
        title: parsed.data.title,
        content: parsed.data.content,
        excerpt,
        category: parsed.data.category,
        tags: parsed.data.tags,
        authorId: auth.userId,
        authorName: user.name,
        authorAvatar: user.avatarUrl || user.name.split(' ').map((n) => n[0]).join('').substring(0, 2).toUpperCase(),
        agencyName: user.agency.name,
      },
    });

    return NextResponse.json(thread, { status: 201 });
  } catch (error) {
    logger.error('POST /api/forum error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
