import { NextRequest, NextResponse } from 'next/server';
import { forumThreads } from '@/data/mock-forum';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

const mockReplies = [
  { id: 'reply-001', authorName: 'ModRina', authorAvatar: 'MR', authorBadge: 'Moderator', content: 'Terima kasih sudah membuat thread ini. Sangat bermanfaat untuk komunitas.', createdAt: '2026-02-20T10:00:00Z', likes: 12 },
  { id: 'reply-002', authorName: 'AgenBandung', authorAvatar: 'AB', authorBadge: null, content: 'Setuju banget! Saya juga punya pengalaman serupa. Semoga bisa jadi pembelajaran bersama.', createdAt: '2026-02-20T11:30:00Z', likes: 8 },
  { id: 'reply-003', authorName: 'ProAgent99', authorAvatar: 'PA', authorBadge: 'Top Contributor', content: 'Kalau boleh nambahin, ada beberapa poin penting yang perlu diperhatikan juga. Nanti saya share detail-nya.', createdAt: '2026-02-20T14:15:00Z', likes: 5 },
];

function getMockThread(id: string) {
  const thread = forumThreads.find((t) => t.id === id);
  if (!thread) return null;

  const { author, ...rest } = thread;
  return {
    data: {
      ...rest,
      authorName: author,
      isLocked: false,
      _source: 'mock' as const,
      replies: mockReplies.map((r) => ({ ...r, _source: 'mock' as const })),
    },
  };
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = await getAuthPayload();
  if (!auth) return unauthorizedResponse();

  const { id } = await params;

  try {
    const thread = await prisma.forumThread.findUnique({
      where: { id, deletedAt: null },
      include: { replies: { orderBy: { createdAt: 'asc' } } },
    });

    if (thread) {
      // Increment view count non-blocking
      prisma.forumThread.update({
        where: { id },
        data: { viewCount: { increment: 1 } },
      }).catch(() => {});

      const replies = thread.replies.map((r) => ({
        id: r.id,
        authorName: r.authorName,
        authorAvatar: r.authorAvatar,
        authorBadge: r.authorBadge,
        content: r.content,
        likes: r.likes,
        createdAt: r.createdAt.toISOString(),
        _source: 'db' as const,
      }));

      return NextResponse.json({
        data: {
          id: thread.id,
          title: thread.title,
          content: thread.content,
          excerpt: thread.excerpt,
          category: thread.category,
          tags: thread.tags,
          authorName: thread.authorName,
          authorAvatar: thread.authorAvatar,
          authorBadge: thread.authorBadge,
          agencyName: thread.agencyName,
          replyCount: thread.replyCount,
          viewCount: thread.viewCount,
          isPinned: thread.isPinned,
          isHot: thread.isHot,
          isSolved: thread.isSolved,
          isLocked: thread.isLocked,
          lastReplyBy: thread.lastReplyBy,
          lastReplyAt: thread.lastReplyAt?.toISOString() ?? null,
          createdAt: thread.createdAt.toISOString(),
          updatedAt: thread.updatedAt.toISOString(),
          _source: 'db' as const,
          replies,
        },
      });
    }

    // Not in DB — fallback to mock
    const mock = getMockThread(id);
    if (mock) return NextResponse.json(mock);

    return NextResponse.json({ error: 'Thread tidak ditemukan' }, { status: 404 });
  } catch (err) {
    logger.error('forum/[id] GET DB error, falling back to mock', err);

    const mock = getMockThread(id);
    if (mock) return NextResponse.json(mock);

    return NextResponse.json({ error: 'Thread tidak ditemukan' }, { status: 404 });
  }
}
