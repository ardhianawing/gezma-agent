'use client';

import { useState, useMemo } from 'react';
import { Search, SlidersHorizontal, X } from 'lucide-react';
import { marketplaceItems, categories, type Category } from '@/data/mock-marketplace';

// Format rupiah
function formatRupiah(num: number): string {
  return 'Rp ' + num.toLocaleString('id-ID');
}

export default function MarketplacePage() {
  const [activeCategory, setActiveCategory] = useState<Category>('hotel');
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilter, setShowFilter] = useState(false);
  const [sortBy, setSortBy] = useState<'price_asc' | 'price_desc' | 'rating' | 'popular'>('popular');
  const [filterCity, setFilterCity] = useState<string>('all');
  const [filterRating, setFilterRating] = useState<number>(0);
  const [filterPriceMax, setFilterPriceMax] = useState<number>(0);

  // Filtered items
  const filteredItems = useMemo(() => {
    let items = marketplaceItems.filter(item => item.category === activeCategory);

    // Search
    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(item =>
        item.name.toLowerCase().includes(q) ||
        item.vendor.toLowerCase().includes(q) ||
        item.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    // Filter city (hotel only)
    if (filterCity !== 'all' && activeCategory === 'hotel') {
      items = items.filter(item => item.city === filterCity);
    }

    // Filter rating
    if (filterRating > 0) {
      items = items.filter(item => item.rating >= filterRating);
    }

    // Filter price
    if (filterPriceMax > 0) {
      items = items.filter(item => item.price <= filterPriceMax);
    }

    // Sort
    switch (sortBy) {
      case 'price_asc':
        items.sort((a, b) => a.price - b.price);
        break;
      case 'price_desc':
        items.sort((a, b) => b.price - a.price);
        break;
      case 'rating':
        items.sort((a, b) => b.rating - a.rating);
        break;
      case 'popular':
        items.sort((a, b) => b.reviewCount - a.reviewCount);
        break;
    }

    return items;
  }, [activeCategory, searchQuery, sortBy, filterCity, filterRating, filterPriceMax]);

  // Reset filters when category changes
  const handleCategoryChange = (cat: Category) => {
    setActiveCategory(cat);
    setSearchQuery('');
    setFilterCity('all');
    setFilterRating(0);
    setFilterPriceMax(0);
    setSortBy('popular');
  };

  // Get badge color
  const getBadgeColor = (badge: string): string => {
    switch (badge) {
      case 'Best Seller':
      case 'Top Rated':
      case 'National Carrier':
        return '#DC2626';
      case 'Premium':
        return '#7C3AED';
      case 'Popular':
      case 'Best Coverage':
      case 'Recommended':
        return '#2563EB';
      case 'Termurah':
      case 'Terpercaya':
      case 'Syariah':
      case 'Direct Flight':
        return '#059669';
      case 'Fast Track':
        return '#D97706';
      default:
        return '#6B7280';
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>

      {/* ===== HEADER ===== */}
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: 0 }}>
          Marketplace
        </h1>
        <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '4px' }}>
          Pusat belanja kebutuhan operasional umrah
        </p>
      </div>

      {/* ===== CATEGORY TABS ===== */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px' }}>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => handleCategoryChange(cat.id as Category)}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '12px 20px',
              borderRadius: '12px',
              border: activeCategory === cat.id ? '2px solid #DC2626' : '1px solid #E5E7EB',
              backgroundColor: activeCategory === cat.id ? '#FEF2F2' : 'white',
              cursor: 'pointer',
              whiteSpace: 'nowrap',
              transition: 'all 0.15s ease',
            }}
          >
            <span style={{ fontSize: '20px' }}>{cat.icon}</span>
            <span style={{
              fontSize: '14px',
              fontWeight: activeCategory === cat.id ? '600' : '500',
              color: activeCategory === cat.id ? '#DC2626' : '#374151',
            }}>
              {cat.label}
            </span>
            <span style={{
              fontSize: '11px',
              fontWeight: '600',
              padding: '2px 8px',
              borderRadius: '10px',
              backgroundColor: activeCategory === cat.id ? '#DC2626' : '#F3F4F6',
              color: activeCategory === cat.id ? 'white' : '#6B7280',
            }}>
              {cat.count}
            </span>
          </button>
        ))}
      </div>

      {/* ===== SEARCH & SORT BAR ===== */}
      <div style={{
        display: 'flex',
        gap: '12px',
        alignItems: 'center',
        flexWrap: 'wrap',
      }}>
        {/* Search */}
        <div style={{ position: 'relative', flex: 1, minWidth: '280px' }}>
          <div style={{
            position: 'absolute',
            left: '16px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: '#9CA3AF',
            pointerEvents: 'none',
            display: 'flex',
            alignItems: 'center',
          }}>
            <Search style={{ width: '20px', height: '20px' }} />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder={`Cari ${categories.find(c => c.id === activeCategory)?.label.toLowerCase() || ''}...`}
            style={{
              width: '100%',
              height: '44px',
              paddingLeft: '48px',
              paddingRight: searchQuery ? '40px' : '16px',
              fontSize: '14px',
              border: '1px solid #D1D5DB',
              borderRadius: '10px',
              outline: 'none',
              backgroundColor: 'white',
            }}
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              style={{
                position: 'absolute',
                right: '12px',
                top: '50%',
                transform: 'translateY(-50%)',
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                color: '#9CA3AF',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              <X style={{ width: '18px', height: '18px' }} />
            </button>
          )}
        </div>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'price_asc' | 'price_desc' | 'rating' | 'popular')}
          style={{
            height: '44px',
            padding: '0 16px',
            fontSize: '14px',
            border: '1px solid #D1D5DB',
            borderRadius: '10px',
            backgroundColor: 'white',
            color: '#374151',
            cursor: 'pointer',
            outline: 'none',
          }}
        >
          <option value="popular">Paling Populer</option>
          <option value="rating">Rating Tertinggi</option>
          <option value="price_asc">Harga Terendah</option>
          <option value="price_desc">Harga Tertinggi</option>
        </select>

        {/* Filter Toggle */}
        <button
          onClick={() => setShowFilter(!showFilter)}
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            height: '44px',
            padding: '0 16px',
            border: showFilter ? '2px solid #DC2626' : '1px solid #D1D5DB',
            borderRadius: '10px',
            backgroundColor: showFilter ? '#FEF2F2' : 'white',
            color: showFilter ? '#DC2626' : '#374151',
            fontSize: '14px',
            fontWeight: '500',
            cursor: 'pointer',
          }}
        >
          <SlidersHorizontal style={{ width: '18px', height: '18px' }} />
          Filter
        </button>
      </div>

      {/* ===== FILTER PANEL (collapsible) ===== */}
      {showFilter && (
        <div style={{
          display: 'flex',
          gap: '16px',
          padding: '20px',
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '1px solid #E5E7EB',
          flexWrap: 'wrap',
        }}>
          {/* City filter (hotel only) */}
          {activeCategory === 'hotel' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase' }}>
                Kota
              </label>
              <div style={{ display: 'flex', gap: '8px' }}>
                {['all', 'Makkah', 'Madinah'].map((city) => (
                  <button
                    key={city}
                    onClick={() => setFilterCity(city)}
                    style={{
                      padding: '8px 16px',
                      borderRadius: '8px',
                      border: filterCity === city ? '2px solid #DC2626' : '1px solid #D1D5DB',
                      backgroundColor: filterCity === city ? '#FEF2F2' : 'white',
                      color: filterCity === city ? '#DC2626' : '#374151',
                      fontSize: '13px',
                      fontWeight: '500',
                      cursor: 'pointer',
                    }}
                  >
                    {city === 'all' ? 'Semua' : city}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Rating filter */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            <label style={{ fontSize: '12px', fontWeight: '600', color: '#6B7280', textTransform: 'uppercase' }}>
              Rating Minimum
            </label>
            <div style={{ display: 'flex', gap: '8px' }}>
              {[0, 4.0, 4.3, 4.5, 4.7].map((r) => (
                <button
                  key={r}
                  onClick={() => setFilterRating(r)}
                  style={{
                    padding: '8px 16px',
                    borderRadius: '8px',
                    border: filterRating === r ? '2px solid #DC2626' : '1px solid #D1D5DB',
                    backgroundColor: filterRating === r ? '#FEF2F2' : 'white',
                    color: filterRating === r ? '#DC2626' : '#374151',
                    fontSize: '13px',
                    fontWeight: '500',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  {r === 0 ? 'Semua' : (
                    <>
                      <span>⭐</span> {r}+
                    </>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Reset */}
          <div style={{ display: 'flex', alignItems: 'flex-end' }}>
            <button
              onClick={() => {
                setFilterCity('all');
                setFilterRating(0);
                setFilterPriceMax(0);
              }}
              style={{
                padding: '8px 16px',
                borderRadius: '8px',
                border: 'none',
                backgroundColor: '#F3F4F6',
                color: '#6B7280',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              Reset Filter
            </button>
          </div>
        </div>
      )}

      {/* ===== RESULTS COUNT ===== */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <p style={{ fontSize: '14px', color: '#6B7280', margin: 0 }}>
          Menampilkan <span style={{ fontWeight: '600', color: '#111827' }}>{filteredItems.length}</span> {categories.find(c => c.id === activeCategory)?.label.toLowerCase()}
        </p>
      </div>

      {/* ===== PRODUCT CARDS GRID ===== */}
      {filteredItems.length === 0 ? (
        <div style={{
          padding: '64px',
          textAlign: 'center',
          backgroundColor: 'white',
          borderRadius: '12px',
          border: '1px solid #E5E7EB',
        }}>
          <p style={{ fontSize: '16px', color: '#9CA3AF', margin: 0 }}>
            Tidak ada hasil yang ditemukan
          </p>
          <p style={{ fontSize: '14px', color: '#D1D5DB', marginTop: '8px' }}>
            Coba ubah filter atau kata kunci pencarian
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))',
          gap: '20px',
        }}>
          {filteredItems.map((item) => (
            <div
              key={item.id}
              style={{
                backgroundColor: 'white',
                borderRadius: '16px',
                border: '1px solid #E5E7EB',
                overflow: 'hidden',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
                display: 'flex',
                flexDirection: 'column',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.08)';
                e.currentTarget.style.transform = 'translateY(-2px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.boxShadow = 'none';
                e.currentTarget.style.transform = 'translateY(0)';
              }}
            >
              {/* Image + Badge */}
              <div style={{
                height: '180px',
                backgroundColor: '#F3F4F6',
                position: 'relative',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                overflow: 'hidden',
              }}>
                {item.image ? (
                  <img
                    src={item.image}
                    alt={item.name}
                    style={{
                      width: '100%',
                      height: '100%',
                      objectFit: 'cover',
                    }}
                    onError={(e) => {
                      // Fallback to emoji if image fails to load
                      e.currentTarget.style.display = 'none';
                      const parent = e.currentTarget.parentElement;
                      if (parent) {
                        const fallback = document.createElement('span');
                        fallback.style.fontSize = '48px';
                        fallback.style.opacity = '0.5';
                        fallback.textContent = categories.find(c => c.id === item.category)?.icon || '📦';
                        parent.appendChild(fallback);
                      }
                    }}
                  />
                ) : (
                  <span style={{ fontSize: '48px', opacity: 0.5 }}>
                    {categories.find(c => c.id === item.category)?.icon}
                  </span>
                )}

                {/* Badge */}
                {item.badge && (
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    left: '12px',
                    backgroundColor: getBadgeColor(item.badge),
                    color: 'white',
                    fontSize: '11px',
                    fontWeight: '600',
                    padding: '4px 10px',
                    borderRadius: '6px',
                  }}>
                    {item.badge}
                  </span>
                )}

                {/* City tag (hotel) */}
                {item.city && (
                  <span style={{
                    position: 'absolute',
                    top: '12px',
                    right: '12px',
                    backgroundColor: 'rgba(0,0,0,0.6)',
                    color: 'white',
                    fontSize: '11px',
                    fontWeight: '500',
                    padding: '4px 10px',
                    borderRadius: '6px',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}>
                    📍 {item.city}
                  </span>
                )}
              </div>

              {/* Content */}
              <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '12px', flex: 1 }}>
                {/* Vendor */}
                <p style={{ fontSize: '12px', color: '#6B7280', fontWeight: '500', margin: 0 }}>
                  {item.vendor}
                </p>

                {/* Name */}
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: 0, lineHeight: '1.3' }}>
                  {item.name}
                </h3>

                {/* Rating */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                  {[1, 2, 3, 4, 5].map((star) => (
                    <svg key={star} width="14" height="14" viewBox="0 0 24 24" fill={star <= Math.round(item.rating) ? '#F59E0B' : '#E5E7EB'}>
                      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                    </svg>
                  ))}
                  <span style={{ fontSize: '13px', fontWeight: '600', color: '#111827', marginLeft: '6px' }}>{item.rating}</span>
                  <span style={{ fontSize: '12px', color: '#6B7280' }}>({item.reviewCount} ulasan)</span>
                </div>

                {/* Tags */}
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
                  {item.tags.slice(0, 3).map((tag) => (
                    <span key={tag} style={{
                      fontSize: '11px',
                      fontWeight: '500',
                      padding: '4px 10px',
                      borderRadius: '6px',
                      backgroundColor: '#F3F4F6',
                      color: '#4B5563',
                    }}>
                      {tag}
                    </span>
                  ))}
                </div>

                {/* Details */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '4px' }}>
                  {Object.entries(item.details).slice(0, 3).map(([key, value]) => (
                    <div key={key} style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                      <span style={{ fontSize: '12px', color: '#9CA3AF', minWidth: '80px', flexShrink: 0 }}>{key}</span>
                      <span style={{ fontSize: '12px', color: '#374151', fontWeight: '500' }}>{value}</span>
                    </div>
                  ))}
                </div>

                {/* Spacer */}
                <div style={{ flex: 1 }} />

                {/* Price & CTA */}
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  paddingTop: '16px',
                  borderTop: '1px solid #F3F4F6',
                  marginTop: '4px',
                }}>
                  <div>
                    <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>Mulai dari</p>
                    <p style={{ fontSize: '20px', fontWeight: '700', color: '#DC2626', margin: '2px 0 0 0' }}>
                      {formatRupiah(item.price)}
                      <span style={{ fontSize: '13px', fontWeight: '400', color: '#6B7280' }}>{item.priceUnit}</span>
                    </p>
                  </div>
                  <button
                    style={{
                      padding: '10px 20px',
                      backgroundColor: '#DC2626',
                      color: 'white',
                      border: 'none',
                      borderRadius: '10px',
                      fontSize: '13px',
                      fontWeight: '600',
                      cursor: 'pointer',
                    }}
                  >
                    Lihat Detail
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
