'use client';

import { useState, useMemo } from 'react';
import {
  Search, X, Globe, Package, Users, TrendingUp, ChevronRight,
  Star, ShieldCheck, MapPin, Box, Filter, Plus, ArrowRight,
} from 'lucide-react';
import {
  tradeProducts, tradeCategories, tradeStats,
  type TradeCategory, type TradeProduct,
} from '@/data/mock-trade';
import { useResponsive } from '@/lib/hooks/use-responsive';

function formatRupiah(num: number): string {
  return 'Rp ' + num.toLocaleString('id-ID');
}

function formatNumber(num: number): string {
  if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
  return num.toString();
}

export default function TradeCentrePage() {
  const { isMobile, isTablet } = useResponsive();
  const [activeCategory, setActiveCategory] = useState<TradeCategory>('semua');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTab, setActiveTab] = useState<'katalog' | 'pengajuan'>('katalog');

  const activeProducts = tradeProducts.filter(p => p.status === 'active');
  const reviewProducts = tradeProducts.filter(p => p.status === 'review' || p.status === 'draft');

  const filteredProducts = useMemo(() => {
    let items = activeProducts;

    if (activeCategory !== 'semua') {
      items = items.filter(p => p.category === activeCategory);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      items = items.filter(p =>
        p.name.toLowerCase().includes(q) ||
        p.producer.toLowerCase().includes(q) ||
        p.origin.toLowerCase().includes(q) ||
        p.tags.some(t => t.toLowerCase().includes(q))
      );
    }

    return items;
  }, [activeCategory, searchQuery, activeProducts]);

  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'active': return { bg: '#D1FAE5', color: '#059669', label: 'Aktif' };
      case 'review': return { bg: '#FEF3C7', color: '#D97706', label: 'Dalam Review' };
      case 'draft': return { bg: '#F3F4F6', color: '#6B7280', label: 'Draft' };
      case 'rejected': return { bg: '#FEE2E2', color: '#DC2626', label: 'Ditolak' };
      default: return { bg: '#F3F4F6', color: '#6B7280', label: status };
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%', maxWidth: '100%', overflow: 'hidden', boxSizing: 'border-box' }}>

      {/* HEADER */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: '#111827', margin: 0 }}>
            GEZMA Trade Centre
          </h1>
          <p style={{ fontSize: '14px', color: '#6B7280', marginTop: '4px' }}>
            Ekspor produk Nusantara ke dunia — difasilitasi & dikurasi
          </p>
        </div>
        <button
          onClick={() => setActiveTab('pengajuan')}
          style={{
            display: 'inline-flex', alignItems: 'center', gap: '8px', flexShrink: 0,
            backgroundColor: '#DC2626', color: 'white', fontSize: '14px', fontWeight: '600',
            padding: '10px 20px', borderRadius: '8px', border: 'none', cursor: 'pointer',
          }}
        >
          <Plus style={{ width: '16px', height: '16px' }} />
          Ajukan Produk
        </button>
      </div>

      {/* STATS */}
      <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap' }}>
        {[
          { label: 'Total Produk', value: tradeStats.totalProducts, icon: Package, color: '#2563EB', bg: '#DBEAFE' },
          { label: 'Listing Aktif', value: tradeStats.activeListings, icon: TrendingUp, color: '#059669', bg: '#D1FAE5' },
          { label: 'Produsen', value: tradeStats.totalProducers, icon: Users, color: '#D97706', bg: '#FEF3C7' },
          { label: 'Negara Tujuan', value: tradeStats.countriesReached, icon: Globe, color: '#DC2626', bg: '#FEE2E2' },
        ].map((stat, i) => {
          const Icon = stat.icon;
          return (
            <div key={i} style={{
              flex: 1, minWidth: '140px', display: 'flex', alignItems: 'center', gap: '12px',
              padding: '16px 20px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E5E7EB',
            }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px', backgroundColor: stat.bg,
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}>
                <Icon style={{ width: '20px', height: '20px', color: stat.color }} />
              </div>
              <div>
                <p style={{ fontSize: '20px', fontWeight: '700', color: '#111827', margin: 0 }}>{formatNumber(stat.value)}</p>
                <p style={{ fontSize: '12px', color: '#6B7280', margin: 0 }}>{stat.label}</p>
              </div>
            </div>
          );
        })}
      </div>

      {/* TABS */}
      <div style={{ display: 'flex', gap: '4px', backgroundColor: '#F3F4F6', borderRadius: '10px', padding: '4px', alignSelf: 'flex-start' }}>
        {[
          { id: 'katalog', label: '🌏 Katalog Produk' },
          { id: 'pengajuan', label: '📦 Pengajuan Saya' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as 'katalog' | 'pengajuan')}
            style={{
              padding: '8px 20px', borderRadius: '8px', border: 'none',
              backgroundColor: activeTab === tab.id ? 'white' : 'transparent',
              boxShadow: activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
              color: activeTab === tab.id ? '#111827' : '#6B7280',
              fontSize: '13px', fontWeight: activeTab === tab.id ? '600' : '500',
              cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ===== TAB: KATALOG ===== */}
      {activeTab === 'katalog' && (
        <>
          {/* Category + Search */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap' }}>
              {tradeCategories.map((cat) => {
                const isActive = activeCategory === cat.id;
                return (
                  <button key={cat.id} onClick={() => setActiveCategory(cat.id as TradeCategory)} style={{
                    display: 'inline-flex', alignItems: 'center', gap: '6px',
                    padding: '7px 14px', borderRadius: '20px',
                    border: isActive ? `2px solid ${cat.color || '#374151'}` : '1px solid #E5E7EB',
                    backgroundColor: isActive ? (cat.color || '#374151') + '12' : 'white',
                    color: isActive ? (cat.color || '#374151') : '#4B5563',
                    fontSize: '13px', fontWeight: isActive ? '600' : '500',
                    cursor: 'pointer', whiteSpace: 'nowrap',
                  }}>
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
              <input type="text" value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Cari produk, produsen, atau daerah asal..."
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

          {/* Product Grid */}
          <p style={{ fontSize: '13px', color: '#6B7280', margin: 0 }}>
            Menampilkan <span style={{ fontWeight: '600', color: '#111827' }}>{filteredProducts.length}</span> produk
          </p>

          {filteredProducts.length === 0 ? (
            <div style={{ padding: '48px', textAlign: 'center', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
              <p style={{ fontSize: '14px', color: '#9CA3AF' }}>Tidak ada produk ditemukan</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))', gap: '16px' }}>
              {filteredProducts.map((product) => {
                const catInfo = tradeCategories.find(c => c.id === product.category);
                return (
                  <div key={product.id} style={{
                    backgroundColor: 'white', borderRadius: '14px', border: '1px solid #E5E7EB',
                    overflow: 'hidden', cursor: 'pointer', transition: 'all 0.2s', display: 'flex', flexDirection: 'column',
                  }}
                    onMouseEnter={(e) => { e.currentTarget.style.boxShadow = '0 4px 20px rgba(0,0,0,0.07)'; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                    onMouseLeave={(e) => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
                  >
                    {/* Thumbnail */}
                    <div style={{
                      height: '100px', backgroundColor: '#F9FAFB', display: 'flex',
                      alignItems: 'center', justifyContent: 'center', position: 'relative',
                    }}>
                      <span style={{ fontSize: '44px' }}>{product.imageEmoji}</span>
                      <div style={{ position: 'absolute', top: '8px', left: '8px', display: 'flex', gap: '4px' }}>
                        {product.certifications.slice(0, 2).map((cert) => (
                          <span key={cert} style={{
                            fontSize: '9px', fontWeight: '600', padding: '2px 6px', borderRadius: '4px',
                            backgroundColor: 'white', color: '#059669', border: '1px solid #D1FAE5',
                            display: 'flex', alignItems: 'center', gap: '2px',
                          }}>
                            ✓ {cert}
                          </span>
                        ))}
                      </div>
                      <div style={{ position: 'absolute', top: '8px', right: '8px' }}>
                        <span style={{
                          fontSize: '10px', fontWeight: '600', padding: '3px 8px', borderRadius: '4px',
                          backgroundColor: (catInfo?.color || '#6B7280') + '15',
                          color: catInfo?.color || '#6B7280',
                        }}>
                          {catInfo?.label}
                        </span>
                      </div>
                    </div>

                    {/* Content */}
                    <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '8px', flex: 1 }}>
                      <h3 style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: 0 }}>
                        {product.name}
                      </h3>

                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '12px', color: '#6B7280' }}>{product.producer}</span>
                        <span style={{ fontSize: '11px', color: '#9CA3AF', display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <MapPin style={{ width: '10px', height: '10px' }} /> {product.origin}
                        </span>
                      </div>

                      <p style={{
                        fontSize: '12px', color: '#6B7280', margin: 0, lineHeight: '1.4',
                        overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
                      }}>
                        {product.description}
                      </p>

                      {/* Rating + Inquiry */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        {product.rating && (
                          <div style={{ display: 'flex', alignItems: 'center', gap: '3px' }}>
                            <Star style={{ width: '12px', height: '12px', color: '#F59E0B', fill: '#F59E0B' }} />
                            <span style={{ fontSize: '12px', fontWeight: '600', color: '#111827' }}>{product.rating}</span>
                          </div>
                        )}
                        {product.inquiryCount && (
                          <span style={{ fontSize: '11px', color: '#6B7280' }}>{product.inquiryCount} inquiry</span>
                        )}
                        <span style={{ fontSize: '11px', color: '#9CA3AF' }}>MOQ: {product.minOrder}</span>
                      </div>

                      {/* Target Markets */}
                      <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
                        {product.targetMarket.slice(0, 3).map(m => (
                          <span key={m} style={{
                            fontSize: '10px', padding: '2px 6px', borderRadius: '4px',
                            backgroundColor: '#F3F4F6', color: '#4B5563',
                          }}>
                            🌍 {m}
                          </span>
                        ))}
                        {product.targetMarket.length > 3 && (
                          <span style={{ fontSize: '10px', color: '#9CA3AF' }}>+{product.targetMarket.length - 3}</span>
                        )}
                      </div>

                      <div style={{ flex: 1 }} />

                      {/* Price + CTA */}
                      <div style={{
                        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                        paddingTop: '12px', borderTop: '1px solid #F3F4F6', marginTop: '4px',
                      }}>
                        <div>
                          <p style={{ fontSize: '16px', fontWeight: '700', color: '#DC2626', margin: 0 }}>
                            {formatRupiah(product.price)}
                            <span style={{ fontSize: '12px', fontWeight: '400', color: '#6B7280' }}>{product.priceUnit}</span>
                          </p>
                        </div>
                        <button style={{
                          padding: '8px 16px', backgroundColor: '#111827', color: 'white',
                          border: 'none', borderRadius: '8px', fontSize: '12px', fontWeight: '600', cursor: 'pointer',
                        }}>
                          Detail
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {/* ===== TAB: PENGAJUAN SAYA ===== */}
      {activeTab === 'pengajuan' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>

          {/* CTA Banner */}
          <div style={{
            padding: '32px', borderRadius: '16px',
            background: 'linear-gradient(135deg, #111827 0%, #1F2937 100%)',
            color: 'white', position: 'relative', overflow: 'hidden',
          }}>
            <div style={{ position: 'absolute', top: '10px', right: '20px', fontSize: '80px', opacity: 0.1 }}>🚀</div>
            <h2 style={{ fontSize: '22px', fontWeight: '700', margin: '0 0 8px 0' }}>
              Punya Produk Unggulan Indonesia?
            </h2>
            <p style={{ fontSize: '14px', color: '#9CA3AF', margin: '0 0 20px 0', maxWidth: '600px', lineHeight: '1.5' }}>
              Daftarkan produk Anda untuk diekspor ke Saudi Arabia dan negara Timur Tengah lainnya.
              Tim kurasi GEZMA Trade Centre akan mereview dan memfasilitasi proses ekspor.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              <button style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '12px 24px', borderRadius: '8px', border: 'none',
                backgroundColor: '#DC2626', color: 'white', fontSize: '14px', fontWeight: '600', cursor: 'pointer',
              }}>
                <Plus style={{ width: '16px', height: '16px' }} />
                Ajukan Produk Baru
              </button>
              <button style={{
                display: 'inline-flex', alignItems: 'center', gap: '8px',
                padding: '12px 24px', borderRadius: '8px', border: '1px solid #4B5563',
                backgroundColor: 'transparent', color: '#D1D5DB', fontSize: '14px', fontWeight: '500', cursor: 'pointer',
              }}>
                Panduan Pengajuan
                <ArrowRight style={{ width: '14px', height: '14px' }} />
              </button>
            </div>
          </div>

          {/* Proses Kurasi */}
          <div style={{
            padding: '24px', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E5E7EB',
          }}>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 20px 0' }}>
              📋 Proses Kurasi Produk
            </h3>
            <div style={{ display: 'flex', gap: '0', alignItems: 'flex-start', flexWrap: 'wrap' }}>
              {[
                { step: '1', label: 'Ajukan', desc: 'Isi form produk & upload foto', color: '#6B7280' },
                { step: '2', label: 'Review', desc: 'Tim kurasi mereview kualitas', color: '#D97706' },
                { step: '3', label: 'Sertifikasi', desc: 'Verifikasi sertifikat halal/SNI', color: '#2563EB' },
                { step: '4', label: 'Listing', desc: 'Produk tampil di katalog', color: '#059669' },
                { step: '5', label: 'Ekspor', desc: 'Difasilitasi ekspor ke Saudi', color: '#DC2626' },
              ].map((s, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1, minWidth: '120px' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '8px', flex: 1 }}>
                    <div style={{
                      width: '36px', height: '36px', borderRadius: '50%', backgroundColor: s.color,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontSize: '14px', fontWeight: '700',
                    }}>
                      {s.step}
                    </div>
                    <p style={{ fontSize: '13px', fontWeight: '600', color: '#111827', margin: 0, textAlign: 'center' }}>{s.label}</p>
                    <p style={{ fontSize: '11px', color: '#6B7280', margin: 0, textAlign: 'center' }}>{s.desc}</p>
                  </div>
                  {i < 4 && (
                    <div style={{ width: '40px', height: '2px', backgroundColor: '#E5E7EB', flexShrink: 0, marginTop: '-20px' }} />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Produk Saya */}
          <div>
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: '#111827', margin: '0 0 12px 0' }}>
              Produk Saya ({reviewProducts.length})
            </h3>

            {reviewProducts.length === 0 ? (
              <div style={{ padding: '48px', textAlign: 'center', backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E5E7EB' }}>
                <p style={{ fontSize: '14px', color: '#9CA3AF' }}>Belum ada produk yang diajukan</p>
              </div>
            ) : (
              <div style={{ backgroundColor: 'white', borderRadius: '12px', border: '1px solid #E5E7EB', overflow: 'hidden' }}>
                {reviewProducts.map((product, index) => {
                  const statusStyle = getStatusStyle(product.status);
                  return (
                    <div key={product.id} style={{
                      display: 'flex', alignItems: 'center', gap: '16px', padding: '16px 20px',
                      borderBottom: index < reviewProducts.length - 1 ? '1px solid #F3F4F6' : 'none',
                      cursor: 'pointer', transition: 'background 0.1s',
                    }}
                      onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = '#F9FAFB'; }}
                      onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'white'; }}
                    >
                      <div style={{
                        width: '48px', height: '48px', borderRadius: '10px', backgroundColor: '#F3F4F6',
                        display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '24px', flexShrink: 0,
                      }}>
                        {product.imageEmoji}
                      </div>

                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: '#111827', margin: 0 }}>{product.name}</p>
                        <p style={{ fontSize: '12px', color: '#6B7280', margin: '2px 0 0 0' }}>
                          {product.producer} · {product.origin}
                        </p>
                      </div>

                      <span style={{
                        fontSize: '11px', fontWeight: '600', padding: '4px 10px', borderRadius: '6px',
                        backgroundColor: statusStyle.bg, color: statusStyle.color, flexShrink: 0,
                      }}>
                        {statusStyle.label}
                      </span>

                      <ChevronRight style={{ width: '16px', height: '16px', color: '#D1D5DB', flexShrink: 0 }} />
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
