'use client';

import { useState, useMemo } from 'react';
import { Search, ChevronRight, X } from 'lucide-react';
import { newsArticles, newsCategories, type NewsCategory } from '@/data/mock-news';

function timeAgo(dateStr: string): string {
  const now = new Date();
  const date = new Date(dateStr);
  const diff = now.getTime() - date.getTime();
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);
  if (hours < 24) return `${hours} jam lalu`;
  if (days < 7) return `${days} hari lalu`;
  return date.toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' });
}

export default function NewsPage() {
  const [activeCategory, setActiveCategory] = useState<NewsCategory>('semua');
  const [searchQuery, setSearchQuery] = useState('');

  const featured = newsArticles.filter(a => a.isFeatured);

  const filteredArticles = useMemo(() => {
    let articles = newsArticles.filter(a => !a.isFeatured);

    if (activeCategory !== 'semua') {
      articles = articles.filter(a => a.category === activeCategory);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      articles = articles.filter(a =>
        a.title.toLowerCase().includes(q) ||
        a.excerpt.toLowerCase().includes(q) ||
        a.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    return articles;
  }, [activeCategory, searchQuery]);

  const getCatColor = (catId: string) => newsCategories.find(c => c.id === catId)?.color || '#6B7280';
  const getCatLabel = (catId: string) => newsCategories.find(c => c.id === catId)?.label || '';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '100%', overflow: 'hidden', boxSizing: 'border-box' }}>

      {/* HEADER */}
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: 0 }}>Berita</h1>
        <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '4px' }}>
          Informasi terkini seputar umrah, regulasi Saudi, dan update GEZMA
        </p>
      </div>

      {/* FEATURED / HEADLINE */}
      {activeCategory === 'semua' && !searchQuery && featured.length > 0 && (
        <div style={{ display: 'flex', gap: '16px', width: '100%' }}>
          {/* Main Featured */}
          <div
            style={{
              flex: 2, backgroundColor: '#111827', borderRadius: '16px', padding: '32px',
              display: 'flex', flexDirection: 'column', justifyContent: 'flex-end',
              minHeight: '280px', position: 'relative', overflow: 'hidden', cursor: 'pointer',
            }}
          >
            <div style={{ position: 'absolute', top: '20px', right: '20px', fontSize: '64px', opacity: 0.15 }}>
              {featured[0].imageEmoji}
            </div>
            {featured[0].isBreaking && (
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px', alignSelf: 'flex-start',
                backgroundColor: '#DC2626', color: 'white', fontSize: '11px', fontWeight: '700',
                padding: '4px 12px', borderRadius: '4px', marginBottom: '12px', textTransform: 'uppercase',
                letterSpacing: '0.05em',
              }}>
                BREAKING
              </span>
            )}
            <span style={{
              fontSize: '11px', fontWeight: '600', color: '#9CA3AF', textTransform: 'uppercase',
              marginBottom: '8px',
            }}>
              {getCatLabel(featured[0].category)}
            </span>
            <h2 style={{ fontSize: '22px', fontWeight: '700', color: 'white', margin: '0 0 10px 0', lineHeight: '1.3' }}>
              {featured[0].title}
            </h2>
            <p style={{ fontSize: '14px', color: '#9CA3AF', margin: '0 0 16px 0', lineHeight: '1.5', maxWidth: '90%' }}>
              {featured[0].excerpt.slice(0, 150)}...
            </p>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              <span style={{ fontSize: '12px', color: '#6B7280' }}>{featured[0].author}</span>
              <span style={{ fontSize: '12px', color: '#4B5563' }}>·</span>
              <span style={{ fontSize: '12px', color: '#6B7280' }}>{timeAgo(featured[0].publishedAt)}</span>
              <span style={{ fontSize: '12px', color: '#4B5563' }}>·</span>
              <span style={{ fontSize: '12px', color: '#6B7280' }}>{featured[0].readTime} baca</span>
            </div>
          </div>

          {/* Side Featured */}
          {featured[1] && (
            <div
              style={{
                flex: 1, backgroundColor: 'white', borderRadius: '16px', border: '1px solid #E5E7EB',
                padding: '24px', display: 'flex', flexDirection: 'column', cursor: 'pointer',
                justifyContent: 'space-between',
              }}
            >
              <div>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>{featured[1].imageEmoji}</div>
                <span style={{
                  fontSize: '11px', fontWeight: '600', padding: '3px 10px', borderRadius: '4px',
                  backgroundColor: getCatColor(featured[1].category) + '15',
                  color: getCatColor(featured[1].category),
                }}>
                  {getCatLabel(featured[1].category)}
                </span>
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '12px 0 8px 0', lineHeight: '1.4' }}>
                  {featured[1].title}
                </h3>
                <p style={{ fontSize: '13px', color: '#6B7280', margin: 0, lineHeight: '1.5' }}>
                  {featured[1].excerpt.slice(0, 120)}...
                </p>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '16px' }}>
                <span style={{ fontSize: '12px', color: '#6B7280' }}>{timeAgo(featured[1].publishedAt)}</span>
                <span style={{ fontSize: '12px', color: '#D1D5DB' }}>·</span>
                <span style={{ fontSize: '12px', color: '#6B7280' }}>{featured[1].readTime} baca</span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* CATEGORY + SEARCH */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
          {newsCategories.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id as NewsCategory)}
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: '6px',
                  padding: '7px 14px', borderRadius: '20px',
                  border: isActive ? `2px solid ${cat.color || '#374151'}` : '1px solid #E5E7EB',
                  backgroundColor: isActive ? (cat.color || '#374151') + '12' : 'white',
                  color: isActive ? (cat.color || '#374151') : '#4B5563',
                  fontSize: '13px', fontWeight: isActive ? '600' : '500',
                  cursor: 'pointer', whiteSpace: 'nowrap',
                }}
              >
                <span style={{ fontSize: '14px' }}>{cat.icon}</span>
                {cat.label}
              </button>
            );
          })}
        </div>

        <div style={{ position: 'relative', maxWidth: '400px' }}>
          <div style={{
            position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)',
            color: '#9CA3AF', pointerEvents: 'none', display: 'flex', alignItems: 'center',
          }}>
            <Search style={{ width: '16px', height: '16px' }} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari berita..."
            style={{
              width: '100%', height: '38px', paddingLeft: '40px',
              paddingRight: searchQuery ? '32px' : '12px',
              fontSize: '13px', border: '1px solid #D1D5DB', borderRadius: '8px',
              outline: 'none', backgroundColor: 'white', boxSizing: 'border-box',
            }}
          />
          {searchQuery && (
            <button onClick={() => setSearchQuery('')} style={{
              position: 'absolute', right: '8px', top: '50%', transform: 'translateY(-50%)',
              background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF',
              display: 'flex', alignItems: 'center',
            }}>
              <X style={{ width: '14px', height: '14px' }} />
            </button>
          )}
        </div>
      </div>

      {/* ARTICLE LIST */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
        {filteredArticles.length === 0 ? (
          <div style={{ padding: '48px', textAlign: 'center', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
            <p style={{ fontSize: '14px', color: '#9CA3AF' }}>Tidak ada berita ditemukan</p>
          </div>
        ) : (
          filteredArticles.map((article) => (
            <div
              key={article.id}
              style={{
                display: 'flex', gap: '16px', padding: '20px',
                backgroundColor: article.category === 'peringatan' ? '#FFF7ED' : 'white',
                borderRadius: '12px',
                border: article.category === 'peringatan' ? '1px solid #FED7AA' : '1px solid #E5E7EB',
                cursor: 'pointer', transition: 'all 0.15s',
              }}
              onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)'; }}
              onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; }}
            >
              {/* Emoji Thumbnail */}
              <div style={{
                width: '64px', height: '64px', borderRadius: '12px', backgroundColor: '#F3F4F6',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '32px', flexShrink: 0,
              }}>
                {article.imageEmoji}
              </div>

              {/* Content */}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', flexWrap: 'wrap' }}>
                  <span style={{
                    fontSize: '11px', fontWeight: '600', padding: '2px 8px', borderRadius: '4px',
                    backgroundColor: getCatColor(article.category) + '15',
                    color: getCatColor(article.category),
                  }}>
                    {getCatLabel(article.category)}
                  </span>
                  <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{timeAgo(article.publishedAt)}</span>
                  <span style={{ fontSize: '11px', color: '#D1D5DB' }}>·</span>
                  <span style={{ fontSize: '11px', color: '#9CA3AF' }}>{article.readTime} baca</span>
                </div>

                <h3 style={{
                  fontSize: '15px', fontWeight: '600', color: '#111827', margin: '0 0 6px 0',
                  overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                }}>
                  {article.title}
                </h3>
                <p style={{
                  fontSize: '13px', color: '#6B7280', margin: '0 0 8px 0', lineHeight: '1.4',
                  display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden',
                }}>
                  {article.excerpt}
                </p>

                <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexWrap: 'wrap' }}>
                  <span style={{ fontSize: '12px', fontWeight: '500', color: '#374151' }}>{article.author}</span>
                  {article.authorRole === 'Official' && (
                    <span style={{
                      fontSize: '9px', fontWeight: '700', padding: '1px 5px', borderRadius: '3px',
                      backgroundColor: '#DC2626', color: 'white', textTransform: 'uppercase',
                    }}>
                      Official
                    </span>
                  )}
                  {article.tags.slice(0, 2).map(tag => (
                    <span key={tag} style={{ fontSize: '10px', color: '#9CA3AF' }}>#{tag}</span>
                  ))}
                </div>
              </div>

              {/* Arrow */}
              <div style={{ display: 'flex', alignItems: 'center', flexShrink: 0 }}>
                <ChevronRight style={{ width: '16px', height: '16px', color: '#D1D5DB' }} />
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
