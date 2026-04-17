import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { forumThreads as mockThreads } from '@/data/mock-forum';

const CATEGORIES: Record<string, { label: string; sub: string }> = {
  review: { label: 'Review', sub: 'Reviews' },
  regulasi: { label: 'Regulasi', sub: 'Regulation' },
  operasional: { label: 'Operasional', sub: 'Operations' },
  sharing: { label: 'Sharing', sub: 'Stories' },
  scam: { label: 'Peringatan', sub: 'Scam Alert' },
  tanya: { label: 'Tanya Jawab', sub: 'Q & A' },
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

function formatDate(d: Date | string): string {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatDateTime(d: Date | string): string {
  return new Date(d).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

function categoryInfo(key: string) {
  return CATEGORIES[key] || { label: key, sub: '' };
}

export default async function KomunitasThreadPage({ params }: Props) {
  const { id } = await params;
  const thread = await getThread(id);
  if (!thread) notFound();

  const cat = categoryInfo(thread.category);

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

      <article style={{ maxWidth: '780px', margin: '0 auto' }}>
        {/* Back */}
        <Link href="/komunitas" style={{
          display: 'inline-flex',
          alignItems: 'center',
          gap: 10,
          fontSize: 12,
          fontWeight: 600,
          letterSpacing: '0.16em',
          textTransform: 'uppercase',
          color: '#5C5346',
          textDecoration: 'none',
          marginBottom: 40,
        }}>
          <span style={{ width: 24, height: 1, backgroundColor: '#BF9D63' }} />
          Kembali ke Forum
        </Link>

        {/* Category kicker */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          marginBottom: 18,
          flexWrap: 'wrap',
        }}>
          <span style={{
            fontSize: 11,
            fontWeight: 700,
            letterSpacing: '0.24em',
            textTransform: 'uppercase',
            color: '#0B5D4E',
          }}>
            {cat.label}
          </span>
          {cat.sub && (
            <span style={{
              fontFamily: 'var(--font-display), Georgia, serif',
              fontStyle: 'italic',
              fontSize: 14,
              color: '#BF9D63',
            }}>
              {cat.sub}
            </span>
          )}
          {thread.isPinned && (
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#BF9D63' }}>
              · Pinned
            </span>
          )}
          {thread.isSolved && (
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#0B5D4E' }}>
              · Solved
            </span>
          )}
          {thread.isHot && (
            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#A83232' }}>
              · Hot
            </span>
          )}
        </div>

        {/* Title */}
        <h1 style={{
          fontFamily: 'var(--font-display), Georgia, serif',
          fontSize: 'clamp(34px, 5.5vw, 56px)',
          fontWeight: 500,
          lineHeight: 1.05,
          letterSpacing: '-0.025em',
          color: '#1A1814',
          margin: '0 0 28px',
        }}>
          {thread.title}
        </h1>

        {/* Byline */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          paddingBottom: 24,
          borderBottom: '1px solid rgba(26, 24, 20, 0.12)',
          marginBottom: 40,
          flexWrap: 'wrap',
        }}>
          <span style={{
            width: 48,
            height: 48,
            borderRadius: '50%',
            backgroundColor: '#0B5D4E',
            color: '#FAF6EE',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 14,
            fontWeight: 700,
          }}>
            {thread.authorAvatar || thread.authorName.substring(0, 2).toUpperCase()}
          </span>
          <div style={{ flex: '1 1 auto', minWidth: 0 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <span style={{ fontSize: 15, fontWeight: 600, color: '#1A1814', letterSpacing: '-0.01em' }}>
                {thread.authorName}
              </span>
              {thread.authorBadge && (
                <span style={{
                  fontSize: 10,
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: '#BF9D63',
                }}>
                  {thread.authorBadge}
                </span>
              )}
              {thread.agencyName && (
                <span style={{ fontSize: 12, color: '#5C5346' }}>· {thread.agencyName}</span>
              )}
            </div>
            <div style={{ fontSize: 12, color: '#5C5346', marginTop: 4 }}>
              {formatDate(thread.createdAt)} · {thread.viewCount.toLocaleString('id-ID')} lihat · {thread.replyCount.toLocaleString('id-ID')} balasan
            </div>
          </div>
        </div>

        {/* Content */}
        <div style={{
          fontSize: 17,
          lineHeight: 1.75,
          color: '#2A251E',
          whiteSpace: 'pre-line',
          letterSpacing: '-0.005em',
        }}>
          {thread.content}
        </div>

        {/* Tags */}
        {thread.tags.length > 0 && (
          <div style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 10,
            marginTop: 40,
            paddingTop: 24,
            borderTop: '1px solid rgba(26, 24, 20, 0.12)',
          }}>
            {thread.tags.map((tag) => (
              <span key={tag} style={{
                fontSize: 11,
                fontWeight: 600,
                letterSpacing: '0.1em',
                textTransform: 'uppercase',
                color: '#5C5346',
                padding: '6px 12px',
                border: '1px solid rgba(26, 24, 20, 0.16)',
                backgroundColor: '#FFFFFF',
              }}>
                #{tag}
              </span>
            ))}
          </div>
        )}

        {/* Ornamental divider */}
        <div aria-hidden style={{
          display: 'flex',
          alignItems: 'center',
          gap: 24,
          margin: '64px 0 48px',
        }}>
          <div style={{ flex: 1, height: 1, backgroundColor: 'rgba(26, 24, 20, 0.12)' }} />
          <span style={{ fontSize: 20, color: '#BF9D63', fontWeight: 700 }}>۞</span>
          <div style={{ flex: 1, height: 1, backgroundColor: 'rgba(26, 24, 20, 0.12)' }} />
        </div>

        {/* Replies header */}
        <div style={{
          display: 'flex',
          alignItems: 'baseline',
          justifyContent: 'space-between',
          gap: 16,
          marginBottom: 28,
          flexWrap: 'wrap',
        }}>
          <h2 style={{
            fontFamily: 'var(--font-display), Georgia, serif',
            fontSize: 28,
            fontWeight: 500,
            letterSpacing: '-0.02em',
            color: '#1A1814',
            margin: 0,
          }}>
            Balasan <em style={{ fontStyle: 'italic', color: '#BF9D63' }}>({thread.replies.length})</em>
          </h2>
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase', color: '#5C5346' }}>
            Urut dari terlama
          </span>
        </div>

        {/* Replies list */}
        {thread.replies.length === 0 ? (
          <div style={{
            padding: '48px 24px',
            textAlign: 'center',
            border: '1px dashed rgba(26, 24, 20, 0.2)',
            marginBottom: 40,
          }}>
            <p style={{
              fontFamily: 'var(--font-display), Georgia, serif',
              fontStyle: 'italic',
              fontSize: 19,
              color: '#5C5346',
              margin: 0,
            }}>
              Belum ada balasan — jadi yang pertama memberi pendapat.
            </p>
          </div>
        ) : (
          <ol style={{ listStyle: 'none', margin: '0 0 40px', padding: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {thread.replies.map((reply, idx) => (
              <li key={reply.id} style={{
                display: 'grid',
                gridTemplateColumns: 'auto 1fr',
                columnGap: 20,
                padding: '22px 0',
                borderBottom: '1px solid rgba(26, 24, 20, 0.08)',
              }}>
                <div style={{
                  fontFamily: 'var(--font-display), Georgia, serif',
                  fontStyle: 'italic',
                  fontSize: 18,
                  fontWeight: 500,
                  color: '#BF9D63',
                  lineHeight: 1.1,
                  minWidth: 30,
                }}>
                  #{String(idx + 1).padStart(2, '0')}
                </div>
                <div style={{ minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10, flexWrap: 'wrap' }}>
                    <span style={{
                      width: 28,
                      height: 28,
                      borderRadius: '50%',
                      backgroundColor: '#0B5D4E',
                      color: '#FAF6EE',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: 10,
                      fontWeight: 700,
                    }}>
                      {reply.authorAvatar || reply.authorName.substring(0, 2).toUpperCase()}
                    </span>
                    <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1814' }}>{reply.authorName}</span>
                    {reply.authorBadge && (
                      <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.16em', textTransform: 'uppercase', color: '#BF9D63' }}>
                        {reply.authorBadge}
                      </span>
                    )}
                    <span style={{ fontSize: 11, color: '#9C9382' }}>· {formatDateTime(reply.createdAt)}</span>
                  </div>
                  <p style={{
                    fontSize: 15,
                    lineHeight: 1.7,
                    color: '#2A251E',
                    margin: 0,
                    whiteSpace: 'pre-line',
                  }}>
                    {reply.content}
                  </p>
                </div>
              </li>
            ))}
          </ol>
        )}

        {/* Reply CTA */}
        <div style={{
          padding: '36px 32px',
          backgroundColor: '#FFFFFF',
          borderLeft: '3px solid #BF9D63',
          textAlign: 'left',
          boxShadow: '0 1px 2px rgba(26, 24, 20, 0.04), 0 20px 40px -20px rgba(26, 24, 20, 0.08)',
        }}>
          {thread.isLocked ? (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#A83232', marginBottom: 8 }}>
                Dikunci
              </div>
              <p style={{
                fontFamily: 'var(--font-display), Georgia, serif',
                fontStyle: 'italic',
                fontSize: 20,
                color: '#5C5346',
                margin: 0,
              }}>
                Thread ini telah dikunci oleh moderator. Tidak ada balasan baru yang bisa dikirim.
              </p>
            </>
          ) : (
            <>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.24em', textTransform: 'uppercase', color: '#BF9D63', marginBottom: 10 }}>
                Ikut Diskusi
              </div>
              <p style={{
                fontFamily: 'var(--font-display), Georgia, serif',
                fontSize: 22,
                fontWeight: 400,
                lineHeight: 1.3,
                color: '#1A1814',
                margin: '0 0 20px',
                letterSpacing: '-0.015em',
              }}>
                Punya pengalaman atau pertanyaan serupa?{' '}
                <em style={{ fontStyle: 'italic', color: '#0B5D4E', fontWeight: 500 }}>
                  Login untuk berbalasan.
                </em>
              </p>
              <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link href={`/login?redirect=/forum/${thread.id}`} style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 26px',
                  backgroundColor: '#0B5D4E',
                  color: '#FAF6EE',
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  borderBottom: '3px solid #08443A',
                }}>
                  Masuk
                </Link>
                <Link href="/register" style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '12px 26px',
                  backgroundColor: 'transparent',
                  color: '#0B5D4E',
                  fontSize: 12,
                  fontWeight: 700,
                  letterSpacing: '0.1em',
                  textTransform: 'uppercase',
                  textDecoration: 'none',
                  border: '1px solid rgba(11, 93, 78, 0.3)',
                }}>
                  Daftar Gratis
                </Link>
              </div>
            </>
          )}
        </div>
      </article>
    </>
  );
}
