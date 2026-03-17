'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { useLanguage } from '@/lib/i18n';
import { marketCategories, MarketCategory, MarketItem } from '@/data/mock-marketplace';

type SortBy = 'price_asc' | 'rating' | 'popular';
type CityFilter = 'all' | 'Makkah' | 'Madinah';
type MinRating = 0 | 3 | 4 | 5;

const badgeColors: Record<string, { bg: string; text: string }> = {
  'Best Seller': { bg: '#f97316', text: '#fff' },
  Premium: { bg: '#9333ea', text: '#fff' },
  Popular: { bg: '#3b82f6', text: '#fff' },
  New: { bg: '#22c55e', text: '#fff' },
};

function StarRating({ rating }: { rating: number }) {
  const full = Math.floor(rating);
  const half = rating - full >= 0.3;
  const stars: string[] = [];
  for (let i = 0; i < 5; i++) {
    if (i < full) stars.push('\u2605');
    else if (i === full && half) stars.push('\u2605');
    else stars.push('\u2606');
  }
  return <span style={{ color: '#F59E0B', letterSpacing: '1px' }}>{stars.join('')}</span>;
}

function MarketCard({
  item,
  c,
  isHovered,
  onHover,
  onLeave,
  t,
}: {
  item: MarketItem;
  c: Record<string, string>;
  isHovered: boolean;
  onHover: () => void;
  onLeave: () => void;
  t: ReturnType<typeof useLanguage>['t'];
}) {
  const badge = item.badge ? badgeColors[item.badge] : null;
  const detailEntries = Object.entries(item.details).slice(0, 3);

  return (
    <div
      onMouseEnter={onHover}
      onMouseLeave={onLeave}
      style={{
        backgroundColor: c.cardBg,
        border: '1px solid ' + c.border,
        borderRadius: '16px',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        cursor: 'pointer',
        transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
        boxShadow: isHovered ? '0 8px 24px rgba(0,0,0,0.12)' : '0 1px 3px rgba(0,0,0,0.04)',
        position: 'relative',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      {/* Badge Ribbon */}
      {badge && (
        <div
          style={{
            position: 'absolute',
            top: '12px',
            right: '0',
            backgroundColor: badge.bg,
            color: badge.text,
            padding: '3px 12px 3px 10px',
            fontSize: '11px',
            fontWeight: 700,
            borderRadius: '4px 0 0 4px',
            zIndex: 1,
          }}
        >
          {item.badge}
        </div>
      )}

      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1 }}>
        {/* Emoji + Vendor + Name */}
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px', marginBottom: '10px' }}>
          {item.imageUrl ? (
            <img loading="lazy"
              src={item.imageUrl}
              alt={item.name}
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                objectFit: 'cover',
                flexShrink: 0,
              }}
            />
          ) : (
            <div
              style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: c.primaryLight,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '24px',
                flexShrink: 0,
              }}
            >
              {item.emoji}
            </div>
          )}
          <div style={{ flex: 1, minWidth: 0 }}>
            <p
              style={{
                fontSize: '11px',
                color: c.textMuted,
                margin: '0 0 2px',
                fontWeight: 500,
                textTransform: 'uppercase',
                letterSpacing: '0.3px',
              }}
            >
              {item.vendor}
            </p>
            <h3
              style={{
                fontSize: '15px',
                fontWeight: 700,
                color: c.textPrimary,
                margin: 0,
                lineHeight: '1.3',
                paddingRight: item.badge ? '70px' : '0',
              }}
            >
              {item.name}
            </h3>
          </div>
        </div>

        {/* Rating */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '10px' }}>
          <StarRating rating={item.rating} />
          <span style={{ fontSize: '13px', fontWeight: 600, color: c.textPrimary }}>{item.rating}</span>
          <span style={{ fontSize: '12px', color: c.textMuted }}>({item.reviewCount} {t.marketplace.reviews})</span>
        </div>

        {/* Tags */}
        <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', marginBottom: '12px' }}>
          {item.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              style={{
                padding: '2px 8px',
                borderRadius: '6px',
                backgroundColor: c.pageBg,
                border: '1px solid ' + c.borderLight,
                fontSize: '11px',
                color: c.textSecondary,
                fontWeight: 500,
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Details */}
        <div style={{ marginBottom: '14px', flex: 1 }}>
          {detailEntries.map(([key, value]) => (
            <div
              key={key}
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                padding: '4px 0',
                borderBottom: '1px solid ' + c.borderLight,
              }}
            >
              <span style={{ fontSize: '12px', color: c.textMuted }}>{key}</span>
              <span style={{ fontSize: '12px', color: c.textPrimary, fontWeight: 500 }}>{value}</span>
            </div>
          ))}
        </div>

        {/* Price + CTA */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            paddingTop: '12px',
            borderTop: '1px solid ' + c.borderLight,
          }}
        >
          <div>
            <span style={{ fontSize: '17px', fontWeight: 700, color: c.primary }}>{item.price}</span>
            <span style={{ fontSize: '12px', color: c.textMuted, marginLeft: '2px' }}>{item.priceUnit}</span>
          </div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              alert(t.marketplace.orderAlert);
            }}
            style={{
              padding: '10px 20px',
              minHeight: '44px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: c.primary,
              color: '#fff',
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background-color 0.15s ease',
              whiteSpace: 'nowrap',
            }}
            onMouseEnter={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = c.primaryHover;
            }}
            onMouseLeave={(e) => {
              (e.target as HTMLButtonElement).style.backgroundColor = c.primary;
            }}
          >
            {t.marketplace.orderBtn}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function MarketplacePage() {
  const { c } = useTheme();
  const { isMobile, isTablet } = useResponsive();
  const { t } = useLanguage();

  const [activeCategory, setActiveCategory] = useState<MarketCategory>('hotel');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('popular');
  const [cityFilter, setCityFilter] = useState<CityFilter>('all');
  const [minRating, setMinRating] = useState<MinRating>(0);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [items, setItems] = useState<MarketItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchItems = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      params.set('category', activeCategory);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());
      params.set('sort', sortBy);
      if (activeCategory === 'hotel' && cityFilter !== 'all') params.set('city', cityFilter);
      if (activeCategory === 'hotel' && minRating > 0) params.set('minRating', String(minRating));

      const res = await fetch(`/api/marketplace?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setItems(json.data || json);
      }
    } catch (error) {
      console.error('Failed to fetch marketplace items:', error);
    } finally {
      setLoading(false);
    }
  }, [activeCategory, searchQuery, sortBy, cityFilter, minRating]);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  const filteredItems = items;

  const gridColumns = isMobile ? 1 : isTablet ? 2 : 3;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <PageHeader
        title={t.marketplace.title}
        description={t.marketplace.description}
      />

      {/* Category Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          overflowX: 'auto',
          paddingBottom: '8px',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        {marketCategories.map((cat) => {
          const isActive = activeCategory === cat.key;
          return (
            <button
              key={cat.key}
              onClick={() => {
                setActiveCategory(cat.key);
                setCityFilter('all');
                setMinRating(0);
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '10px 16px',
                minHeight: '44px',
                borderRadius: '24px',
                border: isActive ? '2px solid ' + c.primary : '1px solid ' + c.border,
                backgroundColor: isActive ? c.primaryLight : c.cardBg,
                color: isActive ? c.primary : c.textSecondary,
                fontWeight: isActive ? 600 : 400,
                fontSize: '14px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
              }}
            >
              <span style={{ fontSize: '16px' }}>{cat.emoji}</span>
              <span>{cat.label}</span>
              <span
                style={{
                  backgroundColor: isActive ? c.primary : c.borderLight,
                  color: isActive ? '#fff' : c.textMuted,
                  borderRadius: '10px',
                  padding: '1px 7px',
                  fontSize: '11px',
                  fontWeight: 600,
                }}
              >
                {cat.count}
              </span>
            </button>
          );
        })}
      </div>

      {/* Search + Sort Row */}
      <div
        style={{
          display: 'flex',
          gap: '12px',
          flexDirection: isMobile ? 'column' : 'row',
        }}
      >
        <div style={{ flex: 1, position: 'relative' }}>
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
            {'\u{1F50D}'}
          </span>
          <input
            type="text"
            placeholder={t.marketplace.searchPlaceholder}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              width: '100%',
              padding: '10px 12px 10px 38px',
              minHeight: '46px',
              borderRadius: '10px',
              border: '1px solid ' + c.border,
              backgroundColor: c.cardBg,
              color: c.textPrimary,
              fontSize: '14px',
              outline: 'none',
              boxSizing: 'border-box',
            }}
            onFocus={(e) => {
              e.target.style.borderColor = c.primary;
            }}
            onBlur={(e) => {
              e.target.style.borderColor = c.border;
            }}
          />
        </div>
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortBy)}
          style={{
            padding: '10px 14px',
            minHeight: '46px',
            borderRadius: '10px',
            border: '1px solid ' + c.border,
            backgroundColor: c.cardBg,
            color: c.textPrimary,
            fontSize: '14px',
            cursor: 'pointer',
            outline: 'none',
            minWidth: isMobile ? undefined : '170px',
            width: isMobile ? '100%' : undefined,
            boxSizing: 'border-box' as const,
          }}
        >
          <option value="popular">{t.marketplace.sortPopular}</option>
          <option value="rating">{t.marketplace.sortRating}</option>
          <option value="price_asc">{t.marketplace.sortPrice}</option>
        </select>
      </div>

      {/* Filters (Hotel Only) */}
      {activeCategory === 'hotel' && (
        <div
          style={{
            display: 'flex',
            gap: '16px',
            flexWrap: 'wrap',
            alignItems: 'center',
            padding: '16px',
            backgroundColor: c.cardBg,
            borderRadius: '12px',
            border: '1px solid ' + c.border,
          }}
        >
          {/* City Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', color: c.textSecondary, fontWeight: 500 }}>{t.marketplace.filterCity}</span>
            {(['all', 'Makkah', 'Madinah'] as CityFilter[]).map((city) => (
              <button
                key={city}
                onClick={() => setCityFilter(city)}
                style={{
                  padding: '8px 12px',
                  minHeight: '44px',
                  borderRadius: '8px',
                  border: cityFilter === city ? '1.5px solid ' + c.primary : '1px solid ' + c.border,
                  backgroundColor: cityFilter === city ? c.primaryLight : 'transparent',
                  color: cityFilter === city ? c.primary : c.textSecondary,
                  fontSize: '13px',
                  fontWeight: cityFilter === city ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {city === 'all' ? t.marketplace.filterCityAll : city}
              </button>
            ))}
          </div>

          {/* Min Rating Filter */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '13px', color: c.textSecondary, fontWeight: 500 }}>{t.marketplace.filterRating}</span>
            {([0, 3, 4, 5] as MinRating[]).map((r) => (
              <button
                key={r}
                onClick={() => setMinRating(r)}
                style={{
                  padding: '8px 12px',
                  minHeight: '44px',
                  borderRadius: '8px',
                  border: minRating === r ? '1.5px solid ' + c.primary : '1px solid ' + c.border,
                  backgroundColor: minRating === r ? c.primaryLight : 'transparent',
                  color: minRating === r ? c.primary : c.textSecondary,
                  fontSize: '13px',
                  fontWeight: minRating === r ? 600 : 400,
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                }}
              >
                {r === 0 ? t.marketplace.filterRatingAll : `${r}\u2605+`}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Results Count */}
      <div style={{ fontSize: '13px', color: c.textMuted }}>
        {t.common.showing} <span style={{ fontWeight: 600, color: c.textSecondary }}>{filteredItems.length}</span> {t.common.results}
        {searchQuery && (
          <span>
            {' '}{t.common.for} &quot;<span style={{ fontWeight: 600, color: c.textSecondary }}>{searchQuery}</span>&quot;
          </span>
        )}
      </div>

      {/* Product Grid */}
      {loading ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: c.cardBg,
            borderRadius: '16px',
            border: '1px solid ' + c.border,
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>{'\u23F3'}</div>
          <p style={{ fontSize: '16px', fontWeight: 600, color: c.textPrimary, margin: '0 0 4px' }}>
            {t.common.loadingData}
          </p>
        </div>
      ) : filteredItems.length > 0 ? (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${gridColumns}, 1fr)`,
            gap: isMobile ? '12px' : '16px',
          }}
        >
          {filteredItems.map((item) => (
            <MarketCard
              key={item.id}
              item={item}
              c={c as unknown as Record<string, string>}
              isHovered={hoveredCard === item.id}
              onHover={() => setHoveredCard(item.id)}
              onLeave={() => setHoveredCard(null)}
              t={t}
            />
          ))}
        </div>
      ) : (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: c.cardBg,
            borderRadius: '16px',
            border: '1px solid ' + c.border,
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>{'\u{1F50D}'}</div>
          <p style={{ fontSize: '16px', fontWeight: 600, color: c.textPrimary, margin: '0 0 4px' }}>
            {t.marketplace.emptyTitle}
          </p>
          <p style={{ fontSize: '14px', color: c.textMuted, margin: 0 }}>
            {t.marketplace.emptyDesc}
          </p>
        </div>
      )}
    </div>
  );
}
