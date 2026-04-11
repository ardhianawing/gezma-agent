'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Plus, Star, Plane, Clock, ArrowRight, Blocks, Package as PackageIcon, Crown, Sun, Globe } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';
import { PageHeader } from '@/components/layout/page-header';
import { formatCurrency } from '@/lib/utils';
import { useTheme } from '@/lib/theme';
import { useLanguage } from '@/lib/i18n';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { usePermission, PERMISSIONS } from '@/lib/hooks/use-permissions';
import type { Package } from '@/types/package';
import { CardSkeleton } from '@/components/shared/loading-skeleton';

type PackageType = 'REGULER' | 'VIP' | 'EKONOMI' | 'SEASONAL' | 'PLUS';

function getPackageGradient(category: string): string {
  const upper = (category || '').toUpperCase();
  if (upper.includes('VIP')) return 'linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)';
  if (upper.includes('EKONOMI') || upper.includes('BUDGET')) return 'linear-gradient(135deg, #059669 0%, #064E3B 100%)';
  if (upper.includes('SEASONAL') || upper.includes('RAMADHAN')) return 'linear-gradient(135deg, #D97706 0%, #92400E 100%)';
  if (upper.includes('PLUS')) return 'linear-gradient(135deg, #2563EB 0%, #1E3A8A 100%)';
  if (upper.includes('REGULER') || upper.includes('REGULAR')) return 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)';
  return 'linear-gradient(135deg, #6B7280 0%, #374151 100%)';
}

function getPackageIcon(category: string) {
  const upper = (category || '').toUpperCase();
  const iconStyle = { width: '80px', height: '80px', color: 'white', opacity: 0.2 };
  if (upper.includes('VIP')) return <Crown style={iconStyle} />;
  if (upper.includes('EKONOMI') || upper.includes('BUDGET')) return <Globe style={iconStyle} />;
  if (upper.includes('SEASONAL') || upper.includes('RAMADHAN')) return <Sun style={iconStyle} />;
  if (upper.includes('PLUS')) return <Star style={iconStyle} />;
  return <Plane style={iconStyle} />;
}

type BadgeConfig = { label: string; bg: string; color: string } | null;

function getPackageBadge(category: string): BadgeConfig {
  const upper = (category || '').toUpperCase();
  if (upper.includes('VIP')) return { label: 'Premium', bg: '#7C3AED', color: 'white' };
  if (upper.includes('EKONOMI') || upper.includes('BUDGET')) return { label: 'Best Value', bg: '#059669', color: 'white' };
  return null;
}

function StarRating({ rating, borderColor }: { rating: number; borderColor: string }) {
  const maxStars = 5;
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
      {Array.from({ length: maxStars }).map((_, i) => (
        <span
          key={i}
          style={{
            fontSize: '16px',
            lineHeight: 1,
            color: i < rating ? '#F59E0B' : borderColor,
          }}
        >
          ★
        </span>
      ))}
    </div>
  );
}

