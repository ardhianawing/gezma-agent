'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { MapPin, Phone, Mail, Globe, Shield, Star, Users, Plane } from 'lucide-react';

interface AgencyPublicData {
  agency: {
    id: string;
    name: string;
    legalName: string;
    tagline: string | null;
    description: string | null;
    logoUrl: string | null;
    phone: string;
    email: string;
    website: string | null;
    whatsapp: string | null;
    city: string | null;
    province: string | null;
    address: string | null;
    ppiuNumber: string | null;
    primaryColor: string;
    isVerified: boolean;
  };
  packages: {
    id: string;
    name: string;
    category: string;
    duration: number;
    publishedPrice: number;
    thumbnailUrl: string | null;
    slug: string;
  }[];
  testimonials: {
    id: string;
    rating: number;
    comment: string;
    pilgrimName: string;
    createdAt: string;
  }[];
  stats: {
    pilgrimCount: number;
    tripCount: number;
    avgRating: number;
    reviewCount: number;
  };
}

const PRIMARY = '#1E40AF';
const PRIMARY_LIGHT = '#EFF6FF';
const BG = '#F9FAFB';
const CARD_BG = '#FFFFFF';
const BORDER = '#E5E7EB';
const TEXT_PRIMARY = '#111827';
const TEXT_SECONDARY = '#6B7280';
const TEXT_MUTED = '#9CA3AF';
const STAR_COLOR = '#F59E0B';

function formatPrice(price: number): string {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', maximumFractionDigits: 0 }).format(price);
}

function categoryLabel(cat: string): string {
  const map: Record<string, string> = {
    regular: 'Regular',
    plus: 'Plus',
    vip: 'VIP',
    ramadhan: 'Ramadhan',
    budget: 'Budget',
  };
  return map[cat] || cat;
}

function StarRating({ rating }: { rating: number }) {
  return (
    <span style={{ display: 'inline-flex', gap: '2px' }}>
      {[1, 2, 3, 4, 5].map(i => (
        <Star
          key={i}
          style={{
            width: '14px',
            height: '14px',
            color: i <= rating ? STAR_COLOR : '#D1D5DB',
            fill: i <= rating ? STAR_COLOR : 'none',
          }}
        />
      ))}
    </span>
  );
}

