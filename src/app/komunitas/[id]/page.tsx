import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { forumThreads as mockThreads } from '@/data/mock-forum';

const CATEGORIES: Record<string, { label: string; icon: string; color: string }> = {
  review: { label: 'Review', icon: '⭐', color: '#D97706' },
  regulasi: { label: 'Regulasi', icon: '📜', color: '#2563EB' },
  operasional: { label: 'Operasional', icon: '⚙️', color: '#059669' },
  sharing: { label: 'Sharing', icon: '💬', color: '#7C3AED' },
  scam: { label: 'Scam Alert', icon: '🚨', color: '#DC2626' },
  tanya: { label: 'Tanya Jawab', icon: '❓', color: '#0891B2' },
};

type Props = { params: Promise<{ id: string }> };

interface Reply {
  id: string;
  content: string;
  authorName: string;
  authorAvatar: string;
  authorBadge?: string | null;
  likes: number;
  createdAt: Date | string;
}

interface ThreadDetail {
  id: string;
  title: string;
  content: string;
  excerpt: string;
  category: string;
  tags: string[];
  authorName: string;
  authorAvatar: string;
  authorBadge?: string | null;
  agencyName?: string | null;
  replyCount: number;
  viewCount: number;
  isPinned: boolean;
  isHot: boolean;
  isSolved: boolean;
  isLocked: boolean;
  createdAt: Date | string;
  replies: Reply[];
}

async function getThread(id: string): Promise<ThreadDetail | null> {
  try {
    const t = await prisma.forumThread.findUnique({
      where: { id, deletedAt: null },
      include: { replies: { orderBy: { createdAt: 'asc' } } },
    });
    if (t) {
      prisma.forumThread
        .update({ where: { id }, data: { viewCount: { increment: 1 } } })
        .catch(() => {});
      return {
        id: t.id,
        title: t.title,
        content: t.content,
        excerpt: t.excerpt,
        category: t.category,
        tags: t.tags,
        authorName: t.authorName,
        authorAvatar: t.authorAvatar,
        authorBadge: t.authorBadge,
        agencyName: t.agencyName,
        replyCount: t.replyCount,
        viewCount: t.viewCount + 1,
        isPinned: t.isPinned,
        isHot: t.isHot,
        isSolved: t.isSolved,
        isLocked: t.isLocked,
        createdAt: t.createdAt,
        replies: t.replies.map((r) => ({
          id: r.id,
          content: r.content,
          authorName: r.authorName,
          authorAvatar: r.authorAvatar,
          authorBadge: r.authorBadge,
          likes: r.likes,
          createdAt: r.createdAt,
        })),
      };
    }
  } catch {
    // fall through to mock
  }

  const mock = mockThreads.find((m) => m.id === id);
  if (!mock) return null;
  return {
    id: mock.id,
    title: mock.title,
    content: mock.excerpt,
    excerpt: mock.excerpt,
    category: mock.category,
    tags: mock.tags,
    authorName: mock.author,
    authorAvatar: mock.authorAvatar,
    authorBadge: mock.authorBadge,
    replyCount: mock.replyCount,
    viewCount: mock.viewCount,
    isPinned: mock.isPinned,
    isHot: mock.isHot,
    isSolved: mock.isSolved,
    isLocked: false,
    createdAt: mock.lastReplyAt,
    replies: [],
  };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const thread = await getThread(id);
  if (!thread) return { title: 'Thread tidak ditemukan' };
  return {
    title: thread.title,
    description: thread.excerpt || thread.content.slice(0, 160),
    openGraph: {
      title: thread.title,
      description: thread.excerpt || thread.content.slice(0, 160),
      type: 'article',
    },
  };
}

