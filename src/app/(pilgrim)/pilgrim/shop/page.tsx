'use client';

import { useState, useMemo } from 'react';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { shopProducts, shopCategories, type ShopCategory } from '@/data/mock-shop';

const GREEN = '#059669';
const GREEN_DARK = '#047857';
const GREEN_LIGHT = '#ECFDF5';

function formatRupiah(price: number): string {
  return 'Rp ' + price.toLocaleString('id-ID');
}

export default function ShopPage() {
  const { c } = useTheme();
  const { isMobile, isTablet } = useResponsive();
  const [activeCategory, setActiveCategory] = useState<ShopCategory>('semua');
  const [cartCount, setCartCount] = useState(0);
  const [hoveredProduct, setHoveredProduct] = useState<string | null>(null);

  const filteredProducts = useMemo(() => {
    if (activeCategory === 'semua') return shopProducts;
    return shopProducts.filter(p => p.category === activeCategory);
  }, [activeCategory]);

  const getGridColumns = (): string => {
    if (isMobile) return 'repeat(2, 1fr)';
    if (isTablet) return 'repeat(3, 1fr)';
    return 'repeat(4, 1fr)';
  };

  const cardStyle: React.CSSProperties = {
    backgroundColor: c.cardBg,
    border: '1px solid ' + c.border,
    borderRadius: '16px',
    padding: '20px',
  };

  const categoryLabel = (cat: ShopCategory): string => {
    const found = shopCategories.find(sc => sc.id === cat);
    return found ? found.label : cat;
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', paddingBottom: '80px' }}>
      {/* Header with cart */}
      <div style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
      }}>
        <div>
          <h1 style={{
            fontSize: isMobile ? '22px' : '26px',
            fontWeight: 700,
            color: c.textPrimary,
            margin: '0 0 4px 0',
          }}>
            {'\u{1F6CD}\u{FE0F}'} Toko Perlengkapan
          </h1>
          <p style={{ fontSize: '14px', color: c.textMuted, margin: 0 }}>
            Belanja kebutuhan haji dan umrah Anda
          </p>
        </div>

        {/* Cart counter */}
        <button
          onClick={() => {
            if (cartCount > 0) {
              alert('Keranjang belanja: ' + cartCount + ' item');
            } else {
              alert('Keranjang belanja kosong');
            }
          }}
          style={{
            position: 'relative',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: '44px',
            height: '44px',
            borderRadius: '12px',
            backgroundColor: c.cardBg,
            border: '1px solid ' + c.border,
            cursor: 'pointer',
            fontSize: '22px',
            flexShrink: 0,
          }}
        >
          {'\u{1F6D2}'}
          {cartCount > 0 && (
            <span style={{
              position: 'absolute',
              top: '-6px',
              right: '-6px',
              minWidth: '20px',
              height: '20px',
              borderRadius: '10px',
              backgroundColor: GREEN,
              color: 'white',
              fontSize: '11px',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '0 4px',
            }}>
              {cartCount}
            </span>
          )}
        </button>
      </div>

      {/* Category Filter Pills */}
      <div style={{
        display: 'flex',
        gap: '8px',
        overflowX: 'auto',
        paddingBottom: '4px',
        scrollbarWidth: 'none',
      }}>
        {shopCategories.map((cat) => {
          const isActive = activeCategory === cat.id;
          return (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              style={{
                padding: '8px 18px',
                borderRadius: '20px',
                border: isActive ? 'none' : '1px solid ' + c.border,
                backgroundColor: isActive ? GREEN : c.cardBg,
                color: isActive ? '#FFFFFF' : c.textSecondary,
                fontSize: '13px',
                fontWeight: isActive ? 600 : 400,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                flexShrink: 0,
                transition: 'all 0.15s',
              }}
            >
              {cat.label}
            </button>
          );
        })}
      </div>

      {/* Product count */}
      <p style={{
        fontSize: '13px',
        color: c.textMuted,
        margin: 0,
      }}>
        Menampilkan {filteredProducts.length} produk
      </p>

      {/* Product Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: getGridColumns(),
        gap: isMobile ? '12px' : '16px',
      }}>
        {filteredProducts.map((product) => (
          <div
            key={product.id}
            style={{
              backgroundColor: c.cardBg,
              border: '1px solid ' + c.border,
              borderRadius: '16px',
              padding: isMobile ? '14px' : '18px',
              display: 'flex',
              flexDirection: 'column',
              gap: '10px',
              transition: 'all 0.2s ease',
              transform: hoveredProduct === product.id ? 'translateY(-4px)' : 'none',
              boxShadow: hoveredProduct === product.id ? '0 8px 25px rgba(0,0,0,0.08)' : 'none',
            }}
            onMouseEnter={() => setHoveredProduct(product.id)}
            onMouseLeave={() => setHoveredProduct(null)}
          >
            {/* Product image */}
            {product.imageUrl ? (
              <img
                src={product.imageUrl}
                alt={product.name}
                style={{
                  width: '100%',
                  height: isMobile ? '80px' : '100px',
                  borderRadius: '12px',
                  objectFit: 'cover',
                }}
              />
            ) : (
              <div style={{
                width: '100%',
                height: isMobile ? '80px' : '100px',
                backgroundColor: GREEN_LIGHT,
                borderRadius: '12px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: isMobile ? '36px' : '44px',
              }}>
                {product.emoji}
              </div>
            )}

            {/* Category badge */}
            <span style={{
              alignSelf: 'flex-start',
              fontSize: '10px',
              fontWeight: 600,
              color: GREEN,
              backgroundColor: GREEN_LIGHT,
              padding: '3px 8px',
              borderRadius: '8px',
              textTransform: 'capitalize',
            }}>
              {categoryLabel(product.category)}
            </span>

            {/* Product name */}
            <h3 style={{
              fontSize: isMobile ? '13px' : '14px',
              fontWeight: 600,
              color: c.textPrimary,
              margin: 0,
              lineHeight: 1.4,
              display: '-webkit-box',
              WebkitLineClamp: 2,
              WebkitBoxOrient: 'vertical',
              overflow: 'hidden',
            }}>
              {product.name}
            </h3>

            {/* Price */}
            <p style={{
              fontSize: isMobile ? '15px' : '16px',
              fontWeight: 700,
              color: GREEN,
              margin: 0,
            }}>
              {formatRupiah(product.price)}
            </p>

            {/* Add to cart button */}
            <button
              onClick={() => {
                setCartCount(prev => prev + 1);
              }}
              style={{
                width: '100%',
                padding: isMobile ? '8px' : '10px',
                fontSize: isMobile ? '12px' : '13px',
                fontWeight: 600,
                color: GREEN,
                backgroundColor: GREEN_LIGHT,
                border: '1px solid ' + GREEN + '40',
                borderRadius: '10px',
                cursor: 'pointer',
                transition: 'all 0.15s',
                marginTop: 'auto',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = GREEN;
                e.currentTarget.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = GREEN_LIGHT;
                e.currentTarget.style.color = GREEN;
              }}
            >
              Tambah ke Keranjang
            </button>
          </div>
        ))}
      </div>

      {filteredProducts.length === 0 && (
        <div style={{
          textAlign: 'center',
          padding: '40px 20px',
          color: c.textMuted,
        }}>
          <span style={{ fontSize: '48px', display: 'block', marginBottom: '12px' }}>{'\u{1F6D2}'}</span>
          <p style={{ fontSize: '14px', margin: 0 }}>Tidak ada produk di kategori ini</p>
        </div>
      )}
    </div>
  );
}
