'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { PageHeader } from '@/components/layout/page-header';
import { useLanguage } from '@/lib/i18n';
import {
  newsCategories,
  type NewsArticle,
  type NewsCategory,
} from '@/data/mock-news';

// Category color mapping
const categoryColorMap: Record<string, string> = {
  regulasi: '#2563EB',
  pengumuman: '#7C3AED',
  event: '#059669',
  tips: '#D97706',
  peringatan: '#DC2626',
};

function getCategoryBgColor(category: string): string {
  const map: Record<string, string> = {
    regulasi: '#EFF6FF',
    pengumuman: '#F5F3FF',
    event: '#ECFDF5',
    tips: '#FFFBEB',
    peringatan: '#FEF2F2',
  };
  return map[category] || '#F3F4F6';
}

function getEmojiBgColor(category: string): string {
  const map: Record<string, string> = {
    regulasi: '#DBEAFE',
    pengumuman: '#EDE9FE',
    event: '#D1FAE5',
    tips: '#FEF3C7',
    peringatan: '#FEE2E2',
  };
  return map[category] || '#E5E7EB';
}

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diffMs = now.getTime() - date.getTime();
  const diffMins = Math.floor(diffMs / 60000);
  const diffHours = Math.floor(diffMs / 3600000);
  const diffDays = Math.floor(diffMs / 86400000);

  if (diffMins < 1) return 'just now';
  if (diffMins < 60) return `${diffMins} minutes ago`;
  if (diffHours < 24) return `${diffHours} hours ago`;
  if (diffDays < 7) return `${diffDays} days ago`;
  if (diffDays < 30) return `${Math.floor(diffDays / 7)} weeks ago`;
  return `${Math.floor(diffDays / 30)} months ago`;
}

function getCategoryLabel(category: string): string {
  const cat = newsCategories.find((c) => c.id === category);
  return cat ? `${cat.icon} ${cat.label}` : category;
}

// Breaking news pulse keyframes (injected once)
const pulseKeyframes = `
@keyframes pulse-red {
  0%, 100% { opacity: 1; }
  50% { opacity: 0.6; }
}
`;

