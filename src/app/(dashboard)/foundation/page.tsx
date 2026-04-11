'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Heart, TrendingUp, Users, Package, Building2, Flame, BookOpen, Stethoscope, GraduationCap, Briefcase, Star, HandHeart } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { useLanguage } from '@/lib/i18n';

interface CampaignPreview {
  id: string;
  title: string;
  category: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string | null;
  imageUrl: string | null;
  _count: { donations: number };
}

interface FoundationStats {
  activeCampaigns: number;
  totalRaised: number;
  totalDonors: number;
  goodsAvailable: number;
  activeFinancings: number;
  peopleImpacted: number;
}

const CATEGORY_GRADIENT: Record<string, string> = {
  masjid: 'linear-gradient(135deg, #16A34A 0%, #064E3B 100%)',
  bencana: 'linear-gradient(135deg, #DC2626 0%, #C2410C 100%)',
  yatim: 'linear-gradient(135deg, #7C3AED 0%, #4C1D95 100%)',
  kesehatan: 'linear-gradient(135deg, #0D9488 0%, #134E4A 100%)',
  pendidikan: 'linear-gradient(135deg, #D97706 0%, #92400E 100%)',
  pelatihan: 'linear-gradient(135deg, #DB2777 0%, #831843 100%)',
  umrah_dhuafa: 'linear-gradient(135deg, #4F46E5 0%, #1E1B4B 100%)',
};

const CATEGORY_DEFAULT_GRADIENT = 'linear-gradient(135deg, #6B7280 0%, #374151 100%)';

