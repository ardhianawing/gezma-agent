import { NextRequest, NextResponse } from 'next/server';
import { forumThreads, forumCategories, forumStats } from '@/data/mock-forum';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
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

  // --- Mock data (always kept as fallback / demo) ---
  let mockFiltered = [...forumThreads].map((t) => ({
    ...t,
    authorName: t.author, // normalize: mock uses `author`, DB uses `authorName`
    _source: 'mock' as const,
  }));

  if (category && category !== 'all') {
    mockFiltered = mockFiltered.filter((t) => t.category === category);
  }

  if (search) {
    const q = search.toLowerCase();
    mockFiltered = mockFiltered.filter(
      (t) =>
        t.title.toLowerCase().includes(q) ||
        t.author.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
    );
  }

  // Sort mock data
  const sortMock = (arr: typeof mockFiltered) => {
    return arr.sort((a, b) => {
      // Pinned always first
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      if (sort === 'hot') return b.replyCount - a.replyCount;
      if (sort === 'top') return b.viewCount - a.viewCount;
      // default 'latest'
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });
  };

  // --- Try DB first ---
  try {
    // Build where clause
    const where: Record<string, unknown> = { deletedAt: null };

    if (category && category !== 'all') {
      where.category = category;
    }

    if (search) {
      where.OR = [
        { title: { contains: search, mode: 'insensitive' } },
        { authorName: { contains: search, mode: 'insensitive' } },
        { tags: { has: search } },
      ];
    }

    // Build orderBy — pinned first, then sort param
    const orderBy: Record<string, string>[] = [
      { isPinned: 'desc' },
    ];
    if (sort === 'hot') {
      orderBy.push({ replyCount: 'desc' });
    } else if (sort === 'top') {
      orderBy.push({ viewCount: 'desc' });
    } else {
      orderBy.push({ createdAt: 'desc' });
    }

    // Fetch DB threads + total count in parallel
    const [dbThreads, dbTotal, categoryGroups] = await Promise.all([
      prisma.forumThread.findMany({
        where,
        orderBy,
        skip: 0, // We'll paginate the merged result
        take: 500, // reasonable upper bound for merge
      }),
      prisma.forumThread.count({ where }),
      prisma.forumThread.groupBy({
        by: ['category'],
        where: { deletedAt: null },
        _count: { id: true },
      }),
    ]);

    const dbMapped = dbThreads.map((t) => ({
      ...t,
      createdAt: t.createdAt.toISOString(),
      updatedAt: t.updatedAt.toISOString(),
      lastReplyAt: t.lastReplyAt?.toISOString() || null,
      deletedAt: t.deletedAt?.toISOString() || null,
      _source: 'db' as const,
    }));

    // Merge: DB first, then mock
    const merged = [...dbMapped, ...mockFiltered];

    // Sort merged results (pinned first, then by sort param)
    merged.sort((a, b) => {
      if (a.isPinned !== b.isPinned) return a.isPinned ? -1 : 1;
      if (sort === 'hot') return b.replyCount - a.replyCount;
      if (sort === 'top') return b.viewCount - a.viewCount;
      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
    });

    // Paginate merged results
    const total = merged.length;
    const start = (page - 1) * limit;
    const data = merged.slice(start, start + limit);

    // Build category counts from DB groupBy
    const categoryCounts: Record<string, number> = {};
    for (const g of categoryGroups) {
      categoryCounts[g.category] = g._count.id;
    }

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      categories: forumCategories,
      stats: {
        ...forumStats,
        categoryCounts,
      },
    });
  } catch (err) {
    // DB not available — silently fallback to mock only
    logger.warn('Forum DB query failed, falling back to mock', err);

    sortMock(mockFiltered);

    const total = mockFiltered.length;
    const start = (page - 1) * limit;
    const data = mockFiltered.slice(start, start + limit);

    return NextResponse.json({
      data,
      total,
      page,
      limit,
      categories: forumCategories,
      stats: forumStats,
    });
  }
}
