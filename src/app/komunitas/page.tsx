import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { forumThreads as mockThreads } from '@/data/mock-forum';

const CATEGORIES = [
  { key: 'all', label: 'Semua' },
  { key: 'review', label: 'Review' },
  { key: 'regulasi', label: 'Regulasi' },
  { key: 'operasional', label: 'Operasional' },
  { key: 'sharing', label: 'Sharing' },
  { key: 'scam', label: 'Peringatan' },
  { key: 'tanya', label: 'Tanya Jawab' },
];

type Props = {
  searchParams: Promise<{ category?: string; page?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const cat = CATEGORIES.find((c) => c.key === params.category);
  if (cat && cat.key !== 'all') {
    return {
      title: `${cat.label} · Komunitas GEZMA`,
      description: `Diskusi ${cat.label.toLowerCase()} seputar umrah, haji, dan industri travel ibadah.`,
    };
  }
  return {};
}

interface Thread {
  id: string;
  title: string;
  excerpt?: string;
  content?: string;
  category: string;
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
  lastReplyBy?: string | null;
  lastReplyAt?: Date | string | null;
  createdAt: Date | string;
  tags: string[];
}

async function getThreads(category?: string, page = 1): Promise<{ threads: Thread[]; total: number }> {
  const limit = 20;
  const offset = (page - 1) * limit;

  try {
    const where: Record<string, unknown> = { deletedAt: null };
    if (category && category !== 'all') where.category = category;

    const [data, total] = await Promise.all([
      prisma.forumThread.findMany({
        where,
        orderBy: [{ isPinned: 'desc' }, { createdAt: 'desc' }],
        skip: offset,
        take: limit,
      }),
      prisma.forumThread.count({ where }),
    ]);

    if (data.length > 0) {
      return { threads: data as Thread[], total };
    }
  } catch {
    // fall through to mock
  }

  let filtered = [...mockThreads];
  if (category && category !== 'all') {
    filtered = filtered.filter((t) => t.category === category);
  }
  const mapped: Thread[] = filtered.map((t) => ({
    id: t.id,
    title: t.title,
    excerpt: t.excerpt,
    category: t.category,
    authorName: t.author,
    authorAvatar: t.authorAvatar,
    authorBadge: t.authorBadge,
    replyCount: t.replyCount,
    viewCount: t.viewCount,
    isPinned: t.isPinned,
    isHot: t.isHot,
    isSolved: t.isSolved,
    isLocked: false,
    lastReplyBy: t.lastReplyBy,
    lastReplyAt: t.lastReplyAt,
    createdAt: t.lastReplyAt,
    tags: t.tags,
  }));
  return { threads: mapped.slice(offset, offset + limit), total: mapped.length };
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

export default async function KomunitasPage({ searchParams }: Props) {
  const params = await searchParams;
  const category = params.category || 'all';
  const page = parseInt(params.page || '1', 10);
  const { threads, total } = await getThreads(category, page);
  const totalPages = Math.max(1, Math.min(Math.ceil(total / 20), 10));

  return (
    <>
      {/* Category tabs — sticky below header */}
      <div style={{
        display: 'flex',
        gap: 0,
        overflowX: 'auto',
        borderBottom: '0.5px solid #E5E5E5',
        marginBottom: 0,
        paddingTop: 4,
        position: 'sticky',
        top: 56,
        backgroundColor: 'rgba(255, 255, 255, 0.92)',
        backdropFilter: 'saturate(180%) blur(20px)',
        WebkitBackdropFilter: 'saturate(180%) blur(20px)',
        zIndex: 40,
        WebkitOverflowScrolling: 'touch',
      }}>
        {CATEGORIES.map((cat) => {
          const active = category === cat.key;
          return (
            <Link
              key={cat.key}
              href={cat.key === 'all' ? '/komunitas' : `/komunitas?category=${cat.key}`}
              style={{
                textDecoration: 'none',
                padding: '14px 16px',
                fontSize: 14,
                fontWeight: active ? 600 : 500,
                color: active ? '#0A0A0A' : '#737373',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                borderBottom: active ? '2px solid #0A0A0A' : '2px solid transparent',
                position: 'relative',
                marginBottom: -0.5,
              }}
            >
              {cat.label}
            </Link>
          );
        })}
      </div>

      {/* Feed */}
      {threads.length === 0 ? (
        <div style={{
          padding: '80px 20px',
          textAlign: 'center',
          color: '#737373',
          fontSize: 15,
        }}>
          Belum ada thread di kategori ini.
        </div>
      ) : (
        <div>
          {threads.map((thread) => {
            const catLabel = CATEGORIES.find((c) => c.key === thread.category)?.label || thread.category;
            const preview = thread.excerpt || thread.content || '';
            return (
              <Link
                key={thread.id}
                href={`/komunitas/${thread.id}`}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '48px 1fr',
                  columnGap: 12,
                  padding: '16px 0',
                  borderBottom: '0.5px solid #E5E5E5',
                  textDecoration: 'none',
                  color: 'inherit',
                }}
              >
                {/* Avatar */}
                <div style={{ paddingTop: 2 }}>
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
                    letterSpacing: '-0.01em',
                  }}>
                    {(thread.authorAvatar || thread.authorName.substring(0, 2)).toUpperCase()}
                  </div>
                </div>

                {/* Content */}
                <div style={{ minWidth: 0 }}>
                  {/* Header row */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    fontSize: 14,
                    marginBottom: 4,
                    flexWrap: 'wrap',
                  }}>
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
                    <span style={{ color: '#737373' }}>{timeAgo(thread.lastReplyAt || thread.createdAt)}</span>
                    {thread.isPinned && (
                      <>
                        <span style={{ color: '#A3A3A3' }}>·</span>
                        <span style={{ color: '#737373', fontSize: 12 }}>📌 Pinned</span>
                      </>
                    )}
                  </div>

                  {/* Category + flags */}
                  <div style={{ display: 'flex', gap: 6, marginBottom: 6, flexWrap: 'wrap' }}>
                    <span style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      padding: '2px 8px',
                      fontSize: 11,
                      fontWeight: 600,
                      color: '#0A0A0A',
                      backgroundColor: '#F4F4F4',
                      borderRadius: 999,
                    }}>
                      {catLabel}
                    </span>
                    {thread.isHot && (
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#D4183D' }}>🔥 Hot</span>
                    )}
                    {thread.isSolved && (
                      <span style={{ fontSize: 11, fontWeight: 600, color: '#047857' }}>✓ Solved</span>
                    )}
                  </div>

                  {/* Title */}
                  <div style={{
                    fontSize: 15,
                    fontWeight: 600,
                    lineHeight: 1.35,
                    color: '#0A0A0A',
                    marginBottom: preview ? 4 : 8,
                    letterSpacing: '-0.01em',
                    overflow: 'hidden',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}>
                    {thread.title}
                  </div>

                  {/* Preview */}
                  {preview && (
                    <div style={{
                      fontSize: 15,
                      lineHeight: 1.4,
                      color: '#525252',
                      marginBottom: 8,
                      overflow: 'hidden',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                    }}>
                      {preview}
                    </div>
                  )}

                  {/* Action row */}
                  <div style={{
                    display: 'flex',
                    gap: 20,
                    fontSize: 13,
                    color: '#737373',
                    marginTop: 4,
                  }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                      </svg>
                      {formatNumber(thread.replyCount)}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </svg>
                      {formatNumber(thread.viewCount)}
                    </span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <circle cx="18" cy="5" r="3" />
                        <circle cx="6" cy="12" r="3" />
                        <circle cx="18" cy="19" r="3" />
                        <line x1="8.59" y1="13.51" x2="15.42" y2="17.49" />
                        <line x1="15.41" y1="6.51" x2="8.59" y2="10.49" />
                      </svg>
                    </span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 2,
          marginTop: 32,
          flexWrap: 'wrap',
        }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            const qs = category !== 'all' ? `?category=${category}&page=${p}` : `?page=${p}`;
            const isCurrent = p === page;
            return (
              <Link
                key={p}
                href={`/komunitas${qs}`}
                style={{
                  minWidth: 36,
                  height: 36,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 10px',
                  fontSize: 14,
                  fontWeight: isCurrent ? 600 : 500,
                  color: isCurrent ? '#FFFFFF' : '#0A0A0A',
                  backgroundColor: isCurrent ? '#0A0A0A' : 'transparent',
                  textDecoration: 'none',
                  borderRadius: 999,
                }}
              >
                {p}
              </Link>
            );
          })}
        </div>
      )}

      {/* Login prompt */}
      <div style={{
        marginTop: 40,
        padding: '24px 20px',
        borderRadius: 16,
        backgroundColor: '#F4F4F4',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        gap: 16,
        flexWrap: 'wrap',
      }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#0A0A0A', marginBottom: 2 }}>
            Mau ikut diskusi?
          </div>
          <div style={{ fontSize: 13, color: '#525252' }}>
            Login atau daftar gratis buat posting & balas thread.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/login" style={{
            padding: '8px 18px',
            fontSize: 13,
            fontWeight: 600,
            color: '#0A0A0A',
            backgroundColor: '#FFFFFF',
            borderRadius: 999,
            textDecoration: 'none',
            border: '0.5px solid #D4D4D4',
          }}>Masuk</Link>
          <Link href="/register" style={{
            padding: '8px 18px',
            fontSize: 13,
            fontWeight: 600,
            color: '#FFFFFF',
            backgroundColor: '#0A0A0A',
            borderRadius: 999,
            textDecoration: 'none',
          }}>Daftar</Link>
        </div>
      </div>
    </>
  );
}
