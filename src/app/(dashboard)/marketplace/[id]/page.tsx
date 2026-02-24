'use client';

import { use, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Star, ShoppingCart, MapPin, Tag } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { marketItems, marketCategories } from '@/data/mock-marketplace';

const badgeColors: Record<string, { bg: string; text: string }> = {
  'Best Seller': { bg: '#DCFCE7', text: '#15803D' },
  Premium: { bg: '#EDE9FE', text: '#7C3AED' },
  Popular: { bg: '#DBEAFE', text: '#2563EB' },
  New: { bg: '#FEF3C7', text: '#D97706' },
};

export default function MarketplaceDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { c } = useTheme();
  const { isMobile } = useResponsive();
  const [ordered, setOrdered] = useState(false);

  const item = marketItems.find(i => i.id === id);

  if (!item) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center' }}>
        <p style={{ fontSize: '16px', color: c.textMuted }}>Item tidak ditemukan.</p>
        <Link href="/marketplace" style={{ color: c.primary, textDecoration: 'none', fontSize: '14px' }}>
          Kembali ke Marketplace
        </Link>
      </div>
    );
  }

  const categoryInfo = marketCategories.find(cat => cat.key === item.category);
  const relatedItems = marketItems
    .filter(i => i.category === item.category && i.id !== item.id)
    .slice(0, 3);

  const handleOrder = () => {
    setOrdered(true);
    setTimeout(() => setOrdered(false), 3000);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '24px' }}>
      {/* Back button */}
      <Link href="/marketplace" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: '6px', color: c.textMuted, fontSize: '14px' }}>
        <ArrowLeft style={{ width: '18px', height: '18px' }} />
        Kembali ke Marketplace
      </Link>

      {/* Order toast */}
      {ordered && (
        <div
          style={{
            position: 'fixed',
            top: '20px',
            right: '20px',
            zIndex: 1000,
            padding: '14px 24px',
            backgroundColor: '#15803D',
            color: 'white',
            borderRadius: '10px',
            fontSize: '14px',
            fontWeight: '500',
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
          }}
        >
          Pesanan berhasil dikirim! Tim vendor akan menghubungi Anda.
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: '24px' }}>
        {/* Image placeholder */}
        <div
          style={{
            backgroundColor: c.cardBgHover,
            borderRadius: '12px',
            border: `1px solid ${c.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minHeight: isMobile ? '200px' : '320px',
            fontSize: '80px',
          }}
        >
          {item.emoji}
        </div>

        {/* Details */}
        <div
          style={{
            backgroundColor: c.cardBg,
            borderRadius: '12px',
            border: `1px solid ${c.border}`,
            padding: isMobile ? '20px' : '28px',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px',
          }}
        >
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
              <span style={{ fontSize: '12px', fontWeight: '600', color: categoryInfo?.emoji ? c.textMuted : c.textMuted }}>
                {categoryInfo?.emoji} {categoryInfo?.label}
              </span>
              {item.badge && (
                <span
                  style={{
                    fontSize: '11px',
                    fontWeight: '600',
                    padding: '3px 8px',
                    borderRadius: '4px',
                    backgroundColor: badgeColors[item.badge]?.bg || '#F1F5F9',
                    color: badgeColors[item.badge]?.text || '#64748B',
                  }}
                >
                  {item.badge}
                </span>
              )}
            </div>
            <h1 style={{ fontSize: isMobile ? '22px' : '26px', fontWeight: '700', color: c.textPrimary, margin: 0, lineHeight: '1.3' }}>
              {item.name}
            </h1>
          </div>

          {/* Rating */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  style={{
                    width: '16px',
                    height: '16px',
                    fill: i < Math.floor(item.rating) ? '#F59E0B' : 'none',
                    color: i < Math.floor(item.rating) ? '#F59E0B' : '#D1D5DB',
                  }}
                />
              ))}
            </div>
            <span style={{ fontSize: '14px', fontWeight: '600', color: c.textPrimary }}>{item.rating}</span>
            <span style={{ fontSize: '13px', color: c.textMuted }}>({item.reviewCount} reviews)</span>
          </div>

          {/* Description */}
          <p style={{ fontSize: '15px', lineHeight: '1.7', color: c.textSecondary, margin: 0 }}>
            {item.description}
          </p>

          {/* Seller info */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '12px', backgroundColor: c.cardBgHover, borderRadius: '8px' }}>
            <MapPin style={{ width: '16px', height: '16px', color: c.textMuted, flexShrink: 0 }} />
            <div>
              <p style={{ fontSize: '13px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>{item.vendor}</p>
              {item.city && <p style={{ fontSize: '12px', color: c.textMuted, margin: '2px 0 0 0' }}>{item.city}</p>}
            </div>
          </div>

          {/* Details */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {Object.entries(item.details).map(([key, value]) => (
              <div key={key} style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderBottom: `1px solid ${c.borderLight}` }}>
                <span style={{ fontSize: '13px', color: c.textMuted }}>{key}</span>
                <span style={{ fontSize: '13px', fontWeight: '600', color: c.textPrimary }}>{value}</span>
              </div>
            ))}
          </div>

          {/* Tags */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
            <Tag style={{ width: '14px', height: '14px', color: c.textMuted }} />
            {item.tags.map(tag => (
              <span key={tag} style={{ fontSize: '12px', padding: '3px 8px', borderRadius: '4px', backgroundColor: c.cardBgHover, color: c.textMuted }}>
                {tag}
              </span>
            ))}
          </div>

          {/* Price + CTA */}
          <div
            style={{
              marginTop: 'auto',
              padding: '16px',
              backgroundColor: c.primaryLight,
              borderRadius: '10px',
              display: 'flex',
              alignItems: isMobile ? 'flex-start' : 'center',
              justifyContent: 'space-between',
              flexDirection: isMobile ? 'column' : 'row',
              gap: '12px',
            }}
          >
            <div>
              <p style={{ fontSize: '12px', color: c.textMuted, margin: 0 }}>Harga</p>
              <p style={{ fontSize: '24px', fontWeight: '700', color: c.primary, margin: '2px 0 0 0' }}>
                {item.price}
                <span style={{ fontSize: '14px', fontWeight: '400', color: c.textMuted }}> {item.priceUnit}</span>
              </p>
            </div>
            <button
              onClick={handleOrder}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                padding: '12px 24px',
                fontSize: '14px',
                fontWeight: '600',
                backgroundColor: c.primary,
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                width: isMobile ? '100%' : 'auto',
                whiteSpace: 'nowrap',
              }}
            >
              <ShoppingCart style={{ width: '18px', height: '18px' }} />
              Pesan Sekarang
            </button>
          </div>
        </div>
      </div>

      {/* Related items */}
      {relatedItems.length > 0 && (
        <div>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: c.textPrimary, margin: '0 0 16px 0' }}>
            Produk Terkait
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: '16px',
            }}
          >
            {relatedItems.map(related => {
              const relBadge = related.badge ? badgeColors[related.badge] : null;
              return (
                <Link key={related.id} href={`/marketplace/${related.id}`} style={{ textDecoration: 'none' }}>
                  <div
                    style={{
                      backgroundColor: c.cardBg,
                      borderRadius: '12px',
                      border: `1px solid ${c.border}`,
                      overflow: 'hidden',
                      cursor: 'pointer',
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                    }}
                  >
                    <div style={{ padding: '20px', textAlign: 'center', backgroundColor: c.cardBgHover, fontSize: '40px' }}>
                      {related.emoji}
                    </div>
                    <div style={{ padding: '14px', flex: 1 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '6px' }}>
                        {related.badge && relBadge && (
                          <span style={{ fontSize: '10px', fontWeight: '600', padding: '2px 6px', borderRadius: '4px', backgroundColor: relBadge.bg, color: relBadge.text }}>
                            {related.badge}
                          </span>
                        )}
                      </div>
                      <h3 style={{ fontSize: '14px', fontWeight: '600', color: c.textPrimary, margin: '0 0 4px 0' }}>{related.name}</h3>
                      <p style={{ fontSize: '12px', color: c.textMuted, margin: '0 0 8px 0' }}>{related.vendor}</p>
                      <p style={{ fontSize: '15px', fontWeight: '700', color: c.primary, margin: 0 }}>
                        {related.price} <span style={{ fontSize: '12px', fontWeight: '400', color: c.textMuted }}>{related.priceUnit}</span>
                      </p>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
