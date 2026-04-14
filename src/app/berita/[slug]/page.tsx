/* eslint-disable @next/next/no-img-element */
import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { prisma } from '@/lib/prisma';
import { newsArticles as mockArticles } from '@/data/mock-news';

const BASE_URL = process.env.NEXT_PUBLIC_APP_URL || 'https://gezma.ezyindustries.my.id';

const CATEGORIES: Record<string, { label: string; icon: string; color: string; bg: string }> = {
  regulasi: { label: 'Regulasi', icon: '📜', color: '#2563EB', bg: '#EFF6FF' },
  pengumuman: { label: 'Pengumuman', icon: '📢', color: '#7C3AED', bg: '#F5F3FF' },
  event: { label: 'Event', icon: '📅', color: '#059669', bg: '#ECFDF5' },
  tips: { label: 'Tips & Artikel', icon: '💡', color: '#D97706', bg: '#FFFBEB' },
  peringatan: { label: 'Peringatan', icon: '⚠️', color: '#DC2626', bg: '#FEF2F2' },
};

interface DBArticle {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  content: string;
  category: string;
  emoji: string;
  tags: string[];
  author: string;
  authorRole: string;
  readTime: number;
  isBreaking: boolean;
  isOfficial: boolean;
  publishedAt: Date | null;
  imageUrl: string | null;
}

async function getArticle(slug: string): Promise<DBArticle | null> {
  try {
    const article = await prisma.newsArticle.findUnique({ where: { slug } });
    if (article && article.isPublished) return article;

    // Fallback: try mock by id
    const mock = mockArticles.find(a => a.id === slug);
    if (mock) {
      return {
        ...mock,
        slug: mock.id,
        content: mock.content || generateContent(mock.excerpt),
        publishedAt: new Date(mock.publishedAt),
        imageUrl: mock.imageUrl || null,
      };
    }
    return null;
  } catch {
    const mock = mockArticles.find(a => a.id === slug);
    if (mock) {
      return {
        ...mock,
        slug: mock.id,
        content: mock.content || generateContent(mock.excerpt),
        publishedAt: new Date(mock.publishedAt),
        imageUrl: mock.imageUrl || null,
      };
    }
    return null;
  }
}

async function getRelated(category: string, excludeId: string) {
  try {
    const articles = await prisma.newsArticle.findMany({
      where: { category, isPublished: true, id: { not: excludeId } },
      orderBy: { publishedAt: 'desc' },
      take: 3,
      select: { id: true, title: true, slug: true, category: true, emoji: true, publishedAt: true, readTime: true, imageUrl: true },
    });
    if (articles.length > 0) return articles;

    return mockArticles
      .filter(a => a.category === category && a.id !== excludeId)
      .slice(0, 3)
      .map(a => ({ ...a, slug: a.id, publishedAt: new Date(a.publishedAt), imageUrl: a.imageUrl || null }));
  } catch {
    return mockArticles
      .filter(a => a.category === category && a.id !== excludeId)
      .slice(0, 3)
      .map(a => ({ ...a, slug: a.id, publishedAt: new Date(a.publishedAt), imageUrl: a.imageUrl || null }));
  }
}

function generateContent(excerpt: string): string {
  return `${excerpt}\n\nPerkembangan ini menjadi perhatian serius bagi para pelaku industri travel umrah di Indonesia. Dengan adanya perubahan ini, setiap Penyelenggara Perjalanan Ibadah Umrah (PPIU) diharapkan segera melakukan penyesuaian terhadap sistem dan prosedur operasional mereka.\n\nMenurut sumber terpercaya, langkah ini diambil untuk meningkatkan kualitas layanan dan keamanan bagi para jamaah. "Kami berharap semua pihak terkait dapat berkoordinasi dengan baik untuk memastikan transisi yang lancar," ujar pihak berwenang.\n\nGEZMA akan terus memantau perkembangan terkait hal ini dan memberikan update secara berkala melalui platform ini.`;
}

