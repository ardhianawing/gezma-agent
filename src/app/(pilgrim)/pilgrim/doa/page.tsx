'use client';

import { useState, useMemo, useEffect, useCallback } from 'react';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { doaCategories, DoaCategory } from '@/data/mock-doa';
import type { Doa } from '@/data/mock-doa';
import { useLanguage } from '@/lib/i18n';

const GREEN = '#059669';
const GREEN_LIGHT = '#ECFDF5';
const GREEN_DARK = '#047857';

export default function DoaPage() {
  const { c } = useTheme();
  const { isMobile } = useResponsive();
  const { t } = useLanguage();
  const [activeCategory, setActiveCategory] = useState<DoaCategory>('all');
  const [selectedDoa, setSelectedDoa] = useState<Doa | null>(null);
  const [favoriteIds, setFavoriteIds] = useState<Set<string>>(new Set());
  const [searchQuery, setSearchQuery] = useState('');
  const [doas, setDoas] = useState<Doa[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch('/api/pilgrim-portal/doa', { credentials: 'same-origin' })
      .then(res => res.ok ? res.json() : null)
      .then(json => {
        if (json) {
          setDoas(json.doas.map((d: Doa) => ({ ...d, isFavorite: false })));
          setFavoriteIds(new Set(json.favoriteIds));
        }
      })
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, []);

  const filteredDoas = useMemo(() => {
    let list = doas;
    if (activeCategory !== 'all') {
      list = list.filter(d => d.category === activeCategory);
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(d =>
        d.title.toLowerCase().includes(q) ||
        d.translation.toLowerCase().includes(q) ||
        d.occasion.toLowerCase().includes(q)
      );
    }
    return list;
  }, [activeCategory, searchQuery, doas]);

  const toggleFavorite = useCallback((id: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    setFavoriteIds(prev => {
      const next = new Set(prev);
      const willFavorite = !next.has(id);
      if (willFavorite) next.add(id);
      else next.delete(id);

      fetch('/api/pilgrim-portal/doa/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify({ doaId: id, favorite: willFavorite }),
      }).catch(() => {});

      return next;
    });
  }, []);

  const cardStyle: React.CSSProperties = {
    backgroundColor: c.cardBg,
    border: '1px solid ' + c.border,
    borderRadius: '16px',
    padding: '20px',
    overflow: 'hidden',
  };

  if (isLoading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '300px',
        color: c.textMuted,
        fontSize: '15px',
      }}>
        {t.common.loadingData}
      </div>
    );
  }

  // Detail view
  if (selectedDoa) {
    const currentIndex = doas.findIndex(d => d.id === selectedDoa.id);
    const hasPrev = currentIndex > 0;
    const hasNext = currentIndex < doas.length - 1;
    const isFav = favoriteIds.has(selectedDoa.id);
    const catInfo = doaCategories.find(cat => cat.id === selectedDoa.category);

    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '80px', overflow: 'hidden', maxWidth: '100%' }}>
        {/* Back button */}
        <button
          onClick={() => setSelectedDoa(null)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            backgroundColor: 'transparent',
            border: '1px solid ' + c.border,
            borderRadius: '10px',
            cursor: 'pointer',
            fontSize: '13px',
            fontWeight: 500,
            color: c.textSecondary,
            alignSelf: 'flex-start',
          }}
        >
          {'\u2190'} {t.common.back}
        </button>

        <div style={cardStyle}>
          {/* Header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <span style={{ fontSize: '28px' }}>{selectedDoa.emoji}</span>
              <div>
                <h1 style={{
                  fontSize: isMobile ? '18px' : '22px',
                  fontWeight: 700,
                  color: c.textPrimary,
                  margin: 0,
                  lineHeight: 1.3,
                }}>
                  {selectedDoa.title}
                </h1>
                <span style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '2px 10px',
                  borderRadius: '10px',
                  fontSize: '11px',
                  fontWeight: 600,
                  backgroundColor: (catInfo?.color || GREEN) + '15',
                  color: catInfo?.color || GREEN,
                  marginTop: '4px',
                }}>
                  {catInfo?.icon} {catInfo?.label}
                </span>
              </div>
            </div>
            <button
              onClick={() => toggleFavorite(selectedDoa.id)}
              style={{
                padding: '8px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                fontSize: '24px',
              }}
            >
              {isFav ? '❤️' : '🤍'}
            </button>
          </div>

          {/* Arabic text */}
          <div style={{
            backgroundColor: GREEN_LIGHT,
            borderRadius: '12px',
            padding: '24px 20px',
            marginBottom: '16px',
            textAlign: 'center',
            direction: 'rtl',
            overflow: 'hidden',
            wordBreak: 'break-word',
          }}>
            <p style={{
              fontSize: isMobile ? '22px' : '28px',
              fontWeight: 400,
              color: c.textPrimary,
              lineHeight: 2.2,
              margin: 0,
              fontFamily: '"Amiri", "Traditional Arabic", "Arabic Typesetting", serif',
            }}>
              {selectedDoa.arabic}
            </p>
          </div>

          {/* Latin */}
          <div style={{ marginBottom: '16px' }}>
            <p style={{
              fontSize: '11px',
              fontWeight: 600,
              color: c.textMuted,
              margin: '0 0 6px 0',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Bacaan Latin
            </p>
            <p style={{
              fontSize: '14px',
              color: c.textSecondary,
              margin: 0,
              lineHeight: 1.7,
              fontStyle: 'italic',
            }}>
              {selectedDoa.latin}
            </p>
          </div>

          {/* Translation */}
          <div style={{ marginBottom: '16px' }}>
            <p style={{
              fontSize: '11px',
              fontWeight: 600,
              color: c.textMuted,
              margin: '0 0 6px 0',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              Terjemahan
            </p>
            <p style={{
              fontSize: '14px',
              color: c.textPrimary,
              margin: 0,
              lineHeight: 1.7,
              fontWeight: 500,
            }}>
              &ldquo;{selectedDoa.translation}&rdquo;
            </p>
          </div>

          {/* Occasion */}
          <div style={{
            padding: '12px 16px',
            backgroundColor: c.pageBg,
            borderRadius: '10px',
            border: '1px solid ' + c.borderLight,
            marginBottom: '12px',
          }}>
            <p style={{
              fontSize: '11px',
              fontWeight: 600,
              color: c.textMuted,
              margin: '0 0 4px 0',
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
            }}>
              📌 Waktu Membaca
            </p>
            <p style={{ fontSize: '13px', color: c.textSecondary, margin: 0, lineHeight: 1.5 }}>
              {selectedDoa.occasion}
            </p>
          </div>

          {/* Source */}
          <p style={{ fontSize: '12px', color: c.textLight, margin: 0, textAlign: 'right' }}>
            📖 {selectedDoa.source}
          </p>
        </div>

        {/* Navigation */}
        <div style={{ display: 'flex', gap: '12px' }}>
          <button
            onClick={() => { if (hasPrev) setSelectedDoa(doas[currentIndex - 1]); }}
            disabled={!hasPrev}
            style={{
              flex: 1,
              padding: '12px',
              fontSize: '13px',
              fontWeight: 600,
              color: hasPrev ? c.textSecondary : c.textLight,
              backgroundColor: c.cardBg,
              border: '1px solid ' + c.border,
              borderRadius: '10px',
              cursor: hasPrev ? 'pointer' : 'not-allowed',
            }}
          >
            {'\u2190'} {t.common.previous}
          </button>
          <button
            onClick={() => { if (hasNext) setSelectedDoa(doas[currentIndex + 1]); }}
            disabled={!hasNext}
            style={{
              flex: 1,
              padding: '12px',
              fontSize: '13px',
              fontWeight: 600,
              color: hasNext ? c.textSecondary : c.textLight,
              backgroundColor: c.cardBg,
              border: '1px solid ' + c.border,
              borderRadius: '10px',
              cursor: hasNext ? 'pointer' : 'not-allowed',
            }}
          >
            {t.common.next} {'\u2192'}
          </button>
        </div>
      </div>
    );
  }

  // List view
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', paddingBottom: '80px', overflow: 'hidden', maxWidth: '100%' }}>
      {/* Header */}
      <div>
        <h1 style={{
          fontSize: isMobile ? '22px' : '26px',
          fontWeight: 700,
          color: c.textPrimary,
          margin: '0 0 4px 0',
        }}>
          {'\u{1F932}'} {t.doa.title}
        </h1>
        <p style={{ fontSize: '14px', color: c.textMuted, margin: 0 }}>
          {t.doa.title}
        </p>
      </div>

      {/* Search */}
      <input
        type="text"
        value={searchQuery}
        onChange={(e) => setSearchQuery(e.target.value)}
        placeholder={t.doa.searchPlaceholder}
        style={{
          width: '100%',
          padding: '12px 16px',
          fontSize: '14px',
          color: c.textPrimary,
          backgroundColor: c.cardBg,
          border: '1px solid ' + c.border,
          borderRadius: '12px',
          outline: 'none',
          boxSizing: 'border-box',
        }}
        onFocus={(e) => { e.target.style.borderColor = GREEN; }}
        onBlur={(e) => { e.target.style.borderColor = c.border; }}
      />

      {/* Category pills */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '4px',
        scrollbarWidth: 'none',
      }}>
        {doaCategories.map(cat => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                borderRadius: '20px',
                border: isActive ? 'none' : '1px solid ' + c.border,
                backgroundColor: isActive ? cat.color : c.cardBg,
                color: isActive ? '#FFFFFF' : c.textSecondary,
                fontSize: '13px',
                fontWeight: isActive ? 600 : 400,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              <span>{cat.icon}</span>
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Favorites section */}
      {favoriteIds.size > 0 && activeCategory === 'all' && !searchQuery && (
        <div>
          <h2 style={{ fontSize: '14px', fontWeight: 600, color: c.textMuted, margin: '0 0 10px 0' }}>
            ❤️ Favorit ({favoriteIds.size})
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {doas.filter(d => favoriteIds.has(d.id)).map(doa => (
              <div
                key={doa.id}
                onClick={() => setSelectedDoa(doa)}
                style={{
                  ...cardStyle,
                  cursor: 'pointer',
                  padding: '14px 16px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '12px',
                  borderLeft: '4px solid ' + GREEN,
                }}
              >
                <span style={{ fontSize: '20px' }}>{doa.emoji}</span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '14px', fontWeight: 600, color: c.textPrimary, margin: 0 }}>
                    {doa.title}
                  </p>
                  <p style={{
                    fontSize: '12px',
                    color: c.textMuted,
                    margin: '2px 0 0 0',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                  }}>
                    {doa.occasion}
                  </p>
                </div>
                <span style={{ fontSize: '14px', flexShrink: 0 }}>❤️</span>
              </div>
            ))}
          </div>
          <div style={{ height: '8px' }} />
        </div>
      )}

      {/* Doa list */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
        {filteredDoas.map(doa => {
          const isFav = favoriteIds.has(doa.id);
          const catInfo = doaCategories.find(cat => cat.id === doa.category);
          return (
            <div
              key={doa.id}
              onClick={() => setSelectedDoa(doa)}
              style={{
                ...cardStyle,
                cursor: 'pointer',
                transition: 'all 0.2s ease',
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
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
                <span style={{ fontSize: '28px', lineHeight: 1, flexShrink: 0, marginTop: '2px' }}>
                  {doa.emoji}
                </span>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
                    <h3 style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: c.textPrimary,
                      margin: 0,
                      flex: 1,
                    }}>
                      {doa.title}
                    </h3>
                    <button
                      onClick={(e) => toggleFavorite(doa.id, e)}
                      style={{
                        padding: '4px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        cursor: 'pointer',
                        fontSize: '16px',
                        flexShrink: 0,
                      }}
                    >
                      {isFav ? '❤️' : '🤍'}
                    </button>
                  </div>

                  {/* Preview of Arabic */}
                  <p style={{
                    fontSize: '16px',
                    color: c.textSecondary,
                    margin: '4px 0 0 0',
                    textAlign: 'right',
                    fontFamily: '"Amiri", "Traditional Arabic", serif',
                    lineHeight: 1.8,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                    maxWidth: '100%',
                    wordBreak: 'break-word',
                  }}>
                    {doa.arabic}
                  </p>

                  {/* Latin preview */}
                  <p style={{
                    fontSize: '12px',
                    color: c.textMuted,
                    margin: '4px 0 6px 0',
                    fontStyle: 'italic',
                    lineHeight: 1.5,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}>
                    {doa.latin}
                  </p>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 600,
                      padding: '2px 8px',
                      borderRadius: '10px',
                      backgroundColor: (catInfo?.color || GREEN) + '15',
                      color: catInfo?.color || GREEN,
                    }}>
                      {catInfo?.label}
                    </span>
                    <span style={{ fontSize: '11px', color: c.textLight }}>
                      📖 {doa.source}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredDoas.length === 0 && (
        <div style={{ textAlign: 'center', padding: '40px 20px', color: c.textMuted }}>
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>🤲</span>
          <p style={{ fontSize: '14px', margin: 0 }}>
            {searchQuery ? t.common.noData : t.common.noData}
          </p>
        </div>
      )}
    </div>
  );
}
