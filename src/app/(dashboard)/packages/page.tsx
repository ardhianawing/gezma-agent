'use client';

import Link from 'next/link';
import { Plus, Star, Plane, Clock, ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { mockPackages } from '@/data/mock-packages';
import { formatCurrency } from '@/lib/utils';
import { useTheme } from '@/lib/theme';
import { useLanguage } from '@/lib/i18n';
import { useResponsive } from '@/lib/hooks/use-responsive';

export default function PackagesPage() {
  const { c } = useTheme();
  const { t } = useLanguage();
  const { isMobile, isTablet } = useResponsive();

  // Responsive grid columns - use auto-fill for better tablet support
  const gridColumns = isMobile ? '1fr' : 'repeat(auto-fill, minmax(300px, 1fr))';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '24px' }}>
      <PageHeader
        title={t.packages.title}
        description={t.packages.description}
        actions={
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
        }
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: gridColumns,
          gap: isMobile ? '16px' : '20px',
        }}
      >
        {mockPackages.map((pkg) => (
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
              }}
            >
              {/* Header with gradient */}
              <div
                style={{
                  padding: isMobile ? '16px' : '20px',
                  paddingBottom: '16px',
                  background: `linear-gradient(to bottom right, ${c.cardBgHover}, ${c.cardBg})`,
                  borderBottom: `1px solid ${c.borderLight}`,
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    marginBottom: '12px',
                  }}
                >
                  <div>
                    <h3
                      style={{
                        fontWeight: '700',
                        fontSize: '14px',
                        color: c.textPrimary,
                        margin: 0,
                      }}
                    >
                      {pkg.name}
                    </h3>
                    <p
                      style={{
                        fontSize: '12px',
                        color: c.textMuted,
                        marginTop: '2px',
                        textTransform: 'uppercase',
                        letterSpacing: '0.05em',
                        fontWeight: '500',
                      }}
                    >
                      {pkg.category}
                    </p>
                  </div>
                  {pkg.isPromo && (
                    <span
                      style={{
                        backgroundColor: c.primaryLight,
                        color: c.primary,
                        fontSize: '12px',
                        fontWeight: '500',
                        padding: '4px 10px',
                        borderRadius: '12px',
                      }}
                    >
                      Promo
                    </span>
                  )}
                </div>
                <p
                  style={{
                    fontSize: '14px',
                    color: c.textSecondary,
                    margin: 0,
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden',
                  }}
                >
                  {pkg.description}
                </p>
              </div>

              {/* Features */}
              <div
                style={{
                  padding: isMobile ? '16px' : '20px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  flex: 1,
                }}
              >
                {/* Duration */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: c.infoLight,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Clock style={{ width: '16px', height: '16px', color: c.info }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: c.textMuted, margin: 0 }}>{t.packages.duration}</p>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>
                      {pkg.duration} {t.packages.days}
                    </p>
                  </div>
                </div>

                {/* Airline */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: c.successLight,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Plane style={{ width: '16px', height: '16px', color: c.success }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: c.textMuted, margin: 0 }}>{t.packages.airline}</p>
                    <p style={{ fontSize: '14px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>
                      {pkg.airline}
                    </p>
                  </div>
                </div>

                {/* Hotel Rating */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div
                    style={{
                      width: '32px',
                      height: '32px',
                      borderRadius: '8px',
                      backgroundColor: c.warningLight,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                    }}
                  >
                    <Star style={{ width: '16px', height: '16px', color: c.warning }} />
                  </div>
                  <div>
                    <p style={{ fontSize: '12px', color: c.textMuted, margin: 0 }}>{t.packages.hotelRating}</p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                      {[...Array(pkg.makkahHotelRating)].map((_, i) => (
                        <Star
                          key={i}
                          style={{
                            width: '14px',
                            height: '14px',
                            fill: c.warning,
                            color: c.warning,
                          }}
                        />
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Footer with price */}
              <div
                style={{
                  padding: isMobile ? '16px' : '20px',
                  paddingTop: '16px',
                  borderTop: `1px solid ${c.borderLight}`,
                  backgroundColor: c.cardBgHover,
                  marginTop: 'auto',
                }}
              >
                <div
                  style={{
                    display: 'flex',
                    alignItems: isMobile ? 'flex-start' : 'flex-end',
                    justifyContent: 'space-between',
                    flexDirection: isMobile ? 'column' : 'row',
                    gap: isMobile ? '12px' : '0',
                  }}
                >
                  <div>
                    <p style={{ fontSize: '12px', color: c.textMuted, marginBottom: '4px' }}>
                      {t.packages.startingFrom}
                    </p>
                    {pkg.isPromo && pkg.promoPrice && (
                      <p
                        style={{
                          fontSize: '14px',
                          color: c.textLight,
                          textDecoration: 'line-through',
                          margin: 0,
                        }}
                      >
                        {formatCurrency(pkg.publishedPrice)}
                      </p>
                    )}
                    <p
                      style={{
                        fontSize: '18px',
                        fontWeight: '700',
                        color: c.primary,
                        margin: 0,
                      }}
                    >
                      {formatCurrency(pkg.isPromo && pkg.promoPrice ? pkg.promoPrice : pkg.publishedPrice)}
                    </p>
                  </div>
                  <button
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px',
                      padding: '8px 12px',
                      fontSize: '14px',
                      fontWeight: '500',
                      color: c.textSecondary,
                      backgroundColor: c.cardBg,
                      border: `1px solid ${c.border}`,
                      borderRadius: '6px',
                      cursor: 'pointer',
                      width: isMobile ? '100%' : 'auto',
                    }}
                  >
                    {t.packages.viewDetails}
                    <ArrowRight style={{ width: '14px', height: '14px' }} />
                  </button>
                </div>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