export default function NewsPage() {
  const { c } = useTheme();
  const { isMobile, isTablet } = useResponsive();
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<NewsCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [articles, setArticles] = useState<NewsArticle[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchArticles = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory !== 'all') params.set('category', activeCategory);
      if (searchQuery) params.set('search', searchQuery);
      const res = await fetch(`/api/news?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setArticles(json.data || []);
      }
    } catch (err) {
      console.error('Failed to fetch news articles:', err);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, searchQuery]);

  useEffect(() => {
    fetchArticles();
  }, [fetchArticles]);

  // Featured articles (from fetched articles that have isFeatured: true)
  const featuredArticles = articles.filter((a) => a.isFeatured);
  const mainFeatured = featuredArticles[0];
  const sideFeatured = featuredArticles[1];

  // Non-featured articles
  const regularArticles = articles.filter((a) => !a.isFeatured);
  // If a category is active or search is active, show featured ones too if they match
  const displayArticles =
    activeCategory !== 'all' || searchQuery
      ? articles
      : regularArticles;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <style dangerouslySetInnerHTML={{ __html: pulseKeyframes }} />

      <PageHeader
        title={t.news.title}
        description={t.news.description}
      />

      {/* Featured Section - only show when no filter/search active */}
      {activeCategory === 'all' && !searchQuery && mainFeatured && (
        <div
          style={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            gap: '16px',
          }}
        >
          {/* Main Featured */}
          <FeaturedCard
            article={mainFeatured}
            isMain
            c={c}
            isMobile={isMobile}
            t={t}
          />
          {/* Side Featured */}
          {sideFeatured && (
            <FeaturedCard
              article={sideFeatured}
              isMain={false}
              c={c}
              isMobile={isMobile}
              t={t}
            />
          )}
        </div>
      )}

      {/* Search + Category Filters */}
      <div
        style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '16px',
          alignItems: isMobile ? 'stretch' : 'center',
        }}
      >
        {/* Search Bar */}
        <div style={{ position: 'relative', flex: isMobile ? undefined : '0 0 300px' }}>
          <span
            style={{
              position: 'absolute',
              left: '12px',
              top: '50%',
              transform: 'translateY(-50%)',
              fontSize: '16px',
              color: c.textMuted,
              pointerEvents: 'none',
            }}
          >
            🔍
          </span>
          <input
            type="text"
            placeholder={t.news.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 40px',
              minHeight: '46px',
              borderRadius: '10px',
              border: `1px solid ${c.border}`,
              backgroundColor: c.inputBg,
              color: c.textPrimary,
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box' as const,
            }}
          />
        </div>

        {/* Category Pills */}
        <div
          style={{
            display: 'flex',
            gap: '8px',
            overflowX: 'auto',
            flex: 1,
            paddingBottom: '4px',
            WebkitOverflowScrolling: 'touch' as const,
          }}
        >
          {newsCategories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                style={{
                  padding: '10px 16px',
                  minHeight: '44px',
                  borderRadius: '20px',
                  border: `1px solid ${isActive ? cat.color : c.border}`,
                  backgroundColor: isActive ? cat.color : c.cardBg,
                  color: isActive ? '#FFFFFF' : c.textSecondary,
                  fontSize: '13px',
                  fontWeight: isActive ? 600 : 400,
                  cursor: 'pointer',
                  whiteSpace: 'nowrap',
                  flexShrink: 0,
                  transition: 'all 0.2s ease',
                }}
              >
                {cat.icon} {cat.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Results count */}
      <div style={{ color: c.textMuted, fontSize: '13px' }}>
        {displayArticles.length} {t.news.articlesFound}
        {activeCategory !== 'all' &&
          ` ${t.news.inCategory} ${newsCategories.find((c) => c.id === activeCategory)?.label}`}
        {searchQuery && ` ${t.common.for} "${searchQuery}"`}
      </div>

      {/* Article List */}
      {displayArticles.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            color: c.textMuted,
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '16px' }}>📭</div>
          <div style={{ fontSize: '16px', fontWeight: 500 }}>
            {t.news.emptyTitle}
          </div>
          <div style={{ fontSize: '14px', marginTop: '8px' }}>
            {t.news.emptyDesc}
          </div>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile
              ? '1fr'
              : isTablet
                ? 'repeat(2, 1fr)'
                : 'repeat(3, 1fr)',
            gap: '16px',
          }}
        >
          {displayArticles.map((article) => (
            <ArticleCard
              key={article.id}
              article={article}
              c={c}
              t={t}
            />
          ))}
        </div>
      )}
    </div>
  );
}

/* ============ Featured Card ============ */
function FeaturedCard({
  article,
  isMain,
  c,
  isMobile,
  t,
}: {
  article: NewsArticle;
  isMain: boolean;
  c: ReturnType<typeof useTheme>['c'];
  isMobile: boolean;
  t: ReturnType<typeof useLanguage>['t'];
}) {
  const catColor = categoryColorMap[article.category] || '#6B7280';

  return (
    <div
      style={{
        flex: isMain ? 2 : 1,
        backgroundColor: c.cardBg,
        borderRadius: '16px',
        border: `1px solid ${c.border}`,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        position: 'relative',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Hero Image Area */}
      <div
        style={{
          height: isMain ? (isMobile ? '160px' : '200px') : (isMobile ? '140px' : '160px'),
          background: article.imageUrl ? 'none' : `linear-gradient(135deg, ${catColor}22 0%, ${catColor}11 100%)`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {article.imageUrl ? (
          <img
            src={article.imageUrl}
            alt={article.title}
            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
          />
        ) : (
          <span style={{ fontSize: isMain ? '72px' : '56px' }}>
            {article.emoji}
          </span>
        )}

        {/* Breaking Badge */}
        {article.isBreaking && (
          <span
            style={{
              position: 'absolute',
              top: '12px',
              left: '12px',
              backgroundColor: '#DC2626',
              color: '#FFFFFF',
              padding: '4px 12px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 700,
              letterSpacing: '0.5px',
              textTransform: 'uppercase',
              animation: 'pulse-red 1.5s ease-in-out infinite',
            }}
          >
            {t.news.badgeBreaking}
          </span>
        )}

        {/* Official Badge */}
        {article.isOfficial && (
          <span
            style={{
              position: 'absolute',
              top: '12px',
              right: '12px',
              backgroundColor: '#2563EB',
              color: '#FFFFFF',
              padding: '4px 10px',
              borderRadius: '6px',
              fontSize: '11px',
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            ✓ {t.news.badgeOfficial}
          </span>
        )}
      </div>

      {/* Content */}
      <div style={{ padding: isMain ? '20px 24px 24px' : '16px 20px 20px' }}>
        {/* Category Badge */}
        <span
          style={{
            display: 'inline-block',
            padding: '4px 10px',
            borderRadius: '6px',
            backgroundColor: getCategoryBgColor(article.category),
            color: catColor,
            fontSize: '12px',
            fontWeight: 600,
            marginBottom: '10px',
          }}
        >
          {getCategoryLabel(article.category)}
        </span>

        <h2
          style={{
            fontSize: isMain ? '20px' : '16px',
            fontWeight: 700,
            color: c.textPrimary,
            lineHeight: 1.35,
            margin: '0 0 8px 0',
            display: '-webkit-box',
            WebkitLineClamp: 3,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {article.title}
        </h2>

        <p
          style={{
            fontSize: '14px',
            color: c.textMuted,
            lineHeight: 1.5,
            margin: '0 0 16px 0',
            display: '-webkit-box',
            WebkitLineClamp: isMain ? 3 : 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {article.excerpt}
        </p>

        {/* Meta */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            fontSize: '12px',
            color: c.textLight,
          }}
        >
          <span>{article.author}</span>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <span>{timeAgo(article.publishedAt)}</span>
            <span
              style={{
                backgroundColor: c.inputBg,
                padding: '2px 8px',
                borderRadius: '4px',
                fontSize: '11px',
              }}
            >
              {article.readTime} {t.news.readTime}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ============ Article Card ============ */
function ArticleCard({
  article,
  c,
  t,
}: {
  article: NewsArticle;
  c: ReturnType<typeof useTheme>['c'];
  t: ReturnType<typeof useLanguage>['t'];
}) {
  const catColor = categoryColorMap[article.category] || '#6B7280';

  return (
    <div
      style={{
        backgroundColor: c.cardBg,
        borderRadius: '12px',
        border: `1px solid ${c.border}`,
        overflow: 'hidden',
        cursor: 'pointer',
        transition: 'all 0.3s ease',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
        e.currentTarget.style.transform = 'translateY(-2px)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = 'none';
        e.currentTarget.style.transform = 'translateY(0)';
      }}
    >
      {/* Top section with emoji and badges */}
      <div
        style={{
          padding: '20px 20px 0',
          display: 'flex',
          alignItems: 'flex-start',
          gap: '14px',
        }}
      >
        {/* Article Thumbnail */}
        {article.imageUrl ? (
          <img
            src={article.imageUrl}
            alt={article.title}
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              objectFit: 'cover',
              flexShrink: 0,
            }}
          />
        ) : (
          <div
            style={{
              width: '52px',
              height: '52px',
              borderRadius: '50%',
              backgroundColor: getEmojiBgColor(article.category),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
            }}
          >
            <span style={{ fontSize: '26px' }}>{article.emoji}</span>
          </div>
        )}

        <div style={{ flex: 1, minWidth: 0 }}>
          {/* Badges Row */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              flexWrap: 'wrap',
              marginBottom: '6px',
            }}
          >
            {/* Category Badge */}
            <span
              style={{
                display: 'inline-block',
                padding: '3px 8px',
                borderRadius: '6px',
                backgroundColor: getCategoryBgColor(article.category),
                color: catColor,
                fontSize: '11px',
                fontWeight: 600,
              }}
            >
              {getCategoryLabel(article.category)}
            </span>

            {/* Breaking Badge */}
            {article.isBreaking && (
              <span
                style={{
                  backgroundColor: '#DC2626',
                  color: '#FFFFFF',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '10px',
                  fontWeight: 700,
                  letterSpacing: '0.5px',
                  textTransform: 'uppercase',
                  animation: 'pulse-red 1.5s ease-in-out infinite',
                }}
              >
                {t.news.badgeBreaking}
              </span>
            )}

            {/* Official Badge */}
            {article.isOfficial && (
              <span
                style={{
                  backgroundColor: '#2563EB',
                  color: '#FFFFFF',
                  padding: '3px 8px',
                  borderRadius: '6px',
                  fontSize: '10px',
                  fontWeight: 600,
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '3px',
                }}
              >
                ✓ {t.news.badgeOfficial}
              </span>
            )}
          </div>

          {/* Title */}
          <h3
            style={{
              fontSize: '15px',
              fontWeight: 600,
              color: c.textPrimary,
              lineHeight: 1.4,
              margin: 0,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {article.title}
          </h3>
        </div>
      </div>

      {/* Excerpt */}
      <div style={{ padding: '10px 20px 0' }}>
        <p
          style={{
            fontSize: '13px',
            color: c.textMuted,
            lineHeight: 1.55,
            margin: 0,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {article.excerpt}
        </p>
      </div>

      {/* Footer Meta */}
      <div
        style={{
          padding: '14px 20px 16px',
          marginTop: 'auto',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '12px',
          color: c.textLight,
        }}
      >
        <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: '45%' }}>
          {article.author}
        </span>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span>{timeAgo(article.publishedAt)}</span>
          <span
            style={{
              backgroundColor: c.inputBg,
              padding: '2px 8px',
              borderRadius: '4px',
              fontSize: '11px',
            }}
          >
            {article.readTime} {t.news.readTime}
          </span>
        </div>
      </div>
    </div>
  );
}