export default function PublicAgencyProfilePage() {
  const params = useParams();
  const slug = params?.slug as string;
  const [data, setData] = useState<AgencyPublicData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    fetch(`/api/agency/public/${slug}`)
      .then(res => {
        if (!res.ok) throw new Error('Tidak ditemukan');
        return res.json();
      })
      .then(setData)
      .catch(() => setError('Agency tidak ditemukan'))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: BG,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}>
        <p style={{ color: TEXT_SECONDARY, fontSize: '16px' }}>Memuat profil agency...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{
        minHeight: '100vh',
        backgroundColor: BG,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
      }}>
        <div style={{ textAlign: 'center' }}>
          <h1 style={{ fontSize: '24px', color: TEXT_PRIMARY, margin: '0 0 8px 0' }}>404</h1>
          <p style={{ color: TEXT_SECONDARY }}>{error || 'Agency tidak ditemukan'}</p>
        </div>
      </div>
    );
  }

  const { agency, packages, testimonials, stats } = data;
  const accentColor = agency.primaryColor || PRIMARY;

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: BG,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
      {/* Hero Section */}
      <div style={{
        background: `linear-gradient(135deg, ${accentColor}, ${accentColor}CC)`,
        padding: '48px 24px',
        textAlign: 'center',
        color: 'white',
      }}>
        {/* Logo */}
        <div style={{
          width: '80px',
          height: '80px',
          borderRadius: '20px',
          backgroundColor: 'rgba(255,255,255,0.2)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          margin: '0 auto 16px auto',
          border: '2px solid rgba(255,255,255,0.3)',
          overflow: 'hidden',
        }}>
          {agency.logoUrl ? (
            <img src={agency.logoUrl} alt={agency.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
          ) : (
            <span style={{ fontSize: '32px', fontWeight: 700 }}>{agency.name.charAt(0)}</span>
          )}
        </div>

        <h1 style={{ fontSize: '28px', fontWeight: 700, margin: '0 0 4px 0' }}>
          {agency.name}
        </h1>
        <p style={{ fontSize: '14px', opacity: 0.85, margin: '0 0 8px 0' }}>
          {agency.legalName}
        </p>

        {agency.isVerified && (
          <span style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            backgroundColor: 'rgba(255,255,255,0.2)',
            padding: '4px 12px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 600,
            marginBottom: '8px',
          }}>
            <Shield style={{ width: '12px', height: '12px' }} />
            Terverifikasi
          </span>
        )}

        {agency.ppiuNumber && (
          <p style={{ fontSize: '12px', opacity: 0.8, margin: '8px 0 0 0' }}>
            PPIU: {agency.ppiuNumber}
          </p>
        )}

        {agency.tagline && (
          <p style={{ fontSize: '16px', fontWeight: 500, margin: '16px 0 0 0', opacity: 0.95 }}>
            {agency.tagline}
          </p>
        )}
      </div>

      {/* Content */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '24px 16px' }}>
        {/* Stats */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, 1fr)',
          gap: '12px',
          marginBottom: '24px',
        }}>
          {[
            { icon: Users, label: 'Jamaah', value: stats.pilgrimCount },
            { icon: Plane, label: 'Perjalanan', value: stats.tripCount },
            { icon: Star, label: 'Rating', value: stats.avgRating > 0 ? stats.avgRating.toFixed(1) : '-' },
            { icon: Star, label: 'Ulasan', value: stats.reviewCount },
          ].map((item, i) => {
            const Icon = item.icon;
            return (
              <div key={i} style={{
                backgroundColor: CARD_BG,
                borderRadius: '12px',
                border: `1px solid ${BORDER}`,
                padding: '16px',
                textAlign: 'center',
              }}>
                <Icon style={{ width: '20px', height: '20px', color: accentColor, margin: '0 auto 8px auto', display: 'block' }} />
                <p style={{ fontSize: '20px', fontWeight: 700, color: TEXT_PRIMARY, margin: '0 0 2px 0' }}>
                  {item.value}
                </p>
                <p style={{ fontSize: '11px', color: TEXT_MUTED, margin: 0 }}>{item.label}</p>
              </div>
            );
          })}
        </div>

        {/* Description */}
        {agency.description && (
          <div style={{
            backgroundColor: CARD_BG,
            borderRadius: '12px',
            border: `1px solid ${BORDER}`,
            padding: '20px',
            marginBottom: '24px',
          }}>
            <h2 style={{ fontSize: '16px', fontWeight: 600, color: TEXT_PRIMARY, margin: '0 0 12px 0' }}>
              Tentang Kami
            </h2>
            <p style={{ fontSize: '14px', color: TEXT_SECONDARY, lineHeight: 1.7, margin: 0, whiteSpace: 'pre-wrap' }}>
              {agency.description}
            </p>
          </div>
        )}

        {/* Contact Info */}
        <div style={{
          backgroundColor: CARD_BG,
          borderRadius: '12px',
          border: `1px solid ${BORDER}`,
          padding: '20px',
          marginBottom: '24px',
        }}>
          <h2 style={{ fontSize: '16px', fontWeight: 600, color: TEXT_PRIMARY, margin: '0 0 16px 0' }}>
            Kontak
          </h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Phone style={{ width: '16px', height: '16px', color: TEXT_MUTED, flexShrink: 0 }} />
              <span style={{ fontSize: '14px', color: TEXT_PRIMARY }}>{agency.phone}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <Mail style={{ width: '16px', height: '16px', color: TEXT_MUTED, flexShrink: 0 }} />
              <span style={{ fontSize: '14px', color: TEXT_PRIMARY }}>{agency.email}</span>
            </div>
            {agency.website && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <Globe style={{ width: '16px', height: '16px', color: TEXT_MUTED, flexShrink: 0 }} />
                <a href={agency.website} target="_blank" rel="noopener noreferrer" style={{ fontSize: '14px', color: accentColor, textDecoration: 'none' }}>
                  {agency.website}
                </a>
              </div>
            )}
            {agency.address && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                <MapPin style={{ width: '16px', height: '16px', color: TEXT_MUTED, flexShrink: 0 }} />
                <span style={{ fontSize: '14px', color: TEXT_PRIMARY }}>
                  {[agency.address, agency.city, agency.province].filter(Boolean).join(', ')}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Packages Grid */}
        {packages.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: TEXT_PRIMARY, margin: '0 0 16px 0' }}>
              Paket Umrah
            </h2>
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: '16px',
            }}>
              {packages.map(pkg => (
                <div key={pkg.id} style={{
                  backgroundColor: CARD_BG,
                  borderRadius: '12px',
                  border: `1px solid ${BORDER}`,
                  overflow: 'hidden',
                }}>
                  {/* Thumbnail */}
                  <div style={{
                    height: '140px',
                    backgroundColor: PRIMARY_LIGHT,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    overflow: 'hidden',
                  }}>
                    {pkg.thumbnailUrl ? (
                      <img src={pkg.thumbnailUrl} alt={pkg.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <Plane style={{ width: '32px', height: '32px', color: accentColor }} />
                    )}
                  </div>
                  <div style={{ padding: '16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{
                        fontSize: '10px',
                        fontWeight: 600,
                        padding: '2px 8px',
                        borderRadius: '6px',
                        backgroundColor: PRIMARY_LIGHT,
                        color: accentColor,
                        textTransform: 'uppercase',
                      }}>
                        {categoryLabel(pkg.category)}
                      </span>
                      <span style={{ fontSize: '11px', color: TEXT_MUTED }}>
                        {pkg.duration} hari
                      </span>
                    </div>
                    <h3 style={{ fontSize: '14px', fontWeight: 600, color: TEXT_PRIMARY, margin: '0 0 8px 0' }}>
                      {pkg.name}
                    </h3>
                    <p style={{ fontSize: '16px', fontWeight: 700, color: accentColor, margin: 0 }}>
                      {formatPrice(pkg.publishedPrice)}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Testimonials */}
        {testimonials.length > 0 && (
          <div style={{ marginBottom: '24px' }}>
            <h2 style={{ fontSize: '18px', fontWeight: 600, color: TEXT_PRIMARY, margin: '0 0 16px 0' }}>
              Testimoni Jamaah
            </h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {testimonials.map(t => (
                <div key={t.id} style={{
                  backgroundColor: CARD_BG,
                  borderRadius: '12px',
                  border: `1px solid ${BORDER}`,
                  padding: '16px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '8px' }}>
                    <span style={{ fontSize: '14px', fontWeight: 600, color: TEXT_PRIMARY }}>
                      {t.pilgrimName}
                    </span>
                    <StarRating rating={t.rating} />
                  </div>
                  <p style={{ fontSize: '13px', color: TEXT_SECONDARY, lineHeight: 1.6, margin: 0 }}>
                    {t.comment}
                  </p>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Footer */}
        <div style={{ textAlign: 'center', padding: '24px 0 16px 0' }}>
          <p style={{ fontSize: '12px', color: TEXT_MUTED }}>
            Powered by GEZMA Agent Platform
          </p>
        </div>
      </div>
    </div>
  );
}
