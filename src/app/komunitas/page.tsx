import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { forumThreads as mockThreads } from '@/data/mock-forum';

const CATEGORIES = [
  { key: 'all', label: 'Semua', icon: '📋', color: '#6B7280' },
  { key: 'review', label: 'Review', icon: '⭐', color: '#D97706' },
  { key: 'regulasi', label: 'Regulasi', icon: '📜', color: '#2563EB' },
  { key: 'operasional', label: 'Operasional', icon: '⚙️', color: '#059669' },
  { key: 'sharing', label: 'Sharing', icon: '💬', color: '#7C3AED' },
  { key: 'scam', label: 'Scam Alert', icon: '🚨', color: '#DC2626' },
  { key: 'tanya', label: 'Tanya Jawab', icon: '❓', color: '#0891B2' },
];

type Props = {
  searchParams: Promise<{ category?: string; page?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const cat = CATEGORIES.find((c) => c.key === params.category);
  if (cat && cat.key !== 'all') {
    return {
      title: `Forum ${cat.label} Umrah & Haji | GEZMA Komunitas`,
      description: `Diskusi ${cat.label.toLowerCase()} seputar umrah, haji, dan industri travel ibadah di komunitas GEZMA.`,
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
  const sliced = mapped.slice(offset, offset + limit);
  return { threads: sliced, total: mapped.length };
}

function timeAgo(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);
  if (diffMin < 1) return 'baru saja';
  if (diffMin < 60) return `${diffMin} menit lalu`;
  if (diffHour < 24) return `${diffHour} jam lalu`;
  if (diffDay < 7) return `${diffDay} hari lalu`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)} minggu lalu`;
  return `${Math.floor(diffDay / 30)} bulan lalu`;
}

export default async function KomunitasPage({ searchParams }: Props) {
  const params = await searchParams;
  const category = params.category || 'all';
  const page = parseInt(params.page || '1', 10);
  const { threads, total } = await getThreads(category, page);
  const totalPages = Math.max(1, Math.min(Math.ceil(total / 20), 10));

  return (
    <>
      {/* Hero */}
      <section style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 28, fontWeight: 800, color: '#111827', margin: 0, lineHeight: 1.2 }}>
          Forum Komunitas Umrah & Haji
        </h1>
        <p style={{ fontSize: 15, color: '#6B7280', margin: '8px 0 0 0', lineHeight: 1.5 }}>
          Tempat berdiskusi buat jemaah, calon jemaah, dan agen travel. Baca bebas, gabung jadi member buat posting.
        </p>
      </section>

      {/* Category tabs */}
      <div style={{
        display: 'flex',
        gap: 8,
        overflowX: 'auto',
        paddingBottom: 12,
        marginBottom: 16,
        WebkitOverflowScrolling: 'touch',
      }}>
        {CATEGORIES.map((cat) => {
          const active = category === cat.key;
          return (
            <Link
              key={cat.key}
              href={cat.key === 'all' ? '/komunitas' : `/komunitas?category=${cat.key}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                padding: '8px 14px',
                borderRadius: 999,
                border: `1px solid ${active ? cat.color : '#E5E7EB'}`,
                backgroundColor: active ? `${cat.color}14` : '#FFFFFF',
                color: active ? cat.color : '#374151',
                fontSize: 13,
                fontWeight: 600,
                textDecoration: 'none',
                flexShrink: 0,
              }}
            >
              <span>{cat.icon}</span>
              <span>{cat.label}</span>
            </Link>
          );
        })}
      </div>

      {/* Thread list */}
      <div style={{
        backgroundColor: '#FFFFFF',
        borderRadius: 12,
        border: '1px solid #E5E7EB',
        overflow: 'hidden',
      }}>
        {threads.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <p style={{ fontSize: 15, color: '#6B7280', margin: 0 }}>Belum ada thread di kategori ini.</p>
          </div>
        ) : (
          threads.map((thread) => {
            const catInfo = CATEGORIES.find((c) => c.key === thread.category) || CATEGORIES[0];
            return (
              <Link
                key={thread.id}
                href={`/komunitas/${thread.id}`}
                style={{
                  display: 'flex',
                  gap: 12,
                  padding: '14px 16px',
                  borderBottom: '1px solid #F3F4F6',
                  textDecoration: 'none',
                  color: 'inherit',
                  backgroundColor: thread.isPinned ? '#FFFBEB' : 'transparent',
                  alignItems: 'flex-start',
                }}
              >
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  backgroundColor: '#F60000',
                  color: '#FFFFFF',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 13,
                  fontWeight: 700,
                  flexShrink: 0,
                }}>
                  {thread.authorAvatar || thread.authorName.substring(0, 2).toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: '#111827',
                    lineHeight: 1.4,
                    marginBottom: 4,
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                  }}>
                    {thread.isPinned && <span>📌 </span>}
                    {thread.isHot && <span>🔥 </span>}
                    {thread.isSolved && <span>✅ </span>}
                    {thread.title}
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center', fontSize: 12, color: '#6B7280' }}>
                    <span style={{ fontWeight: 500, color: '#374151' }}>{thread.authorName}</span>
                    {thread.authorBadge && (
                      <span style={{
                        fontSize: 10,
                        fontWeight: 600,
                        padding: '2px 7px',
                        borderRadius: 4,
                        backgroundColor: '#2563EB18',
                        color: '#2563EB',
                      }}>
                        {thread.authorBadge}
                      </span>
                    )}
                    <span style={{
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: 4,
                      backgroundColor: `${catInfo.color}18`,
                      color: catInfo.color,
                    }}>
                      {catInfo.icon} {catInfo.label}
                    </span>
                    <span>·</span>
                    <span>{thread.replyCount} balas</span>
                    <span>·</span>
                    <span>{thread.viewCount.toLocaleString('id-ID')} lihat</span>
                    <span>·</span>
                    <span>{timeAgo(thread.lastReplyAt || thread.createdAt)}</span>
                  </div>
                </div>
              </Link>
            );
          })
        )}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: 6, marginTop: 20, flexWrap: 'wrap' }}>
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => {
            const qs = category !== 'all' ? `?category=${category}&page=${p}` : `?page=${p}`;
            return (
              <Link
                key={p}
                href={`/komunitas${qs}`}
                style={{
                  minWidth: 40,
                  height: 40,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 12px',
                  borderRadius: 8,
                  border: p === page ? 'none' : '1px solid #E5E7EB',
                  backgroundColor: p === page ? '#F60000' : '#FFFFFF',
                  color: p === page ? '#FFFFFF' : '#374151',
                  fontWeight: p === page ? 600 : 400,
                  fontSize: 13,
                  textDecoration: 'none',
                }}
              >
                {p}
              </Link>
            );
          })}
        </div>
      )}

      {/* CTA banner */}
      <div style={{
        marginTop: 32,
        padding: '20px 24px',
        borderRadius: 12,
        border: '1px solid #FCA5A5',
        backgroundColor: '#FEF2F2',
        display: 'flex',
        flexWrap: 'wrap',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 16,
      }}>
        <div>
          <h3 style={{ margin: 0, fontSize: 16, fontWeight: 700, color: '#111827' }}>
            Ikut diskusi di forum
          </h3>
          <p style={{ margin: '4px 0 0 0', fontSize: 13, color: '#4B5563', lineHeight: 1.5 }}>
            Daftar gratis buat posting thread, kasih balasan, dan dapet notifikasi update forum.
          </p>
        </div>
        <Link href="/register" style={{
          padding: '10px 20px',
          backgroundColor: '#F60000',
          color: '#FFFFFF',
          borderRadius: 8,
          fontSize: 14,
          fontWeight: 600,
          textDecoration: 'none',
        }}>
          Daftar Sekarang
        </Link>
      </div>
    </>
  );
}
