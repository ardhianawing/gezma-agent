/* eslint-disable @next/next/no-img-element */
import type { Metadata } from 'next';
import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { newsArticles as mockArticles } from '@/data/mock-news';

const CATEGORIES = [
  { id: 'all', label: 'Semua', icon: '📰', color: '#6B7280' },
  { id: 'regulasi', label: 'Regulasi', icon: '📜', color: '#2563EB' },
  { id: 'pengumuman', label: 'Pengumuman', icon: '📢', color: '#7C3AED' },
  { id: 'event', label: 'Event', icon: '📅', color: '#059669' },
  { id: 'tips', label: 'Tips & Artikel', icon: '💡', color: '#D97706' },
  { id: 'peringatan', label: 'Peringatan', icon: '⚠️', color: '#DC2626' },
];

const CATEGORY_BG: Record<string, string> = {
  regulasi: '#EFF6FF', pengumuman: '#F5F3FF', event: '#ECFDF5', tips: '#FFFBEB', peringatan: '#FEF2F2',
};
const CATEGORY_COLOR: Record<string, string> = {
  regulasi: '#2563EB', pengumuman: '#7C3AED', event: '#059669', tips: '#D97706', peringatan: '#DC2626',
};

type Props = {
  searchParams: Promise<{ category?: string; page?: string }>;
};

export async function generateMetadata({ searchParams }: Props): Promise<Metadata> {
  const params = await searchParams;
  const cat = CATEGORIES.find(c => c.id === params.category);
  if (cat && cat.id !== 'all') {
    return {
      title: `Berita ${cat.label} Umrah & Haji | GEZMA`,
      description: `Kumpulan berita ${cat.label.toLowerCase()} seputar umrah, haji, dan industri travel ibadah terbaru.`,
    };
  }
  return {};
}

interface Article {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  category: string;
  emoji: string;
  tags: string[];
  author: string;
  authorRole: string;
  readTime: number;
  isBreaking: boolean;
  isOfficial: boolean;
  isFeatured: boolean;
  publishedAt: Date | string | null;
  imageUrl?: string | null;
}

async function getArticles(category?: string, page = 1): Promise<{ articles: Article[]; total: number }> {
  const limit = 12;
  const offset = (page - 1) * limit;

  try {
    const where: Record<string, unknown> = { isPublished: true };
    if (category && category !== 'all') where.category = category;

    const [data, total] = await Promise.all([
      prisma.newsArticle.findMany({
        where,
        orderBy: { publishedAt: 'desc' },
        skip: offset,
        take: limit,
        select: {
          id: true, title: true, slug: true, excerpt: true, category: true,
          emoji: true, tags: true, author: true, authorRole: true, readTime: true,
          isBreaking: true, isOfficial: true, isFeatured: true, publishedAt: true, imageUrl: true,
        },
      }),
      prisma.newsArticle.count({ where }),
    ]);

    if (data.length > 0) return { articles: data, total };

    // Fallback to mock
    let filtered = [...mockArticles];
    if (category && category !== 'all') filtered = filtered.filter(a => a.category === category);
    return {
      articles: filtered.slice(offset, offset + limit).map(a => ({ ...a, slug: a.id, publishedAt: a.publishedAt })),
      total: filtered.length,
    };
  } catch {
    let filtered = [...mockArticles];
    if (category && category !== 'all') filtered = filtered.filter(a => a.category === category);
    return {
      articles: filtered.slice(offset, offset + limit).map(a => ({ ...a, slug: a.id, publishedAt: a.publishedAt })),
      total: filtered.length,
    };
  }
}

function formatDate(date: Date | string | null): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function getCatInfo(category: string) {
  return CATEGORIES.find(c => c.id === category);
}

