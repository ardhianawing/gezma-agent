'use client';

import { use, useState, useEffect } from 'react';
import Link from 'next/link';
import { ArrowLeft, Clock, Tag, User } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { newsCategories, type NewsArticle } from '@/data/mock-news';

// Generate full content for articles that have empty content
function getFullContent(article: NewsArticle): string {
  if (article.content) return article.content;
  // Generate mock full content based on excerpt
  return `${article.excerpt}\n\nPerkembangan ini menjadi perhatian serius bagi para pelaku industri travel umrah di Indonesia. Dengan adanya perubahan ini, setiap Penyelenggara Perjalanan Ibadah Umrah (PPIU) diharapkan segera melakukan penyesuaian terhadap sistem dan prosedur operasional mereka.\n\nMenurut sumber terpercaya, langkah ini diambil untuk meningkatkan kualitas layanan dan keamanan bagi para jamaah. "Kami berharap semua pihak terkait dapat berkoordinasi dengan baik untuk memastikan transisi yang lancar," ujar pihak berwenang.\n\nDalam konteks yang lebih luas, perubahan ini juga sejalan dengan upaya modernisasi sistem pelayanan ibadah umrah secara global. Beberapa negara lain juga telah menerapkan langkah serupa untuk memastikan standar layanan yang lebih baik.\n\nBagi para agen travel dan PPIU, disarankan untuk:\n1. Segera mempelajari ketentuan baru yang berlaku\n2. Melakukan update sistem sesuai persyaratan terbaru\n3. Menginformasikan perubahan kepada seluruh jamaah\n4. Berkonsultasi dengan pihak terkait jika ada kendala\n\nGEZMA akan terus memantau perkembangan terkait hal ini dan memberikan update secara berkala melalui platform ini.`;
}

export default function NewsDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { c } = useTheme();
  const { isMobile } = useResponsive();
  const [article, setArticle] = useState<NewsArticle | null>(null);
  const [relatedArticles, setRelatedArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;
    async function fetchData() {
      setLoading(true);
      try {
        const res = await fetch(`/api/news/${id}`);
        if (res.ok) {
          const json = await res.json();
          const data = json.data || json;
          if (!cancelled) {
            setArticle(data);
            // Fetch related articles by same category
            if (data.category) {
              const relRes = await fetch(`/api/news?category=${data.category}&limit=4`);
              if (relRes.ok) {
                const relJson = await relRes.json();
                const relList = relJson.data || relJson;
                if (!cancelled) {
                  setRelatedArticles((Array.isArray(relList) ? relList : []).filter((a: NewsArticle) => a.id !== id).slice(0, 3));
                }
              }
            }
          }
        } else {
          if (!cancelled) setArticle(null);
        }
      } catch (err) {
        console.error('Failed to fetch article:', err);
        if (!cancelled) setArticle(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchData();
    return () => { cancelled = true; };
  }, [id]);

  if (loading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <p style={{ fontSize: '16px', color: c.textMuted }}>Memuat artikel...</p>
      </div>
    );
  }

  if (!article) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <p style={{ fontSize: '16px', color: c.textMuted }}>Artikel tidak ditemukan.</p>
        <Link href="/news" style={{ color: c.primary, textDecoration: 'none', fontSize: '14px' }}>
          Kembali ke Berita
        </Link>
      </div>
    );
  }

  const categoryInfo = newsCategories.find(cat => cat.id === article.category);

  const fullContent = getFullContent(article);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '24px' }}>
      {/* Back button */}
      <Link href="/news" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', color: c.textMuted, fontSize: '14px' }}>
        <ArrowLeft style={{ width: '18px', height: '18px' }} />
        Kembali ke Berita
      </Link>

      {/* Article */}
      <div
        style={{
          backgroundColor: c.cardBg,
          borderRadius: '12px',
          border: `1px solid ${c.border}`,
          overflow: 'hidden',
        }}
      >
        {/* Header */}
        <div style={{ padding: isMobile ? '20px' : '32px', borderBottom: `1px solid ${c.borderLight}` }}>
          {/* Category badge */}
          <span
            style={{
              display: 'inline-block',
              padding: '4px 12px',
              borderRadius: '6px',
              backgroundColor: `${categoryInfo?.color || '#6B7280'}15`,
              color: categoryInfo?.color || '#6B7280',
              fontSize: '12px',
              fontWeight: '600',
              marginBottom: '12px',
            }}
          >
            {categoryInfo?.icon} {categoryInfo?.label || article.category}
          </span>

          <h1 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: '700', color: c.textPrimary, margin: '0 0 12px 0', lineHeight: '1.3' }}>
            {article.emoji} {article.title}
          </h1>

          <div style={{ display: 'flex', alignItems: 'center', gap: '16px', flexWrap: 'wrap' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <User style={{ width: '14px', height: '14px', color: c.textMuted }} />
              <span style={{ fontSize: '13px', color: c.textSecondary }}>{article.author}</span>
              <span style={{ fontSize: '12px', color: c.textLight, padding: '2px 6px', backgroundColor: c.cardBgHover, borderRadius: '4px' }}>
                {article.authorRole}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <Clock style={{ width: '14px', height: '14px', color: c.textMuted }} />
              <span style={{ fontSize: '13px', color: c.textMuted }}>
                {new Date(article.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
              </span>
            </div>
            <span style={{ fontSize: '13px', color: c.textMuted }}>
              {article.readTime} menit baca
            </span>
          </div>
        </div>

        {/* Content */}
        <div style={{ padding: isMobile ? '20px' : '32px' }}>
          <div style={{ fontSize: '15px', lineHeight: '1.8', color: c.textSecondary, whiteSpace: 'pre-line' }}>
            {fullContent}
          </div>

          {/* Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '24px', paddingTop: '20px', borderTop: `1px solid ${c.borderLight}` }}>
            <Tag style={{ width: '14px', height: '14px', color: c.textMuted }} />
            {article.tags.map(tag => (
              <span
                key={tag}
                style={{
                  fontSize: '12px',
                  padding: '4px 10px',
                  borderRadius: '6px',
                  backgroundColor: c.cardBgHover,
                  color: c.textMuted,
                }}
              >
                {tag}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Related articles */}
      {relatedArticles.length > 0 && (
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: c.textPrimary, margin: '0 0 16px 0' }}>
            Artikel Terkait
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: '16px',
            }}
          >
            {relatedArticles.map(related => (
              <Link key={related.id} href={`/news/${related.id}`} style={{ textDecoration: 'none' }}>
                <div
                  style={{
                    backgroundColor: c.cardBg,
                    borderRadius: '12px',
                    border: `1px solid ${c.border}`,
                    padding: '16px',
                    cursor: 'pointer',
                    height: '100%',
                  }}
                >
                  <span
                    style={{
                      fontSize: '11px',
                      fontWeight: '600',
                      color: categoryInfo?.color || '#6B7280',
                    }}
                  >
                    {categoryInfo?.icon} {categoryInfo?.label}
                  </span>
                  <h3 style={{ fontSize: '14px', fontWeight: '600', color: c.textPrimary, margin: '8px 0', lineHeight: '1.4', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {related.title}
                  </h3>
                  <p style={{ fontSize: '12px', color: c.textMuted, margin: 0 }}>
                    {new Date(related.publishedAt).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                    {' '}&middot; {related.readTime} menit baca
                  </p>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
