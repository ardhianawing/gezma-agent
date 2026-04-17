import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { forumThreads as mockThreads } from '@/data/mock-forum';

const CATEGORIES = [
  { key: 'all', label: 'Semua', sub: 'All' },
  { key: 'review', label: 'Review', sub: 'Reviews' },
  { key: 'regulasi', label: 'Regulasi', sub: 'Regulation' },
  { key: 'operasional', label: 'Operasional', sub: 'Operations' },
  { key: 'sharing', label: 'Sharing', sub: 'Stories' },
  { key: 'scam', label: 'Peringatan', sub: 'Scam Alert' },
  { key: 'tanya', label: 'Tanya Jawab', sub: 'Q & A' },
];

type Props = {
  searchParams: Promise<{ category?: string; page?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const cat = CATEGORIES.find((c) => c.key === params.category);
  if (cat && cat.key !== 'all') {
    return {
      title: `${cat.label} · Forum Komunitas`,
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
  return { threads: mapped.slice(offset, offset + limit), total: mapped.length };
}

function timeAgo(date: Date | string | null | undefined): string {
  if (!date) return '';
  const d = new Date(date);
  const diffMs = Date.now() - d.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffHour = Math.floor(diffMs / 3600000);
  const diffDay = Math.floor(diffMs / 86400000);
  if (diffMin < 1) return 'baru saja';
  if (diffMin < 60) return `${diffMin} menit`;
  if (diffHour < 24) return `${diffHour} jam`;
  if (diffDay < 7) return `${diffDay} hari`;
  if (diffDay < 30) return `${Math.floor(diffDay / 7)} minggu`;
  return `${Math.floor(diffDay / 30)} bulan`;
}

function categoryLabel(key: string): string {
  return CATEGORIES.find((c) => c.key === key)?.label || key;
}

export default async function KomunitasPage({ searchParams }: Props) {
  const params = await searchParams;
  const category = params.category || 'all';
  const page = parseInt(params.page || '1', 10);
  const { threads, total } = await getThreads(category, page);
  const totalPages = Math.max(1, Math.min(Math.ceil(total / 20), 10));
  const featured = threads[0];
  const rest = threads.slice(1);

  return (
    <>
      {/* Hero */}
      <section style={{
        display: 'grid',
        gridTemplateColumns: 'minmax(0, 1fr)',
        gap: 24,
        padding: '20px 0 32px',
        position: 'relative',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, color: '#BF9D63' }}>
          <div style={{ width: 32, height: 1, backgroundColor: '#BF9D63' }} />
          <span style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.28em', textTransform: 'uppercase' }}>
            Ruang Diskusi
          </span>
        </div>

        <h1 style={{
          fontFamily: 'var(--font-display), Georgia, serif',
          fontSize: 'clamp(42px, 7vw, 84px)',
          fontWeight: 400,
          lineHeight: 0.95,
          letterSpacing: '-0.035em',
          color: '#1A1814',
          margin: 0,
          maxWidth: '980px',
        }}>
          Tempat jemaah & agen{' '}
          <em style={{ fontStyle: 'italic', color: '#0B5D4E', fontWeight: 500 }}>
            saling berbagi kisah
          </em>{' '}
          sebelum berangkat ke Tanah Suci.
        </h1>

        <p style={{
          fontSize: 16,
          lineHeight: 1.65,
          color: '#5C5346',
          maxWidth: '620px',
          margin: '8px 0 0',
          fontWeight: 400,
        }}>
          Baca tanpa login. Diskusi regulasi terbaru, review hotel & maktab, cerita perjalanan, tanya jawab, dan peringatan penting — semuanya dari komunitas jemaah & agen travel tepercaya.
        </p>

        {/* Meta bar */}
        <div style={{
          display: 'flex',
          flexWrap: 'wrap',
          gap: 32,
          marginTop: 8,
          paddingTop: 20,
          borderTop: '1px solid rgba(26, 24, 20, 0.12)',
          fontSize: 12,
          color: '#5C5346',
          fontWeight: 500,
          letterSpacing: '0.02em',
        }}>
          <span>
            <span style={{ fontFamily: 'var(--font-display), Georgia, serif', fontSize: 22, fontWeight: 700, color: '#0B5D4E' }}>
              {total.toLocaleString('id-ID')}
            </span>{' '}
            thread aktif
          </span>
          <span>
            <span style={{ fontFamily: 'var(--font-display), Georgia, serif', fontSize: 22, fontWeight: 700, color: '#0B5D4E' }}>
              6
            </span>{' '}
            kategori
          </span>
          <span style={{ marginLeft: 'auto', textTransform: 'uppercase', letterSpacing: '0.14em', fontSize: 11 }}>
            Diperbarui setiap hari
          </span>
        </div>
      </section>

      {/* Category navigation — editorial tab bar */}
      <nav style={{
        display: 'flex',
        gap: 36,
        overflowX: 'auto',
        padding: '4px 0 20px',
        borderBottom: '1px solid rgba(26, 24, 20, 0.12)',
        marginBottom: 32,
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
                padding: '6px 0',
                display: 'flex',
                flexDirection: 'column',
                gap: 2,
                flexShrink: 0,
                position: 'relative',
              }}
            >
              <span style={{
                fontSize: 15,
                fontWeight: active ? 700 : 500,
                color: active ? '#0B5D4E' : '#1A1814',
                letterSpacing: '-0.01em',
              }}>
                {cat.label}
              </span>
              <span style={{
                fontSize: 10,
                fontWeight: 600,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: active ? '#BF9D63' : '#9C9382',
              }}>
                {cat.sub}
              </span>
              {active && (
                <span style={{
                  position: 'absolute',
                  bottom: -20,
                  left: 0,
                  right: 0,
                  height: 2,
                  backgroundColor: '#0B5D4E',
                }} />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Content */}
      {threads.length === 0 ? (
        <div style={{
          padding: '80px 24px',
          textAlign: 'center',
          border: '1px dashed rgba(26, 24, 20, 0.18)',
          borderRadius: 0,
        }}>
          <p style={{ fontFamily: 'var(--font-display), Georgia, serif', fontStyle: 'italic', fontSize: 22, color: '#5C5346', margin: 0 }}>
            Belum ada thread di kategori ini.
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0, 1fr)', gap: 48 }}>
          {/* Featured thread — editorial hero card */}
          {featured && (
            <Link
              href={`/komunitas/${featured.id}`}
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr',
                gap: 24,
                padding: '36px 32px',
                backgroundColor: '#FFFFFF',
                borderLeft: '3px solid #BF9D63',
                textDecoration: 'none',
                color: 'inherit',
                boxShadow: '0 1px 2px rgba(26, 24, 20, 0.04), 0 20px 40px -20px rgba(26, 24, 20, 0.08)',
                position: 'relative',
              }}
            >
              <div style={{
                position: 'absolute',
                top: 20,
                right: 24,
                fontSize: 10,
                fontWeight: 700,
                letterSpacing: '0.24em',
                textTransform: 'uppercase',
                color: '#BF9D63',
              }}>
                {featured.isPinned ? 'Dipilih · Pinned' : 'Terbaru'}
              </div>

              <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: '#0B5D4E', fontSize: 11, fontWeight: 700, letterSpacing: '0.22em', textTransform: 'uppercase' }}>
                <span style={{ width: 20, height: 1, backgroundColor: '#0B5D4E' }} />
                <span>{categoryLabel(featured.category)}</span>
                {featured.isHot && <span style={{ color: '#A83232' }}>· Hot</span>}
                {featured.isSolved && <span style={{ color: '#0B5D4E' }}>· Solved</span>}
              </div>

              <h2 style={{
                fontFamily: 'var(--font-display), Georgia, serif',
                fontSize: 'clamp(28px, 4vw, 42px)',
                fontWeight: 500,
                lineHeight: 1.1,
                letterSpacing: '-0.02em',
                color: '#1A1814',
                margin: 0,
              }}>
                {featured.title}
              </h2>

              {(featured.excerpt || featured.content) && (
                <p style={{
                  fontSize: 16,
                  lineHeight: 1.7,
                  color: '#5C5346',
                  margin: 0,
                  maxWidth: '760px',
                  overflow: 'hidden',
                  display: '-webkit-box',
                  WebkitLineClamp: 3,
                  WebkitBoxOrient: 'vertical',
                }}>
                  {featured.excerpt || featured.content}
                </p>
              )}

              <div style={{
                display: 'flex',
                flexWrap: 'wrap',
                alignItems: 'center',
                gap: 18,
                paddingTop: 8,
                borderTop: '1px solid rgba(26, 24, 20, 0.08)',
                fontSize: 12,
                color: '#5C5346',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span style={{
                    width: 34,
                    height: 34,
                    borderRadius: '50%',
                    backgroundColor: '#0B5D4E',
                    color: '#FAF6EE',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 11,
                    fontWeight: 700,
                    letterSpacing: '0.02em',
                  }}>
                    {featured.authorAvatar || featured.authorName.substring(0, 2).toUpperCase()}
                  </span>
                  <div>
                    <div style={{ fontWeight: 600, color: '#1A1814' }}>{featured.authorName}</div>
                    {featured.authorBadge && (
                      <div style={{ fontSize: 10, color: '#BF9D63', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginTop: 2 }}>
                        {featured.authorBadge}
                      </div>
                    )}
                  </div>
                </div>
                <span style={{ color: '#BF9D63' }}>۞</span>
                <span>{featured.replyCount.toLocaleString('id-ID')} balasan</span>
                <span>·</span>
                <span>{featured.viewCount.toLocaleString('id-ID')} lihat</span>
                <span>·</span>
                <span>{timeAgo(featured.lastReplyAt || featured.createdAt)} lalu</span>
              </div>
            </Link>
          )}

          {/* List — editorial numbered rows */}
          {rest.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: 14,
                marginBottom: 24,
              }}>
                <span style={{
                  fontFamily: 'var(--font-display), Georgia, serif',
                  fontSize: 13,
                  fontWeight: 700,
                  letterSpacing: '0.18em',
                  textTransform: 'uppercase',
                  color: '#0B5D4E',
                }}>
                  Semua Diskusi
                </span>
                <div style={{ flex: 1, height: 1, backgroundColor: 'rgba(26, 24, 20, 0.12)' }} />
              </div>

              <ol style={{
                margin: 0,
                padding: 0,
                listStyle: 'none',
                display: 'flex',
                flexDirection: 'column',
              }}>
                {rest.map((thread, idx) => (
                  <li key={thread.id}>
                    <Link
                      href={`/komunitas/${thread.id}`}
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'auto 1fr auto',
                        columnGap: 24,
                        rowGap: 6,
                        padding: '22px 0',
                        borderBottom: '1px solid rgba(26, 24, 20, 0.08)',
                        textDecoration: 'none',
                        color: 'inherit',
                        alignItems: 'start',
                      }}
                    >
                      <span style={{
                        fontFamily: 'var(--font-display), Georgia, serif',
                        fontStyle: 'italic',
                        fontSize: 22,
                        fontWeight: 500,
                        color: '#BF9D63',
                        minWidth: 34,
                        lineHeight: 1.1,
                      }}>
                        {String(idx + 2).padStart(2, '0')}
                      </span>

                      <div style={{ minWidth: 0 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                          <span style={{
                            fontSize: 10,
                            fontWeight: 700,
                            letterSpacing: '0.2em',
                            textTransform: 'uppercase',
                            color: '#0B5D4E',
                          }}>
                            {categoryLabel(thread.category)}
                          </span>
                          {thread.isPinned && (
                            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#BF9D63' }}>
                              · Pinned
                            </span>
                          )}
                          {thread.isSolved && (
                            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#0B5D4E' }}>
                              · Solved
                            </span>
                          )}
                          {thread.isHot && (
                            <span style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#A83232' }}>
                              · Hot
                            </span>
                          )}
                        </div>
                        <h3 style={{
                          fontFamily: 'var(--font-display), Georgia, serif',
                          fontSize: 22,
                          fontWeight: 500,
                          lineHeight: 1.2,
                          letterSpacing: '-0.015em',
                          color: '#1A1814',
                          margin: '0 0 8px',
                          overflow: 'hidden',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                        }}>
                          {thread.title}
                        </h3>
                        <div style={{
                          fontSize: 12,
                          color: '#5C5346',
                          display: 'flex',
                          flexWrap: 'wrap',
                          gap: 10,
                          alignItems: 'center',
                        }}>
                          <span style={{ fontWeight: 600, color: '#1A1814' }}>{thread.authorName}</span>
                          {thread.authorBadge && (
                            <span style={{ fontSize: 10, color: '#BF9D63', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase' }}>
                              · {thread.authorBadge}
                            </span>
                          )}
                          <span>·</span>
                          <span>{timeAgo(thread.lastReplyAt || thread.createdAt)} lalu</span>
                        </div>
                      </div>

                      <div style={{
                        textAlign: 'right',
                        fontSize: 12,
                        color: '#5C5346',
                        display: 'flex',
                        flexDirection: 'column',
                        gap: 4,
                        minWidth: 90,
                      }}>
                        <div>
                          <span style={{ fontFamily: 'var(--font-display), Georgia, serif', fontSize: 20, fontWeight: 700, color: '#0B5D4E' }}>
                            {thread.replyCount.toLocaleString('id-ID')}
                          </span>
                          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#9C9382' }}>
                            Balasan
                          </div>
                        </div>
                        <div style={{ fontSize: 11, color: '#9C9382' }}>
                          {thread.viewCount.toLocaleString('id-ID')} lihat
                        </div>
                      </div>
                    </Link>
                  </li>
                ))}
              </ol>
            </div>
          )}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          marginTop: 48,
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
                  minWidth: 44,
                  height: 44,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '0 12px',
                  fontFamily: 'var(--font-display), Georgia, serif',
                  fontSize: 16,
                  fontWeight: isCurrent ? 700 : 400,
                  fontStyle: isCurrent ? 'normal' : 'italic',
                  color: isCurrent ? '#FAF6EE' : '#1A1814',
                  backgroundColor: isCurrent ? '#0B5D4E' : 'transparent',
                  textDecoration: 'none',
                  letterSpacing: '0.02em',
                  borderBottom: isCurrent ? 'none' : '1px solid transparent',
                }}
              >
                {String(p).padStart(2, '0')}
              </Link>
            );
          })}
        </div>
      )}

      {/* CTA — editorial box */}
      <section style={{
        marginTop: 72,
        padding: '56px 48px',
        backgroundColor: '#0B5D4E',
        color: '#FAF6EE',
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative corner */}
        <div aria-hidden style={{
          position: 'absolute',
          top: -20,
          right: -20,
          fontSize: 200,
          color: 'rgba(191, 157, 99, 0.16)',
          fontFamily: 'var(--font-display), Georgia, serif',
          fontWeight: 900,
          lineHeight: 0.8,
          pointerEvents: 'none',
        }}>۞</div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: '640px', position: 'relative' }}>
          <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: '0.3em', textTransform: 'uppercase', color: '#BF9D63' }}>
            Jadi Bagian Komunitas
          </div>
          <h3 style={{
            fontFamily: 'var(--font-display), Georgia, serif',
            fontSize: 'clamp(28px, 4vw, 40px)',
            fontWeight: 500,
            lineHeight: 1.15,
            letterSpacing: '-0.02em',
            margin: 0,
          }}>
            Daftar gratis untuk{' '}
            <em style={{ fontStyle: 'italic', color: '#BF9D63' }}>
              posting, balasan, dan notifikasi
            </em>{' '}
            thread kesukaan Anda.
          </h3>
          <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap', marginTop: 4 }}>
            <Link href="/register" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 28px',
              backgroundColor: '#BF9D63',
              color: '#0B2A24',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              borderBottom: '3px solid #8F7245',
            }}>
              Daftar Sekarang
            </Link>
            <Link href="/login" style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '14px 28px',
              backgroundColor: 'transparent',
              color: '#FAF6EE',
              fontSize: 13,
              fontWeight: 700,
              letterSpacing: '0.08em',
              textTransform: 'uppercase',
              textDecoration: 'none',
              border: '1px solid rgba(250, 246, 238, 0.3)',
            }}>
              Sudah Punya Akun
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