function formatRupiah(amount: number): string {
  if (amount >= 1_000_000_000) return `Rp ${(amount / 1_000_000_000).toFixed(1)}M`;
  if (amount >= 1_000_000) return `Rp ${(amount / 1_000_000).toFixed(1)}Jt`;
  if (amount >= 1_000) return `Rp ${(amount / 1_000).toFixed(0)}Rb`;
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

function getDaysLeft(deadline: string | null): number | null {
  if (!deadline) return null;
  const diff = new Date(deadline).getTime() - Date.now();
  return Math.max(0, Math.ceil(diff / 86_400_000));
}

export default function FoundationPage() {
  const { c } = useTheme();
  const { isMobile, isTablet } = useResponsive();
  const { t } = useLanguage();
  const router = useRouter();

  const [stats, setStats] = useState<FoundationStats | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignPreview[]>([]);
  const [loading, setLoading] = useState(true);
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const res = await fetch('/api/foundation/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data.stats);
          setCampaigns(data.recentCampaigns || []);
        }
      } catch {
        // silent
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const statCards = [
    {
      icon: TrendingUp,
      label: t.foundation.totalRaised,
      value: stats ? formatRupiah(stats.totalRaised) : '-',
      color: c.primary,
    },
    {
      icon: Heart,
      label: t.foundation.totalCampaigns,
      value: stats ? String(stats.activeCampaigns) : '-',
      color: '#DC2626',
    },
    {
      icon: Users,
      label: t.foundation.totalDonors,
      value: stats ? stats.totalDonors.toLocaleString('id-ID') : '-',
      color: '#2563EB',
    },
    {
      icon: Building2,
      label: t.foundation.totalImpact,
      value: stats ? stats.peopleImpacted.toLocaleString('id-ID') : '-',
      color: '#16A34A',
    },
  ];

  const quickLinks = [
    {
      label: t.foundation.tabCampaigns,
      desc: t.foundation.campaignsDesc,
      href: '/foundation/campaigns',
      icon: Heart,
      color: '#DC2626',
    },
    {
      label: t.foundation.tabGoods,
      desc: t.foundation.goodsDesc,
      href: '/foundation/goods',
      icon: Package,
      color: '#D97706',
    },
    {
      label: t.foundation.tabFinancing,
      desc: t.foundation.financingDesc,
      href: '/foundation/financing',
      icon: Building2,
      color: '#7C3AED',
    },
    {
      label: t.foundation.tabImpact,
      desc: t.foundation.impactDesc,
      href: '/foundation/impact',
      icon: TrendingUp,
      color: '#16A34A',
    },
  ];

  const gridCols = isMobile ? 2 : isTablet ? 2 : 4;
  const linkCols = isMobile ? 1 : 2;
  const campaignCols = isMobile ? 1 : isTablet ? 2 : 3;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <PageHeader
        title={t.foundation.title}
        description={t.foundation.description}
      />

      {/* Hero Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #7F1D1D 0%, #DC2626 50%, #EF4444 100%)',
          borderRadius: '16px',
          padding: isMobile ? '32px 24px' : '48px 48px',
          minHeight: isMobile ? '160px' : '200px',
          color: '#fff',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          gap: '24px',
          position: 'relative',
          overflow: 'hidden',
        }}
      >
        {/* Radial depth overlay */}
        <div
          style={{
            position: 'absolute',
            inset: 0,
            background: 'radial-gradient(ellipse at 70% 50%, rgba(239,68,68,0.35) 0%, transparent 70%)',
            pointerEvents: 'none',
          }}
        />
        {/* Decorative circles */}
        <div
          style={{
            position: 'absolute',
            top: '-40px',
            right: isMobile ? '-40px' : '120px',
            width: '180px',
            height: '180px',
            borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.12)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            top: '20px',
            right: isMobile ? '20px' : '200px',
            width: '90px',
            height: '90px',
            borderRadius: '50%',
            border: '2px solid rgba(255,255,255,0.08)',
            pointerEvents: 'none',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-30px',
            left: isMobile ? '-30px' : '30%',
            width: '120px',
            height: '120px',
            borderRadius: '50%',
            backgroundColor: 'rgba(255,255,255,0.05)',
            pointerEvents: 'none',
          }}
        />
        {/* Dot cluster top-right */}
        {!isMobile && (
          <div
            style={{
              position: 'absolute',
              top: '24px',
              right: '40px',
              display: 'grid',
              gridTemplateColumns: 'repeat(4, 8px)',
              gap: '6px',
              pointerEvents: 'none',
            }}
          >
            {Array.from({ length: 16 }).map((_, i) => (
              <div
                key={i}
                style={{
                  width: '4px',
                  height: '4px',
                  borderRadius: '50%',
                  backgroundColor: 'rgba(255,255,255,0.18)',
                }}
              />
            ))}
          </div>
        )}

        <div style={{ position: 'relative', zIndex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '10px' }}>
            <HandHeart style={{ width: isMobile ? '28px' : '36px', height: isMobile ? '28px' : '36px', color: 'rgba(255,255,255,0.75)' }} />
            <h2 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: 700, margin: 0 }}>
              {t.foundation.title}
            </h2>
          </div>
          <p style={{ fontSize: '14px', opacity: 0.85, margin: 0, maxWidth: '420px', lineHeight: '1.6' }}>
            {t.foundation.heroBannerSubtitle}
          </p>
        </div>
        <button
          onClick={() => router.push('/foundation/campaigns')}
          style={{
            position: 'relative',
            zIndex: 1,
            padding: '14px 36px',
            minHeight: '52px',
            borderRadius: '14px',
            border: 'none',
            backgroundColor: '#fff',
            color: '#DC2626',
            fontSize: '15px',
            fontWeight: 700,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'transform 0.15s, box-shadow 0.15s',
            boxShadow: '0 4px 16px rgba(0,0,0,0.15)',
            flexShrink: 0,
          }}
          onMouseEnter={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(-2px)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.2)';
          }}
          onMouseLeave={(e) => {
            (e.currentTarget as HTMLButtonElement).style.transform = 'translateY(0)';
            (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.15)';
          }}
        >
          {t.foundation.donateBtn}
        </button>
      </div>

      {/* Stats */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
          gap: '16px',
        }}
      >
        {statCards.map((card) => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              style={{
                backgroundColor: c.cardBg,
                border: '1px solid ' + c.border,
                borderLeft: `4px solid ${card.color}`,
                borderRadius: '14px',
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div
                style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '12px',
                  backgroundColor: card.color + '18',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon style={{ width: '32px', height: '32px', color: card.color }} />
              </div>
              <div>
                <p style={{ fontSize: '13px', color: c.textMuted, margin: '0 0 4px', fontWeight: 500 }}>
                  {card.label}
                </p>
                <p style={{ fontSize: '24px', fontWeight: 700, color: c.textPrimary, margin: 0 }}>
                  {loading ? '...' : card.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Quick Links */}
      <div>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: c.textPrimary, margin: '0 0 16px' }}>
          {t.foundation.modulesTitle}
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${linkCols}, 1fr)`,
            gap: '12px',
          }}
        >
          {quickLinks.map((link) => {
            const Icon = link.icon;
            const isHovered = hoveredCard === link.href;
            return (
              <div
                key={link.href}
                onClick={() => router.push(link.href)}
                onMouseEnter={() => setHoveredCard(link.href)}
                onMouseLeave={() => setHoveredCard(null)}
                style={{
                  backgroundColor: c.cardBg,
                  border: '1px solid ' + (isHovered ? link.color : c.border),
                  borderRadius: '14px',
                  padding: '20px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '16px',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  transform: isHovered ? 'translateY(-1px)' : 'none',
                  boxShadow: isHovered ? `0 4px 16px ${link.color}22` : 'none',
                }}
              >
                <div
                  style={{
                    width: '48px',
                    height: '48px',
                    borderRadius: '12px',
                    backgroundColor: link.color + '18',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                  }}
                >
                  <Icon style={{ width: '22px', height: '22px', color: link.color }} />
                </div>
                <div>
                  <p style={{ fontSize: '15px', fontWeight: 700, color: c.textPrimary, margin: '0 0 4px' }}>
                    {link.label}
                  </p>
                  <p style={{ fontSize: '12px', color: c.textMuted, margin: 0 }}>
                    {link.desc}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Recent Campaigns */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: c.textPrimary, margin: 0 }}>
            {t.foundation.activeCampaignsTitle}
          </h3>
          <button
            onClick={() => router.push('/foundation/campaigns')}
            style={{
              padding: '8px 16px',
              borderRadius: '8px',
              border: '1px solid ' + c.border,
              backgroundColor: 'transparent',
              color: c.primary,
              fontSize: '13px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            {t.foundation.viewAll}
          </button>
        </div>

        {loading ? (
          <div
            style={{
              textAlign: 'center',
              padding: '48px 20px',
              backgroundColor: c.cardBg,
              borderRadius: '14px',
              border: '1px solid ' + c.border,
            }}
          >
            <p style={{ fontSize: '14px', color: c.textMuted, margin: 0 }}>{t.foundation.loadingData}</p>
          </div>
        ) : campaigns.length === 0 ? (
          <div
            style={{
              textAlign: 'center',
              padding: '48px 20px',
              backgroundColor: c.cardBg,
              borderRadius: '14px',
              border: '1px solid ' + c.border,
            }}
          >
            <div style={{ fontSize: '40px', marginBottom: '12px' }}>{'\u{1F91D}'}</div>
            <p style={{ fontSize: '15px', fontWeight: 600, color: c.textPrimary, margin: '0 0 4px' }}>
              {t.foundation.emptyTitle}
            </p>
            <p style={{ fontSize: '13px', color: c.textMuted, margin: 0 }}>{t.foundation.emptyDesc}</p>
          </div>
        ) : (
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${campaignCols}, 1fr)`,
              gap: '16px',
            }}
          >
            {campaigns.map((campaign) => {
              const pct = Math.min(100, Math.round((campaign.currentAmount / campaign.targetAmount) * 100));
              const daysLeft = getDaysLeft(campaign.deadline);
              const gradient = CATEGORY_GRADIENT[campaign.category] || CATEGORY_DEFAULT_GRADIENT;
              const CategoryIcon = campaign.category === 'masjid' ? Star
                : campaign.category === 'bencana' ? Flame
                : campaign.category === 'yatim' ? Heart
                : campaign.category === 'kesehatan' ? Stethoscope
                : campaign.category === 'pendidikan' ? GraduationCap
                : campaign.category === 'pelatihan' ? Briefcase
                : Star;
              return (
                <div
                  key={campaign.id}
                  onClick={() => router.push(`/foundation/campaigns/${campaign.id}`)}
                  style={{
                    backgroundColor: c.cardBg,
                    border: '1px solid ' + c.border,
                    borderRadius: '14px',
                    overflow: 'hidden',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  onMouseEnter={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = '0 6px 20px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                    (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                  }}
                >
                  {/* Thumbnail */}
                  <div
                    style={{
                      height: '140px',
                      background: gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    {campaign.imageUrl ? (
                      <img
                        loading="lazy"
                        src={campaign.imageUrl}
                        alt={campaign.title}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    ) : (
                      <CategoryIcon style={{ width: '48px', height: '48px', color: 'rgba(255,255,255,0.85)' }} />
                    )}
                  </div>

                  <div style={{ padding: '16px' }}>
                    <span
                      style={{
                        display: 'inline-block',
                        padding: '2px 8px',
                        borderRadius: '6px',
                        backgroundColor: '#DC262618',
                        color: '#DC2626',
                        fontSize: '11px',
                        fontWeight: 600,
                        textTransform: 'uppercase',
                        letterSpacing: '0.3px',
                        marginBottom: '8px',
                      }}
                    >
                      {campaign.category.replace('_', ' ')}
                    </span>

                    <h4
                      style={{
                        fontSize: '15px',
                        fontWeight: 700,
                        color: c.textPrimary,
                        margin: '0 0 12px',
                        lineHeight: '1.4',
                        display: '-webkit-box',
                        WebkitLineClamp: 2,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden',
                      }}
                    >
                      {campaign.title}
                    </h4>

                    {/* Progress Bar */}
                    <div style={{ marginBottom: '12px' }}>
                      <div
                        style={{
                          height: '6px',
                          borderRadius: '3px',
                          backgroundColor: c.border,
                          overflow: 'hidden',
                          marginBottom: '6px',
                        }}
                      >
                        <div
                          style={{
                            height: '100%',
                            width: `${pct}%`,
                            backgroundColor: c.primary,
                            borderRadius: '3px',
                            transition: 'width 0.4s ease',
                          }}
                        />
                      </div>
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <span style={{ fontSize: '12px', fontWeight: 600, color: c.primary }}>
                          {formatRupiah(campaign.currentAmount)}
                        </span>
                        <span style={{ fontSize: '11px', color: c.textMuted }}>{pct}%</span>
                      </div>
                    </div>

                    {/* Meta */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '12px', color: c.textMuted }}>
                        {t.foundation.target}: {formatRupiah(campaign.targetAmount)}
                      </span>
                      {daysLeft !== null ? (
                        <span
                          style={{
                            fontSize: '11px',
                            color: daysLeft <= 7 ? '#DC2626' : c.textMuted,
                            fontWeight: daysLeft <= 7 ? 600 : 400,
                          }}
                        >
                          {daysLeft} {t.foundation.daysLeft}
                        </span>
                      ) : (
                        <span style={{ fontSize: '11px', color: c.textMuted }}>
                          {t.foundation.noDeadline}
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