function formatDate(date: Date | string | null): string {
  if (!date) return '';
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

function formatISO(date: Date | string | null): string {
  if (!date) return new Date().toISOString();
  return typeof date === 'string' ? date : date.toISOString();
}

type Props = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) return { title: 'Artikel tidak ditemukan' };

  const catInfo = CATEGORIES[article.category];
  return {
    title: article.title,
    description: article.excerpt,
    keywords: article.tags.join(', '),
    authors: [{ name: article.author }],
    openGraph: {
      title: article.title,
      description: article.excerpt,
      type: 'article',
      publishedTime: formatISO(article.publishedAt),
      authors: [article.author],
      section: catInfo?.label || article.category,
      tags: article.tags,
      url: `${BASE_URL}/berita/${article.slug}`,
      images: article.imageUrl ? [{ url: article.imageUrl, width: 1200, height: 630 }] : [],
      locale: 'id_ID',
      siteName: 'GEZMA',
    },
    twitter: {
      card: 'summary_large_image',
      title: article.title,
      description: article.excerpt,
      images: article.imageUrl ? [article.imageUrl] : [],
    },
    alternates: {
      canonical: `${BASE_URL}/berita/${article.slug}`,
    },
  };
}

export default async function BeritaDetailPage({ params }: Props) {
  const { slug } = await params;
  const article = await getArticle(slug);
  if (!article) notFound();

  const related = await getRelated(article.category, article.id);
  const catInfo = CATEGORIES[article.category];
  const content = article.content || generateContent(article.excerpt);

  // JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'NewsArticle',
    headline: article.title,
    description: article.excerpt,
    image: article.imageUrl || undefined,
    datePublished: formatISO(article.publishedAt),
    dateModified: formatISO(article.publishedAt),
    author: {
      '@type': 'Person',
      name: article.author,
      jobTitle: article.authorRole,
    },
    publisher: {
      '@type': 'Organization',
      name: 'GEZMA',
      url: BASE_URL,
    },
    mainEntityOfPage: {
      '@type': 'WebPage',
      '@id': `${BASE_URL}/berita/${article.slug}`,
    },
    keywords: article.tags.join(', '),
    articleSection: catInfo?.label || article.category,
    wordCount: content.split(/\s+/).length,
    timeRequired: `PT${article.readTime}M`,
  };

  return (
    <>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumb */}
      <nav style={{ marginBottom: '20px', fontSize: '13px', color: '#9CA3AF' }}>
        <Link href="/berita" style={{ color: '#6B7280', textDecoration: 'none' }}>Berita</Link>
        <span style={{ margin: '0 8px' }}>/</span>
        <Link href={`/berita?category=${article.category}`} style={{ color: catInfo?.color || '#6B7280', textDecoration: 'none' }}>
          {catInfo?.icon} {catInfo?.label || article.category}
        </Link>
        <span style={{ margin: '0 8px' }}>/</span>
        <span style={{ color: '#374151' }}>{article.title.length > 50 ? article.title.substring(0, 50) + '...' : article.title}</span>
      </nav>

      {/* Article */}
      <article itemScope itemType="https://schema.org/NewsArticle" style={{ backgroundColor: '#FFFFFF', borderRadius: '16px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
        {/* Hero image */}
        {article.imageUrl && (
          <div style={{ width: '100%', height: '400px', maxHeight: '50vh', overflow: 'hidden', position: 'relative' }}>
            <img
              src={article.imageUrl}
              alt={article.title}
              itemProp="image"
              style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
          </div>
        )}

        {/* Header */}
        <div style={{ padding: '32px', borderBottom: '1px solid #F3F4F6' }}>
          {/* Category + badges */}
          <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginBottom: '16px' }}>
            <span style={{
              padding: '4px 12px', borderRadius: '6px',
              backgroundColor: catInfo?.bg || '#F3F4F6',
              color: catInfo?.color || '#6B7280',
              fontSize: '12px', fontWeight: 600,
            }}>
              {catInfo?.icon} {catInfo?.label}
            </span>
            {article.isBreaking && (
              <span style={{ backgroundColor: '#DC2626', color: '#FFF', padding: '4px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 700, textTransform: 'uppercase' }}>
                BREAKING
              </span>
            )}
            {article.isOfficial && (
              <span style={{ backgroundColor: '#2563EB', color: '#FFF', padding: '4px 12px', borderRadius: '6px', fontSize: '11px', fontWeight: 600 }}>
                ✓ Official
              </span>
            )}
          </div>

          <h1 itemProp="headline" style={{ fontSize: '28px', fontWeight: 800, color: '#111827', lineHeight: 1.3, margin: '0 0 16px' }}>
            {article.emoji} {article.title}
          </h1>

          {/* Meta */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap', fontSize: '14px', color: '#6B7280' }}>
            <span itemProp="author" itemScope itemType="https://schema.org/Person">
              <span itemProp="name">{article.author}</span>
              <span style={{ fontSize: '12px', color: '#9CA3AF', marginLeft: '6px', padding: '2px 8px', backgroundColor: '#F3F4F6', borderRadius: '4px' }}>
                {article.authorRole}
              </span>
            </span>
            <time itemProp="datePublished" dateTime={formatISO(article.publishedAt)}>
              {formatDate(article.publishedAt)}
            </time>
            <span>{article.readTime} menit baca</span>
          </div>
        </div>

        {/* Content */}
        <div itemProp="articleBody" style={{ padding: '32px', fontSize: '16px', lineHeight: 1.8, color: '#374151', whiteSpace: 'pre-line' }}>
          {content}
        </div>

        {/* Tags */}
        {article.tags.length > 0 && (
          <div style={{ padding: '0 32px 32px', display: 'flex', flexWrap: 'wrap', gap: '8px', borderTop: '1px solid #F3F4F6', paddingTop: '20px' }}>
            <span style={{ fontSize: '13px', color: '#9CA3AF', marginRight: '4px' }}>Tags:</span>
            {article.tags.map(tag => (
              <span key={tag} style={{ fontSize: '12px', padding: '4px 12px', borderRadius: '6px', backgroundColor: '#F3F4F6', color: '#6B7280' }}>
                {tag}
              </span>
            ))}
          </div>
        )}
      </article>

      {/* Related Articles */}
      {related.length > 0 && (
        <section style={{ marginTop: '32px' }}>
          <h2 style={{ fontSize: '20px', fontWeight: 700, color: '#111827', marginBottom: '16px' }}>
            Artikel Terkait
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
            {related.map(r => (
              <Link key={r.id} href={`/berita/${r.slug}`} style={{ textDecoration: 'none' }}>
                <div style={{
                  backgroundColor: '#FFFFFF',
                  borderRadius: '12px',
                  border: '1px solid #E5E7EB',
                  padding: '20px',
                  height: '100%',
                  transition: 'box-shadow 0.3s',
                }}>
                  <span style={{ fontSize: '12px', fontWeight: 600, color: catInfo?.color || '#6B7280' }}>
                    {catInfo?.icon} {catInfo?.label}
                  </span>
                  <h3 style={{ fontSize: '15px', fontWeight: 600, color: '#111827', margin: '8px 0', lineHeight: 1.4 }}>
                    {r.title}
                  </h3>
                  <p style={{ fontSize: '12px', color: '#9CA3AF', margin: 0 }}>
                    {formatDate(r.publishedAt)} &middot; {r.readTime} mnt baca
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Back to all */}
      <div style={{ marginTop: '32px', textAlign: 'center' }}>
        <Link href="/berita" style={{
          display: 'inline-block',
          padding: '12px 32px',
          borderRadius: '8px',
          backgroundColor: '#F60000',
          color: '#FFFFFF',
          textDecoration: 'none',
          fontSize: '14px',
          fontWeight: 600,
        }}>
          Lihat Semua Berita
        </Link>
      </div>
    </>
  );
}