export default async function BeritaPage({ searchParams }: Props) {
  const params = await searchParams;
  const category = params.category || 'all';
  const page = Math.max(parseInt(params.page || '1', 10), 1);
  const { articles, total } = await getArticles(category, page);
  const totalPages = Math.ceil(total / 12);

  const featured = articles.filter(a => a.isFeatured && category === 'all');
  const regular = category === 'all' ? articles.filter(a => !a.isFeatured) : articles;

  return (
    <>
      {/* Page Title */}
      <div style={{ marginBottom: '32px' }}>
        <h1 style={{ fontSize: '28px', fontWeight: 800, color: '#111827', margin: '0 0 8px' }}>
          Berita & Informasi
        </h1>
        <p style={{ fontSize: '16px', color: '#6B7280', margin: 0 }}>
          Informasi terkini seputar umrah, haji, regulasi, dan industri travel ibadah
        </p>
      </div>

      {/* Category Filter */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', marginBottom: '24px', paddingBottom: '4px' }}>
        {CATEGORIES.map(cat => {
          const isActive = category === cat.id;
          return (
            <Link
              key={cat.id}
              href={cat.id === 'all' ? '/berita' : `/berita?category=${cat.id}`}
              style={{
                padding: '10px 18px',
                borderRadius: '24px',
                border: `1px solid ${isActive ? cat.color : '#E5E7EB'}`,
                backgroundColor: isActive ? cat.color : '#FFFFFF',
                color: isActive ? '#FFFFFF' : '#4B5563',
                fontSize: '14px',
                fontWeight: isActive ? 600 : 400,
                textDecoration: 'none',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'all 0.2s',
              }}
            >
              {cat.icon} {cat.label}
            </Link>
          );
        })}
      </div>

      {/* Featured Section */}
      {featured.length > 0 && page === 1 && (
        <div style={{ display: 'grid', gridTemplateColumns: featured.length > 1 ? '2fr 1fr' : '1fr', gap: '16px', marginBottom: '32px' }}>
          {featured.slice(0, 2).map((article, idx) => (
            <Link key={article.id} href={`/berita/${article.slug}`} style={{ textDecoration: 'none' }}>
              <article style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E5E7EB',
                overflow: 'hidden',
                height: '100%',
                transition: 'box-shadow 0.3s',
              }}>
                <div style={{
                  height: idx === 0 ? '220px' : '180px',
                  background: article.imageUrl ? `url(${article.imageUrl}) center/cover` : `linear-gradient(135deg, ${CATEGORY_COLOR[article.category] || '#6B7280'}22 0%, ${CATEGORY_COLOR[article.category] || '#6B7280'}11 100%)`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                }}>
                  {!article.imageUrl && <span style={{ fontSize: '64px' }}>{article.emoji}</span>}
                  {article.isBreaking && (
                    <span style={{ position: 'absolute', top: '12px', left: '12px', backgroundColor: '#DC2626', color: '#FFF', padding: '4px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
                      BREAKING
                    </span>
                  )}
                </div>
                <div style={{ padding: '20px' }}>
                  <span style={{
                    display: 'inline-block', padding: '4px 10px', borderRadius: '6px',
                    backgroundColor: CATEGORY_BG[article.category] || '#F3F4F6',
                    color: CATEGORY_COLOR[article.category] || '#6B7280',
                    fontSize: '12px', fontWeight: 600, marginBottom: '10px',
                  }}>
                    {getCatInfo(article.category)?.icon} {getCatInfo(article.category)?.label}
                  </span>
                  <h2 style={{ fontSize: idx === 0 ? '20px' : '16px', fontWeight: 700, color: '#111827', lineHeight: 1.35, margin: '0 0 8px' }}>
                    {article.title}
                  </h2>
                  <p style={{ fontSize: '14px', color: '#6B7280', lineHeight: 1.5, margin: '0 0 12px' }}>
                    {article.excerpt}
                  </p>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#9CA3AF' }}>
                    <span>{article.author}</span>
                    <span>{formatDate(article.publishedAt)} &middot; {article.readTime} mnt baca</span>
                  </div>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}

      {/* Results count */}
      <div style={{ fontSize: '13px', color: '#9CA3AF', marginBottom: '16px' }}>
        {total} artikel ditemukan
        {category !== 'all' && ` dalam kategori ${getCatInfo(category)?.label}`}
      </div>

      {/* Article Grid */}
      {regular.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#9CA3AF' }}>
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
          <p style={{ fontSize: '16px', fontWeight: 500 }}>Belum ada artikel</p>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
          {regular.map(article => (
            <Link key={article.id} href={`/berita/${article.slug}`} style={{ textDecoration: 'none' }}>
              <article style={{
                backgroundColor: '#FFFFFF',
                borderRadius: '12px',
                border: '1px solid #E5E7EB',
                padding: '20px',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                transition: 'box-shadow 0.3s, transform 0.3s',
              }}>
                <div style={{ display: 'flex', alignItems: 'flex-start', gap: '14px', marginBottom: '10px' }}>
                  {article.imageUrl ? (
                    <img src={article.imageUrl} alt="" style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover', flexShrink: 0 }} />
                  ) : (
                    <div style={{
                      width: '52px', height: '52px', borderRadius: '50%', flexShrink: 0,
                      backgroundColor: CATEGORY_BG[article.category] || '#F3F4F6',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                    }}>
                      <span style={{ fontSize: '26px' }}>{article.emoji}</span>
                    </div>
                  )}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '6px' }}>
                      <span style={{
                        padding: '3px 8px', borderRadius: '6px', fontSize: '11px', fontWeight: 600,
                        backgroundColor: CATEGORY_BG[article.category] || '#F3F4F6',
                        color: CATEGORY_COLOR[article.category] || '#6B7280',
                      }}>
                        {getCatInfo(article.category)?.icon} {getCatInfo(article.category)?.label}
                      </span>
                      {article.isBreaking && (
                        <span style={{ backgroundColor: '#DC2626', color: '#FFF', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 700, textTransform: 'uppercase' }}>
                          BREAKING
                        </span>
                      )}
                      {article.isOfficial && (
                        <span style={{ backgroundColor: '#2563EB', color: '#FFF', padding: '3px 8px', borderRadius: '6px', fontSize: '10px', fontWeight: 600 }}>
                          ✓ Official
                        </span>
                      )}
                    </div>
                    <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', lineHeight: 1.4, margin: 0 }}>
                      {article.title}
                    </h3>
                  </div>
                </div>
                <p style={{ fontSize: '13px', color: '#6B7280', lineHeight: 1.55, margin: '0 0 auto' }}>
                  {article.excerpt}
                </p>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', fontSize: '12px', color: '#9CA3AF', marginTop: '14px', paddingTop: '12px', borderTop: '1px solid #F3F4F6' }}>
                  <span>{article.author}</span>
                  <span>{formatDate(article.publishedAt)} &middot; {article.readTime} mnt baca</span>
                </div>
              </article>
            </Link>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '32px' }}>
          {page > 1 && (
            <Link href={`/berita?${category !== 'all' ? `category=${category}&` : ''}page=${page - 1}`}
              style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #E5E7EB', backgroundColor: '#FFFFFF', color: '#374151', textDecoration: 'none', fontSize: '14px' }}>
              &larr; Sebelumnya
            </Link>
          )}
          <span style={{ padding: '8px 16px', fontSize: '14px', color: '#6B7280', display: 'flex', alignItems: 'center' }}>
            Halaman {page} dari {totalPages}
          </span>
          {page < totalPages && (
            <Link href={`/berita?${category !== 'all' ? `category=${category}&` : ''}page=${page + 1}`}
              style={{ padding: '8px 16px', borderRadius: '8px', border: '1px solid #E5E7EB', backgroundColor: '#FFFFFF', color: '#374151', textDecoration: 'none', fontSize: '14px' }}>
              Selanjutnya &rarr;
            </Link>
          )}
        </div>
      )}
    </>
  );
}