export default function PackagesPage() {
  const { c } = useTheme();
  const { t } = useLanguage();
  const { isMobile } = useResponsive();
  const { can } = usePermission();

  const [packages, setPackages] = useState<Package[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');

  const fetchPackages = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (category) params.set('category', category);

      const res = await fetch(`/api/packages?${params}`);
      if (res.ok) {
        const json = await res.json();
        setPackages(json.data);
      }
    } catch (err) {
      console.error('Failed to fetch packages:', err);
    } finally {
      setLoading(false);
    }
  }, [search, category]);

  useEffect(() => {
    const timer = setTimeout(() => fetchPackages(), 300);
    return () => clearTimeout(timer);
  }, [fetchPackages]);

  const gridColumns = isMobile ? '1fr' : 'repeat(2, 1fr)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '24px' }}>
      <PageHeader
        title={t.packages.title}
        description={t.packages.description}
        actions={
          can(PERMISSIONS.PACKAGES_CREATE) ? (
          <div style={{ display: 'flex', gap: '8px', flexDirection: isMobile ? 'column' : 'row', width: isMobile ? '100%' : 'auto' }}>
            <Link href="/packages/builder" style={{ width: isMobile ? '100%' : 'auto', display: 'block' }}>
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: c.cardBg,
                  color: c.primary,
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: `1px solid ${c.primary}`,
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  width: isMobile ? '100%' : 'auto',
                }}
              >
                <Blocks style={{ width: '20px', height: '20px' }} />
                <span>Builder Paket Modular</span>
              </button>
            </Link>
            <Link href="/packages/new" style={{ width: isMobile ? '100%' : 'auto', display: 'block' }}>
              <button
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  backgroundColor: c.primary,
                  color: 'white',
                  padding: '10px 16px',
                  borderRadius: '8px',
                  border: 'none',
                  fontWeight: '500',
                  cursor: 'pointer',
                  transition: 'background-color 0.2s',
                  width: isMobile ? '100%' : 'auto',
                }}
              >
                <Plus style={{ width: '20px', height: '20px' }} />
                <span>{t.packages.createPackage}</span>
              </button>
            </Link>
          </div>
          ) : undefined
        }
      />

      {/* Search & Filter */}
      <div style={{ display: 'flex', gap: '12px', flexDirection: isMobile ? 'column' : 'row' }}>
        <input
          type="text"
          placeholder="Cari paket..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            flex: 1,
            height: '44px',
            padding: '0 16px',
            fontSize: '14px',
            border: `1px solid ${c.border}`,
            borderRadius: '8px',
            outline: 'none',
            backgroundColor: c.cardBg,
            color: c.textPrimary,
          }}
        />
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value)}
          style={{
            height: '44px',
            padding: '0 16px',
            fontSize: '14px',
            color: c.textSecondary,
            backgroundColor: c.cardBg,
            border: `1px solid ${c.border}`,
            borderRadius: '8px',
            cursor: 'pointer',
            width: isMobile ? '100%' : 'auto',
          }}
        >
          <option value="">Semua Kategori</option>
          <option value="regular">Regular</option>
          <option value="plus">Plus</option>
          <option value="vip">VIP</option>
          <option value="ramadhan">Ramadhan</option>
          <option value="budget">Budget</option>
        </select>
      </div>

      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: gridColumns, gap: isMobile ? '16px' : '20px' }}>
          {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
        </div>
      ) : packages.length === 0 ? (
        <EmptyState
          icon={PackageIcon}
          title={search || category ? 'Tidak ada paket yang cocok' : 'Belum ada paket'}
          description={search || category ? 'Coba ubah filter pencarian Anda.' : undefined}
        />
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: gridColumns,
            gap: isMobile ? '16px' : '20px',
          }}
        >
          {packages.map((pkg) => {
            const gradient = getPackageGradient(pkg.category);
            const badge = getPackageBadge(pkg.category);
            return (
              <Link key={pkg.id} href={`/packages/${pkg.id}`} style={{ textDecoration: 'none' }}>
                <div
                  style={{
                    backgroundColor: c.cardBg,
                    borderRadius: '12px',
                    border: `1px solid ${c.border}`,
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    height: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    position: 'relative',
                  }}
                >
                  {/* Gradient image header */}
                  <div
                    style={{
                      height: '120px',
                      background: gradient,
                      position: 'relative',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                    }}
                  >
                    {/* Large background icon */}
                    <div style={{ position: 'absolute', bottom: '-8px', right: '-8px' }}>
                      {getPackageIcon(pkg.category)}
                    </div>

                    {/* Category label */}
                    <div style={{ position: 'absolute', top: '12px', left: '14px' }}>
                      <span
                        style={{
                          color: 'white',
                          fontWeight: '700',
                          fontSize: '11px',
                          textTransform: 'uppercase',
                          letterSpacing: '0.08em',
                          opacity: 0.9,
                          background: 'rgba(0,0,0,0.2)',
                          padding: '3px 8px',
                          borderRadius: '4px',
                        }}
                      >
                        {pkg.category}
                      </span>
                    </div>

                    {/* Promo tag */}
                    {pkg.isPromo && (
                      <div style={{ position: 'absolute', bottom: '12px', left: '14px' }}>
                        <span
                          style={{
                            backgroundColor: 'rgba(255,255,255,0.25)',
                            color: 'white',
                            fontSize: '11px',
                            fontWeight: '600',
                            padding: '3px 8px',
                            borderRadius: '4px',
                          }}
                        >
                          Promo
                        </span>
                      </div>
                    )}

                    {/* Package name in header */}
                    <div style={{ padding: '0 14px', textAlign: 'center', zIndex: 1 }}>
                      <h3
                        style={{
                          fontWeight: '700',
                          fontSize: isMobile ? '15px' : '16px',
                          color: 'white',
                          margin: 0,
                          textShadow: '0 1px 3px rgba(0,0,0,0.3)',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                        }}
                      >
                        {pkg.name}
                      </h3>
                    </div>
                  </div>

                  {/* Badge — Premium / Best Value */}
                  {badge && (
                    <div
                      style={{
                        position: 'absolute',
                        top: '8px',
                        right: '8px',
                        backgroundColor: badge.bg,
                        color: badge.color,
                        fontSize: '11px',
                        fontWeight: '700',
                        padding: '4px 10px',
                        borderRadius: '12px',
                        boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                        letterSpacing: '0.03em',
                        zIndex: 2,
                      }}
                    >
                      {badge.label}
                    </div>
                  )}

                  {/* Description */}
                  <div style={{ padding: isMobile ? '14px 16px 10px' : '16px 20px 12px' }}>
                    <p
                      style={{
                        fontSize: '13px',
                        color: c.textSecondary,
                        margin: 0,
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                        lineHeight: '1.5',
                      }}
                    >
                      {pkg.description}
                    </p>
                  </div>

                  {/* Features */}
                  <div style={{ padding: isMobile ? '0 16px 14px' : '0 20px 16px', display: 'flex', flexDirection: 'column', gap: '10px', flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: c.infoLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Clock style={{ width: '15px', height: '15px', color: c.info }} />
                      </div>
                      <div>
                        <p style={{ fontSize: '11px', color: c.textMuted, margin: 0 }}>{t.packages.duration}</p>
                        <p style={{ fontSize: '13px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>
                          {pkg.duration} {t.packages.days}
                        </p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: c.successLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Plane style={{ width: '15px', height: '15px', color: c.success }} />
                      </div>
                      <div>
                        <p style={{ fontSize: '11px', color: c.textMuted, margin: 0 }}>{t.packages.airline}</p>
                        <p style={{ fontSize: '13px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>{pkg.airline}</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '30px', height: '30px', borderRadius: '8px', backgroundColor: c.warningLight, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                        <Star style={{ width: '15px', height: '15px', color: c.warning }} />
                      </div>
                      <div>
                        <p style={{ fontSize: '11px', color: c.textMuted, margin: 0 }}>{t.packages.hotelRating}</p>
                        <StarRating rating={pkg.makkahHotelRating} borderColor={c.border} />
                      </div>
                    </div>
                  </div>

                  {/* Footer with price */}
                  <div
                    style={{
                      padding: isMobile ? '12px 16px' : '14px 20px',
                      borderTop: `1px solid ${c.borderLight}`,
                      backgroundColor: c.cardBgHover,
                      marginTop: 'auto',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        alignItems: isMobile ? 'flex-start' : 'center',
                        justifyContent: 'space-between',
                        flexDirection: isMobile ? 'column' : 'row',
                        gap: isMobile ? '10px' : '0',
                      }}
                    >
                      <div>
                        <p style={{ fontSize: '11px', color: c.textMuted, marginBottom: '2px' }}>{t.packages.startingFrom}</p>
                        {pkg.isPromo && pkg.promoPrice && (
                          <p style={{ fontSize: '13px', color: c.textLight, textDecoration: 'line-through', margin: 0 }}>
                            {formatCurrency(pkg.publishedPrice)}
                          </p>
                        )}
                        <p style={{ fontSize: '18px', fontWeight: '700', color: c.primary, margin: 0 }}>
                          {formatCurrency(pkg.isPromo && pkg.promoPrice ? pkg.promoPrice : pkg.publishedPrice)}
                        </p>
                      </div>
                      <button
                        style={{
                          display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px',
                          padding: '8px 14px', fontSize: '13px', fontWeight: '500', color: c.textSecondary,
                          backgroundColor: c.cardBg, border: `1px solid ${c.border}`, borderRadius: '6px',
                          cursor: 'pointer', width: isMobile ? '100%' : 'auto',
                        }}
                      >
                        {t.packages.viewDetails}
                        <ArrowRight style={{ width: '13px', height: '13px' }} />
                      </button>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