function formatDate(d: Date | string): string {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatDateTime(d: Date | string): string {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default async function KomunitasThreadPage({ params }: Props) {
  const { id } = await params;
  const thread = await getThread(id);
  if (!thread) notFound();

  const catInfo = CATEGORIES[thread.category] || { label: thread.category, icon: '📋', color: '#6B7280' };

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'DiscussionForumPosting',
    headline: thread.title,
    text: thread.content,
    author: { '@type': 'Person', name: thread.authorName },
    datePublished: new Date(thread.createdAt).toISOString(),
    interactionStatistic: [
      { '@type': 'InteractionCounter', interactionType: 'https://schema.org/ViewAction', userInteractionCount: thread.viewCount },
      { '@type': 'InteractionCounter', interactionType: 'https://schema.org/CommentAction', userInteractionCount: thread.replyCount },
    ],
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        <Link href="/komunitas" style={{
          textDecoration: 'none',
          fontSize: 13,
          color: '#6B7280',
          display: 'inline-flex',
          alignItems: 'center',
          gap: 6,
        }}>
          ← Kembali ke Forum
        </Link>

        {/* Thread card */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          border: '1px solid #E5E7EB',
          overflow: 'hidden',
        }}>
          <div style={{ padding: '24px', borderBottom: '1px solid #F3F4F6' }}>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 10 }}>
              {thread.isPinned && (
                <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 4, backgroundColor: '#FEF3C7', color: '#92400E' }}>📌 Pinned</span>
              )}
              {thread.isSolved && (
                <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 4, backgroundColor: '#D1FAE5', color: '#065F46' }}>✅ Solved</span>
              )}
              <span style={{
                fontSize: 11,
                fontWeight: 600,
                padding: '3px 10px',
                borderRadius: 4,
                backgroundColor: `${catInfo.color}18`,
                color: catInfo.color,
              }}>
                {catInfo.icon} {catInfo.label}
              </span>
            </div>

            <h1 style={{ fontSize: 24, fontWeight: 800, color: '#111827', margin: '0 0 14px 0', lineHeight: 1.3 }}>
              {thread.title}
            </h1>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: '#F60000',
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 12,
                fontWeight: 700,
              }}>
                {thread.authorAvatar || thread.authorName.substring(0, 2).toUpperCase()}
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 14, fontWeight: 600, color: '#111827' }}>{thread.authorName}</span>
                  {thread.authorBadge && (
                    <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4, backgroundColor: '#2563EB18', color: '#2563EB' }}>
                      {thread.authorBadge}
                    </span>
                  )}
                  {thread.agencyName && (
                    <span style={{ fontSize: 11, color: '#6B7280' }}>· {thread.agencyName}</span>
                  )}
                </div>
                <span style={{ fontSize: 12, color: '#6B7280' }}>
                  {formatDate(thread.createdAt)} · {thread.viewCount.toLocaleString('id-ID')} views · {thread.replyCount} balasan
                </span>
              </div>
            </div>
          </div>

          <div style={{ padding: '24px' }}>
            <div style={{ fontSize: 15, lineHeight: 1.8, color: '#374151', whiteSpace: 'pre-line' }}>
              {thread.content}
            </div>
            {thread.tags.length > 0 && (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginTop: 20, paddingTop: 16, borderTop: '1px solid #F3F4F6' }}>
                {thread.tags.map((tag) => (
                  <span key={tag} style={{ fontSize: 12, padding: '3px 10px', borderRadius: 6, backgroundColor: '#F3F4F6', color: '#6B7280' }}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Replies */}
        <h2 style={{ fontSize: 17, fontWeight: 700, color: '#111827', margin: '8px 0 0 0' }}>
          Balasan ({thread.replies.length})
        </h2>

        {thread.replies.length === 0 ? (
          <div style={{
            backgroundColor: '#FFFFFF',
            borderRadius: 12,
            border: '1px dashed #E5E7EB',
            padding: '32px 20px',
            textAlign: 'center',
          }}>
            <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>Belum ada balasan. Jadi yang pertama!</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {thread.replies.map((reply) => (
              <div key={reply.id} style={{
                backgroundColor: '#FFFFFF',
                borderRadius: 12,
                border: '1px solid #E5E7EB',
                padding: '16px 20px',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                  <div style={{
                    width: 32,
                    height: 32,
                    borderRadius: '50%',
                    backgroundColor: '#F60000',
                    color: '#FFFFFF',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}>
                    {reply.authorAvatar || reply.authorName.substring(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: '#111827' }}>{reply.authorName}</span>
                      {reply.authorBadge && (
                        <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 6px', borderRadius: 4, backgroundColor: '#2563EB18', color: '#2563EB' }}>
                          {reply.authorBadge}
                        </span>
                      )}
                    </div>
                    <span style={{ fontSize: 11, color: '#6B7280' }}>{formatDateTime(reply.createdAt)}</span>
                  </div>
                </div>
                <p style={{ fontSize: 14, lineHeight: 1.7, color: '#374151', margin: 0, whiteSpace: 'pre-line' }}>
                  {reply.content}
                </p>
              </div>
            ))}
          </div>
        )}

        {/* Login CTA for reply */}
        <div style={{
          backgroundColor: '#FFFFFF',
          borderRadius: 12,
          border: '1px solid #E5E7EB',
          padding: '20px 24px',
          textAlign: 'center',
        }}>
          {thread.isLocked ? (
            <p style={{ fontSize: 14, color: '#6B7280', margin: 0 }}>🔒 Thread ini sudah dikunci. Tidak bisa membalas.</p>
          ) : (
            <>
              <p style={{ fontSize: 14, color: '#374151', margin: '0 0 12px 0' }}>
                Ingin ikut diskusi? Login dulu buat posting balasan.
              </p>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
                <Link href={`/login?redirect=/forum/${thread.id}`} style={{
                  padding: '10px 20px',
                  backgroundColor: '#F60000',
                  color: '#FFFFFF',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: 'none',
                }}>Masuk</Link>
                <Link href="/register" style={{
                  padding: '10px 20px',
                  backgroundColor: '#FFFFFF',
                  color: '#F60000',
                  border: '1px solid #F60000',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: 'none',
                }}>Daftar</Link>
              </div>
            </>
          )}
        </div>
      </div>
    </>
  );
}
