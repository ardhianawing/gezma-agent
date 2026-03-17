'use client';

import { useState, useEffect, useCallback } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import {
  tradeCategories,
  type TradeCategory,
  type TradeProduct,
} from '@/data/mock-trade';
import { useLanguage } from '@/lib/i18n';
import { Search, Package, ShoppingBag, Factory, Globe, Star, MessageCircle, ChevronRight } from 'lucide-react';

type TabType = 'katalog' | 'pengajuan';

// curationSteps will be built inside component to use `t`

export default function TradePage() {
  const { c } = useTheme();
  const { isMobile, isTablet } = useResponsive();
  const { t } = useLanguage();

  const curationSteps = [
    { step: 1, label: t.trade.curationStep1, description: t.trade.curationStep1Desc, emoji: '📝' },
    { step: 2, label: t.trade.curationStep2, description: t.trade.curationStep2Desc, emoji: '🔍' },
    { step: 3, label: t.trade.curationStep3, description: t.trade.curationStep3Desc, emoji: '✅' },
    { step: 4, label: t.trade.curationStep4, description: t.trade.curationStep4Desc, emoji: '🏆' },
    { step: 5, label: t.trade.curationStep5, description: t.trade.curationStep5Desc, emoji: '🚀' },
  ];

  const [activeTab, setActiveTab] = useState<TabType>('katalog');
  const [activeCategory, setActiveCategory] = useState<TradeCategory>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  const [products, setProducts] = useState<TradeProduct[]>([]);
  const [myProducts, setMyProducts] = useState<TradeProduct[]>([]);
  const [loading, setLoading] = useState(false);
  const [apiStats, setApiStats] = useState({ totalProducts: 0, activeListings: 0, producers: 0, targetCountries: 0 });

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (activeCategory && activeCategory !== 'all') params.set('category', activeCategory);
      if (searchQuery.trim()) params.set('search', searchQuery.trim());

      const res = await fetch(`/api/trade?${params.toString()}`);
      if (res.ok) {
        const json = await res.json();
        setProducts(json.data ?? []);
        if (json.stats) {
          setApiStats((prev) => ({
            ...prev,
            totalProducts: json.stats.totalProducts ?? prev.totalProducts,
            activeListings: json.stats.activeListings ?? prev.activeListings,
            producers: json.stats.producers ?? prev.producers,
            targetCountries: json.stats.targetCountries ?? prev.targetCountries,
          }));
        }
      }
    } catch {
      // silently fail — products stay empty
    } finally {
      setLoading(false);
    }
  }, [activeCategory, searchQuery]);

  const fetchMyProducts = useCallback(async () => {
    try {
      const res = await fetch('/api/trade/my-products');
      if (res.ok) {
        const json = await res.json();
        setMyProducts(json.data ?? []);
      }
    } catch {
      // silently fail
    }
  }, []);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  useEffect(() => {
    if (activeTab === 'pengajuan') {
      fetchMyProducts();
    }
  }, [activeTab, fetchMyProducts]);

  const filteredProducts = products;

  const stats = [
    { label: t.trade.statProducts, value: apiStats.totalProducts, icon: Package, color: c.primary, bg: c.primaryLight },
    { label: t.trade.statListings, value: apiStats.activeListings, icon: ShoppingBag, color: c.success, bg: c.successLight },
    { label: t.trade.statProducers, value: apiStats.producers, icon: Factory, color: c.info, bg: c.infoLight },
    { label: t.trade.statCountries, value: apiStats.targetCountries, icon: Globe, color: c.warning, bg: c.warningLight },
  ];

  const getCategoryColor = (category: string): string => {
    const cat = tradeCategories.find((c) => c.key === category);
    return cat?.color || '#6B7280';
  };

  const getCategoryBg = (category: string): string => {
    const color = getCategoryColor(category);
    return color + '15';
  };

  const getCertColor = (cert: string) => {
    if (cert.includes('Halal')) return { color: '#16A34A', bg: '#F0FDF4' };
    if (cert.includes('BPOM')) return { color: '#2563EB', bg: '#EFF6FF' };
    if (cert.includes('SNI')) return { color: '#D97706', bg: '#FFFBEB' };
    if (cert.includes('Organic')) return { color: '#059669', bg: '#ECFDF5' };
    if (cert.includes('ISO')) return { color: '#7C3AED', bg: '#F5F3FF' };
    if (cert.includes('Fair Trade')) return { color: '#0891B2', bg: '#ECFEFF' };
    if (cert.includes('GAP') || cert.includes('GlobalGAP')) return { color: '#059669', bg: '#ECFDF5' };
    if (cert.includes('Phytosanitary')) return { color: '#D97706', bg: '#FFFBEB' };
    if (cert.includes('Batikmark')) return { color: '#EC4899', bg: '#FDF2F8' };
    if (cert.includes('Kemenag')) return { color: '#2563EB', bg: '#EFF6FF' };
    return { color: c.textMuted, bg: c.borderLight };
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active': return { color: c.success, bg: c.successLight, label: t.trade.statusActive };
      case 'pending': return { color: c.warning, bg: c.warningLight, label: t.trade.statusPending };
      case 'rejected': return { color: c.error, bg: c.errorLight, label: t.trade.statusRejected };
      default: return { color: c.textMuted, bg: c.borderLight, label: status };
    }
  };

  const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.5;
    const stars: React.ReactNode[] = [];
    for (let i = 0; i < full; i++) {
      stars.push(<Star key={'f' + i} style={{ width: '14px', height: '14px' }} fill="#F59E0B" color="#F59E0B" />);
    }
    if (hasHalf) {
      stars.push(<Star key="h" style={{ width: '14px', height: '14px' }} fill="none" color="#F59E0B" />);
    }
    return stars;
  };

  const renderProductCard = (product: TradeProduct) => {
    const isHovered = hoveredCard === product.id;
    const catColor = getCategoryColor(product.category);
    const catLabel = tradeCategories.find((cat) => cat.key === product.category)?.label || product.category;

    return (
      <div
        key={product.id}
        onMouseEnter={() => setHoveredCard(product.id)}
        onMouseLeave={() => setHoveredCard(null)}
        style={{
          backgroundColor: c.cardBg,
          border: '1px solid ' + c.border,
          borderRadius: '16px',
          overflow: 'hidden',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          transform: isHovered ? 'translateY(-2px)' : 'translateY(0)',
          boxShadow: isHovered ? '0 4px 20px rgba(0,0,0,0.08)' : 'none',
          display: 'flex',
          flexDirection: 'column' as const,
        }}
      >
        {/* Product Image */}
        {product.imageUrl ? (
          <img loading="lazy"
            src={product.imageUrl}
            alt={product.name}
            style={{
              width: '100%',
              height: '140px',
              objectFit: 'cover',
            }}
          />
        ) : (
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '28px',
              backgroundColor: getCategoryBg(product.category),
            }}
          >
            <span style={{ fontSize: '48px', lineHeight: 1 }}>{product.emoji}</span>
          </div>
        )}

        {/* Certifications + Category */}
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: '6px',
            padding: '12px 16px 0 16px',
            alignItems: 'center',
          }}
        >
          {product.certifications.map((cert) => {
            const certStyle = getCertColor(cert);
            return (
              <span
                key={cert}
                style={{
                  fontSize: '10px',
                  fontWeight: '700',
                  padding: '2px 8px',
                  borderRadius: '8px',
                  backgroundColor: certStyle.bg,
                  color: certStyle.color,
                  letterSpacing: '0.3px',
                }}
              >
                {cert}
              </span>
            );
          })}
          <span
            style={{
              fontSize: '10px',
              fontWeight: '600',
              padding: '2px 8px',
              borderRadius: '8px',
              backgroundColor: catColor + '15',
              color: catColor,
            }}
          >
            {catLabel}
          </span>
        </div>

        {/* Name + Producer + Origin */}
        <div style={{ padding: '10px 16px 0 16px' }}>
          <h3
            style={{
              fontSize: '15px',
              fontWeight: '700',
              color: c.textPrimary,
              margin: '0 0 4px 0',
              lineHeight: '1.4',
            }}
          >
            {product.name}
          </h3>
          <div style={{ fontSize: '13px', fontWeight: '600', color: c.textSecondary }}>{product.producer}</div>
          <div style={{ fontSize: '12px', color: c.textMuted }}>{product.origin}</div>
        </div>

        {/* Description (truncated 2 lines) */}
        <div style={{ padding: '8px 16px 0 16px' }}>
          <p
            style={{
              fontSize: '13px',
              color: c.textSecondary,
              margin: 0,
              lineHeight: '1.5',
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}
          >
            {product.description}
          </p>
        </div>

        {/* Rating + Inquiry */}
        <div
          style={{
            padding: '10px 16px 0 16px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'center', gap: '1px' }}>{renderStars(product.rating)}</span>
          <span style={{ fontSize: '13px', fontWeight: '600', color: c.textPrimary }}>{product.rating}</span>
          <span style={{ fontSize: '12px', color: c.textMuted, display: 'flex', alignItems: 'center', gap: '3px' }}>
            <MessageCircle style={{ width: '12px', height: '12px' }} />
            {product.inquiryCount}
          </span>
        </div>

        {/* MOQ */}
        <div style={{ padding: '6px 16px 0 16px' }}>
          <span style={{ fontSize: '12px', color: c.textMuted }}>MOQ: </span>
          <span style={{ fontSize: '12px', fontWeight: '600', color: c.textSecondary }}>{product.moq}</span>
        </div>

        {/* Target Markets */}
        <div
          style={{
            padding: '8px 16px 0 16px',
            display: 'flex',
            flexWrap: 'wrap',
            gap: '4px',
          }}
        >
          {product.targetMarkets.map((market) => (
            <span
              key={market}
              style={{
                fontSize: '10px',
                fontWeight: '500',
                padding: '2px 8px',
                borderRadius: '8px',
                backgroundColor: c.infoLight,
                color: c.info,
              }}
            >
              {market}
            </span>
          ))}
        </div>

        {/* Spacer */}
        <div style={{ flex: 1 }} />

        {/* Price + CTA */}
        <div
          style={{
            padding: '14px 16px 16px 16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: '12px',
          }}
        >
          <div style={{ fontSize: '15px', fontWeight: '700', color: c.primary }}>{product.price}</div>
          <button
            onClick={(e) => {
              e.stopPropagation();
              alert(t.trade.contactAlert);
            }}
            style={{
              padding: '8px 20px',
              fontSize: '13px',
              fontWeight: '600',
              borderRadius: '10px',
              border: 'none',
              cursor: 'pointer',
              backgroundColor: c.primary,
              color: 'white',
              transition: 'background-color 0.2s',
              whiteSpace: 'nowrap',
            }}
          >
            {t.trade.contactBtn}
          </button>
        </div>
      </div>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '24px' }}>
      <PageHeader
        title={t.trade.title}
        description={t.trade.description}
      />

      {/* Stats Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: isMobile ? '12px' : '16px',
        }}
      >
        {stats.map((stat) => (
          <div
            key={stat.label}
            style={{
              backgroundColor: c.cardBg,
              border: '1px solid ' + c.border,
              borderRadius: '12px',
              padding: isMobile ? '14px' : '20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
            }}
          >
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                backgroundColor: stat.bg,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}
            >
              <stat.icon style={{ width: '20px', height: '20px', color: stat.color }} />
            </div>
            <div>
              <div style={{ fontSize: '22px', fontWeight: '700', color: c.textPrimary }}>{stat.value}</div>
              <div style={{ fontSize: '12px', color: c.textMuted }}>{stat.label}</div>
            </div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '0',
          borderBottom: '2px solid ' + c.border,
        }}
      >
        {[
          { key: 'katalog' as TabType, label: t.trade.tabCatalog },
          { key: 'pengajuan' as TabType, label: t.trade.tabSubmissions },
        ].map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              style={{
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: isActive ? '700' : '500',
                color: isActive ? c.primary : c.textMuted,
                backgroundColor: 'transparent',
                border: 'none',
                borderBottom: isActive ? '2px solid ' + c.primary : '2px solid transparent',
                marginBottom: '-2px',
                cursor: 'pointer',
                transition: 'all 0.2s',
              }}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Tab: Katalog Produk */}
      {activeTab === 'katalog' && (
        <>
          {/* Category Pills + Search */}
          <div
            style={{
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              gap: '12px',
              alignItems: isMobile ? 'stretch' : 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                gap: '8px',
                overflowX: 'auto',
                paddingBottom: '4px',
                WebkitOverflowScrolling: 'touch',
                msOverflowStyle: 'none',
                scrollbarWidth: 'none',
                flex: 1,
              }}
            >
              {tradeCategories.map((cat) => {
                const isActive = activeCategory === cat.key;
                return (
                  <button
                    key={cat.key}
                    onClick={() => setActiveCategory(cat.key)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '6px',
                      padding: '8px 16px',
                      borderRadius: '20px',
                      border: isActive ? '1px solid ' + cat.color : '1px solid ' + c.border,
                      backgroundColor: isActive ? cat.color + '15' : c.cardBg,
                      color: isActive ? cat.color : c.textSecondary,
                      fontWeight: isActive ? '600' : '400',
                      fontSize: '13px',
                      cursor: 'pointer',
                      whiteSpace: 'nowrap',
                      transition: 'all 0.2s',
                    }}
                  >
                    <span>{cat.emoji}</span>
                    <span>{cat.label}</span>
                  </button>
                );
              })}
            </div>

            {/* Search Bar */}
            <div style={{ position: 'relative', minWidth: isMobile ? undefined : '280px' }}>
              <Search
                style={{
                  position: 'absolute',
                  left: '14px',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  width: '18px',
                  height: '18px',
                  color: c.textMuted,
                  pointerEvents: 'none',
                }}
              />
              <input
                type="text"
                placeholder={t.trade.searchPlaceholder}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                style={{
                  width: '100%',
                  height: '44px',
                  padding: '0 16px 0 42px',
                  fontSize: '14px',
                  border: '1px solid ' + c.border,
                  borderRadius: '12px',
                  outline: 'none',
                  backgroundColor: c.cardBgHover,
                  color: c.textPrimary,
                  boxSizing: 'border-box',
                }}
              />
            </div>
          </div>

          {/* Product Grid */}
          {filteredProducts.length === 0 ? (
            <div
              style={{
                padding: '60px 20px',
                textAlign: 'center',
                backgroundColor: c.cardBg,
                border: '1px solid ' + c.border,
                borderRadius: '16px',
              }}
            >
              <div style={{ fontSize: '48px', marginBottom: '16px' }}>🔍</div>
              <div style={{ fontSize: '16px', fontWeight: '600', color: c.textPrimary, marginBottom: '8px' }}>
                {t.trade.emptyTitle}
              </div>
              <div style={{ fontSize: '14px', color: c.textMuted }}>
                {t.trade.emptyDesc}
              </div>
            </div>
          ) : (
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
                gap: isMobile ? '16px' : '20px',
              }}
            >
              {filteredProducts.map(renderProductCard)}
            </div>
          )}
        </>
      )}

      {/* Tab: Pengajuan Saya */}
      {activeTab === 'pengajuan' && (
        <>
          {/* CTA Banner */}
          <div
            style={{
              background: 'linear-gradient(135deg, ' + c.primaryLight + ', ' + c.infoLight + ')',
              border: '1px solid ' + c.primary + '33',
              borderRadius: '16px',
              padding: isMobile ? '24px 20px' : '32px',
              display: 'flex',
              flexDirection: isMobile ? 'column' : 'row',
              alignItems: isMobile ? 'flex-start' : 'center',
              justifyContent: 'space-between',
              gap: '20px',
            }}
          >
            <div>
              <div style={{ fontSize: '20px', fontWeight: '700', color: c.textPrimary, marginBottom: '8px' }}>
                {t.trade.ctaTitle}
              </div>
              <div style={{ fontSize: '14px', color: c.textSecondary, lineHeight: '1.6', maxWidth: '500px' }}>
                {t.trade.ctaDesc}
              </div>
            </div>
            <button
              onClick={() => alert(t.trade.contactAlert)}
              style={{
                padding: '12px 28px',
                fontSize: '14px',
                fontWeight: '700',
                borderRadius: '12px',
                border: 'none',
                cursor: 'pointer',
                backgroundColor: c.primary,
                color: 'white',
                whiteSpace: 'nowrap',
                transition: 'background-color 0.2s',
                flexShrink: 0,
              }}
            >
              {t.trade.ctaBtn}
            </button>
          </div>

          {/* Proses Kurasi Steps */}
          <div
            style={{
              backgroundColor: c.cardBg,
              border: '1px solid ' + c.border,
              borderRadius: '16px',
              padding: isMobile ? '20px' : '28px',
            }}
          >
            <div style={{ fontSize: '16px', fontWeight: '700', color: c.textPrimary, marginBottom: '20px' }}>
              {t.trade.curationTitle}
            </div>
            <div
              style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: isMobile ? '16px' : '0',
                alignItems: isMobile ? 'flex-start' : 'center',
                justifyContent: 'space-between',
              }}
            >
              {curationSteps.map((step, index) => (
                <div
                  key={step.step}
                  style={{
                    display: 'flex',
                    flexDirection: isMobile ? 'row' : 'column',
                    alignItems: 'center',
                    gap: isMobile ? '12px' : '8px',
                    flex: isMobile ? undefined : 1,
                    position: 'relative',
                    textAlign: isMobile ? 'left' : 'center',
                  }}
                >
                  {/* Connector line (desktop) */}
                  {!isMobile && index < curationSteps.length - 1 && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '22px',
                        left: '50%',
                        width: '100%',
                        height: '2px',
                        backgroundColor: c.border,
                        zIndex: 0,
                      }}
                    />
                  )}
                  <div
                    style={{
                      width: '44px',
                      height: '44px',
                      borderRadius: '50%',
                      backgroundColor: c.primaryLight,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '20px',
                      flexShrink: 0,
                      position: 'relative',
                      zIndex: 1,
                      border: '2px solid ' + c.cardBg,
                    }}
                  >
                    {step.emoji}
                  </div>
                  <div>
                    <div style={{ fontSize: '13px', fontWeight: '700', color: c.textPrimary }}>{step.label}</div>
                    <div style={{ fontSize: '11px', color: c.textMuted, maxWidth: isMobile ? undefined : '120px' }}>
                      {step.description}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* My Products List */}
          <div
            style={{
              backgroundColor: c.cardBg,
              border: '1px solid ' + c.border,
              borderRadius: '16px',
              padding: isMobile ? '20px' : '28px',
            }}
          >
            <div style={{ fontSize: '16px', fontWeight: '700', color: c.textPrimary, marginBottom: '20px' }}>
              {t.trade.myProducts} ({myProducts.length})
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {myProducts.map((product) => {
                const statusStyle = getStatusStyle(product.status);
                const catColor = getCategoryColor(product.category);
                return (
                  <div
                    key={product.id}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.08)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.boxShadow = 'none';
                      e.currentTarget.style.transform = 'translateY(0)';
                    }}
                    style={{
                      display: 'flex',
                      alignItems: isMobile ? 'flex-start' : 'center',
                      flexDirection: isMobile ? 'column' : 'row',
                      gap: isMobile ? '12px' : '16px',
                      padding: '16px',
                      border: '1px solid ' + c.border,
                      borderRadius: '12px',
                      transition: 'all 0.2s ease',
                      cursor: 'pointer',
                    }}
                  >
                    {/* Product Thumbnail */}
                    {product.imageUrl ? (
                      <img loading="lazy"
                        src={product.imageUrl}
                        alt={product.name}
                        style={{
                          width: '52px',
                          height: '52px',
                          borderRadius: '12px',
                          objectFit: 'cover',
                          flexShrink: 0,
                        }}
                      />
                    ) : (
                      <div
                        style={{
                          width: '52px',
                          height: '52px',
                          borderRadius: '12px',
                          backgroundColor: catColor + '15',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '28px',
                          flexShrink: 0,
                        }}
                      >
                        {product.emoji}
                      </div>
                    )}

                    {/* Info */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: '14px', fontWeight: '700', color: c.textPrimary, marginBottom: '2px' }}>
                        {product.name}
                      </div>
                      <div style={{ fontSize: '12px', color: c.textMuted }}>
                        {product.producer} - {product.origin}
                      </div>
                      <div style={{ display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' }}>
                        {product.certifications.map((cert) => {
                          const certStyle = getCertColor(cert);
                          return (
                            <span
                              key={cert}
                              style={{
                                fontSize: '10px',
                                fontWeight: '600',
                                padding: '2px 6px',
                                borderRadius: '6px',
                                backgroundColor: certStyle.bg,
                                color: certStyle.color,
                              }}
                            >
                              {cert}
                            </span>
                          );
                        })}
                      </div>
                    </div>

                    {/* Price */}
                    <div
                      style={{
                        fontSize: '14px',
                        fontWeight: '700',
                        color: c.primary,
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}
                    >
                      {product.price}
                    </div>

                    {/* Status Badge */}
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        padding: '4px 12px',
                        borderRadius: '10px',
                        backgroundColor: statusStyle.bg,
                        color: statusStyle.color,
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}
                    >
                      {statusStyle.label}
                    </span>

                    {/* Arrow */}
                    <ChevronRight
                      style={{
                        width: '18px',
                        height: '18px',
                        color: c.textMuted,
                        flexShrink: 0,
                        display: isMobile ? 'none' : 'block',
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
