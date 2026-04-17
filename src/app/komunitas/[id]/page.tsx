import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { forumThreads as mockThreads } from '@/data/mock-forum';

const CATEGORIES: Record<string, string> = {
  review: 'Review',
  regulasi: 'Regulasi',
  operasional: 'Operasional',
  sharing: 'Sharing',
  scam: 'Peringatan',
  tanya: 'Tanya Jawab',
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
    // fall through
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

function timeAgo(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);
  if (diffMin < 1) return 'baru';
  if (diffMin < 60) return `${diffMin}m`;
  if (diffHour < 24) return `${diffHour}j`;
  if (diffDay < 7) return `${diffDay}h`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)}mg`;
  return `${Math.floor(diffDay / 30)}bl`;
}

function formatNumber(n: number): string {
  if (n >= 1000000) return `${(n / 1000000).toFixed(1)}jt`;
  if (n >= 1000) return `${(n / 1000).toFixed(1)}rb`;
  return n.toString();
}

function avatarColor(seed: string): string {
  const colors = ['#0A0A0A', '#1F2937', '#374151', '#4B5563', '#6B7280'];
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = seed.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
}

export default async function KomunitasThreadPage({ params }: Props) {
  const { id } = await params;
  const thread = await getThread(id);
  if (!thread) notFound();

  const catLabel = CATEGORIES[thread.category] || thread.category;

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

      {/* Back */}
      <Link href="/komunitas" style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: 8,
        padding: '16px 0 12px',
        fontSize: 14,
        color: '#0A0A0A',
        textDecoration: 'none',
        fontWeight: 500,
      }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <line x1="19" y1="12" x2="5" y2="12" />
          <polyline points="12 19 5 12 12 5" />
        </svg>
        Kembali
      </Link>

      {/* Thread post */}
      <article style={{
        paddingTop: 16,
        paddingBottom: 20,
        borderBottom: '0.5px solid #E5E5E5',
      }}>
        {/* Header: avatar + author + time */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '48px 1fr',
          columnGap: 12,
          alignItems: 'start',
          marginBottom: 12,
        }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: '50%',
            backgroundColor: avatarColor(thread.authorName),
            color: '#FFFFFF',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            fontWeight: 600,
          }}>
            {(thread.authorAvatar || thread.authorName.substring(0, 2)).toUpperCase()}
          </div>
          <div style={{ minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, flexWrap: 'wrap' }}>
              <span style={{ fontWeight: 600, color: '#0A0A0A' }}>{thread.authorName}</span>
              {thread.authorBadge && (
                <span title={thread.authorBadge} style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  width: 14,
                  height: 14,
                  borderRadius: '50%',
                  backgroundColor: '#0A0A0A',
                  color: '#FFFFFF',
                  fontSize: 9,
                  fontWeight: 700,
                }}>✓</span>
              )}
              <span style={{ color: '#A3A3A3' }}>·</span>
              <span style={{ color: '#737373' }}>{timeAgo(thread.createdAt)}</span>
            </div>
            {(thread.authorBadge || thread.agencyName) && (
              <div style={{ fontSize: 13, color: '#737373', marginTop: 2 }}>
                {thread.authorBadge && <span>{thread.authorBadge}</span>}
                {thread.authorBadge && thread.agencyName && <span> · </span>}
                {thread.agencyName && <span>{thread.agencyName}</span>}
              </div>
            )}
          </div>
        </div>

        {/* Flags row */}
        <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 12 }}>
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            padding: '3px 10px',
            fontSize: 12,
            fontWeight: 600,
            color: '#0A0A0A',
            backgroundColor: '#F4F4F4',
            borderRadius: 999,
          }}>
            {catLabel}
          </span>
          {thread.isPinned && (
            <span style={{ fontSize: 12, fontWeight: 600, color: '#737373' }}>📌 Pinned</span>
          )}
          {thread.isHot && (
            <span style={{ fontSize: 12, fontWeight: 600, color: '#D4183D' }}>🔥 Hot</span>
          )}
          {thread.isSolved && (
            <span style={{ fontSize: 12, fontWeight: 600, color: '#047857' }}>✓ Solved</span>
          )}
          {thread.isLocked && (
            <span style={{ fontSize: 12, fontWeight: 600, color: '#737373' }}>🔒 Locked</span>
          )}
        </div>

        {/* Title */}
        <h1 style={{
          fontSize: 22,
          fontWeight: 700,
          lineHeight: 1.3,
          letterSpacing: '-0.02em',
          color: '#0A0A0A',
          margin: '0 0 12px',
        }}>
          {thread.title}
        </h1>

        {/* Content */}
        <div style={{
          fontSize: 16,
          lineHeight: 1.55,
          color: '#0A0A0A',
          whiteSpace: 'pre-line',
          letterSpacing: '-0.005em',
        }}>
          {thread.content}
        </div>

        {/* Tags */}
        {thread.tags.length > 0 && (
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 16 }}>
            {thread.tags.map((tag) => (
              <span key={tag} style={{
                fontSize: 13,
                color: '#525252',
                padding: '2px 0',
              }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Stats row */}
        <div style={{
          display: 'flex',
          gap: 20,
          fontSize: 13,
          color: '#737373',
          marginTop: 16,
        }}>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
            </svg>
            {formatNumber(thread.replyCount)} balasan
          </span>
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            {formatNumber(thread.viewCount)} lihat
          </span>
        </div>
      </article>

      {/* Replies */}
      {thread.replies.length > 0 ? (
        <div>
          {thread.replies.map((reply) => (
            <div key={reply.id} style={{
              display: 'grid',
              gridTemplateColumns: '48px 1fr',
              columnGap: 12,
              padding: '16px 0',
              borderBottom: '0.5px solid #E5E5E5',
            }}>
              <div style={{
                width: 36,
                height: 36,
                borderRadius: '50%',
                backgroundColor: avatarColor(reply.authorName),
                color: '#FFFFFF',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: 13,
                fontWeight: 600,
              }}>
                {(reply.authorAvatar || reply.authorName.substring(0, 2)).toUpperCase()}
              </div>
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 14, marginBottom: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontWeight: 600, color: '#0A0A0A' }}>{reply.authorName}</span>
                  {reply.authorBadge && (
                    <span title={reply.authorBadge} style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: 14,
                      height: 14,
                      borderRadius: '50%',
                      backgroundColor: '#0A0A0A',
                      color: '#FFFFFF',
                      fontSize: 9,
                      fontWeight: 700,
                    }}>✓</span>
                  )}
                  <span style={{ color: '#A3A3A3' }}>·</span>
                  <span style={{ color: '#737373' }}>{timeAgo(reply.createdAt)}</span>
                </div>
                <p style={{
                  fontSize: 15,
                  lineHeight: 1.5,
                  color: '#0A0A0A',
                  margin: 0,
                  whiteSpace: 'pre-line',
                }}>
                  {reply.content}
                </p>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div style={{
          padding: '32px 16px',
          textAlign: 'center',
          color: '#737373',
          fontSize: 14,
          borderBottom: '0.5px solid #E5E5E5',
        }}>
          Belum ada balasan. Jadi yang pertama.
        </div>
      )}

      {/* Reply CTA */}
      <div style={{
        marginTop: 24,
        padding: '20px',
        borderRadius: 16,
        backgroundColor: '#F4F4F4',
      }}>
        {thread.isLocked ? (
          <div style={{ fontSize: 14, color: '#525252', textAlign: 'center' }}>
            🔒 Thread ini sudah dikunci. Tidak bisa membalas.
          </div>
        ) : (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 12,
            flexWrap: 'wrap',
          }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#0A0A0A', marginBottom: 2 }}>
                Ikut balas thread ini
              </div>
              <div style={{ fontSize: 13, color: '#525252' }}>
                Login dulu buat posting balasan.
              </div>
            </div>
            <div style={{ display: 'flex', gap: 8 }}>
              <Link href="/register" style={{
                padding: '8px 18px',
                fontSize: 13,
                fontWeight: 600,
                color: '#0A0A0A',
                backgroundColor: '#FFFFFF',
                borderRadius: 999,
                textDecoration: 'none',
                border: '0.5px solid #D4D4D4',
              }}>Daftar</Link>
              <Link href={`/login?redirect=/forum/${thread.id}`} style={{
                padding: '8px 18px',
                fontSize: 13,
                fontWeight: 600,
                color: '#FFFFFF',
                backgroundColor: '#0A0A0A',
                borderRadius: 999,
                textDecoration: 'none',
              }}>Masuk</Link>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
