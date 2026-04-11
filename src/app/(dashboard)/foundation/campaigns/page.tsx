'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { Plus, Search } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { useLanguage } from '@/lib/i18n';

interface Campaign {
  id: string;
  title: string;
  description: string;
  category: string;
  targetAmount: number;
  currentAmount: number;
  deadline: string | null;
  status: string;
  imageUrl: string | null;
  _count: { donations: number };
  createdAt: string;
}

const CATEGORY_EMOJI: Record<string, string> = {
  bencana: '\u{1F6A8}',
  masjid: '\u{1F54C}',
  yatim: '\u{1F91D}',
  kesehatan: '\u{1F3E5}',
  pendidikan: '\u{1F4DA}',
  pelatihan: '\u{1F4BC}',
  umrah_dhuafa: '\u{1F4FF}',
};

const CATEGORIES = ['all', 'bencana', 'masjid', 'yatim', 'kesehatan', 'pendidikan', 'pelatihan', 'umrah_dhuafa'] as const;

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

export default function CampaignsPage() {
  const { c } = useTheme();
  const { isMobile, isTablet } = useResponsive();
  const { t } = useLanguage();
  const router = useRouter();

  const [campaigns, setCampaigns] = useState<Campaign[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchCampaigns = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ limit: '20', status: 'all' });
      if (activeCategory !== 'all') params.set('category', activeCategory);
      const res = await fetch(`/api/foundation/campaigns?${params}`);
      if (res.ok) {
        const data = await res.json();
        setCampaigns(data.campaigns || []);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, [activeCategory]);

  useEffect(() => { fetchCampaigns(); }, [fetchCampaigns]);

  const filtered = campaigns.filter((c) =>
    c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    c.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const gridCols = isMobile ? 1 : isTablet ? 2 : 3;

  const getCategoryLabel = (cat: string): string => {
    const labels: Record<string, string> = {
      all: 'Semua',
      bencana: t.foundation.categoryBencana,
      masjid: t.foundation.categoryMasjid,
      yatim: t.foundation.categoryYatim,
      kesehatan: t.foundation.categoryKesehatan,
      pendidikan: t.foundation.categoryPendidikan,
      pelatihan: t.foundation.categoryPelatihan,
      umrah_dhuafa: t.foundation.categoryUmrahDhuafa,
    };
    return labels[cat] || cat;
  };

  const statusColor: Record<string, string> = {
    active: '#16A34A',
    completed: '#2563EB',
    cancelled: c.textMuted,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
      <PageHeader
        title={t.foundation.campaignsTitle}
        description={t.foundation.campaignsDesc}
        actions={
          <button
            onClick={() => router.push('/foundation/campaigns/new')}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              minHeight: '44px',
              borderRadius: '10px',
              border: 'none',
              backgroundColor: c.primary,
              color: '#fff',
              fontSize: '14px',
              fontWeight: 600,
              cursor: 'pointer',
            }}
          >
            <Plus style={{ width: '18px', height: '18px' }} />
            {t.foundation.newCampaignBtn}
          </button>
        }
      />

      {/* Category Tabs */}
      <div style={{ display: 'flex', gap: '8px', overflowX: 'auto', paddingBottom: '4px', WebkitOverflowScrolling: 'touch' }}>
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                minHeight: '40px',
                borderRadius: '20px',
                border: isActive ? '2px solid ' + c.primary : '1px solid ' + c.border,
                backgroundColor: isActive ? c.primaryLight : c.cardBg,
                color: isActive ? c.primary : c.textSecondary,
                fontWeight: isActive ? 600 : 400,
                fontSize: '13px',
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                transition: 'all 0.2s ease',
              }}
            >
              {cat !== 'all' && <span>{CATEGORY_EMOJI[cat]}</span>}
              {getCategoryLabel(cat)}
            </button>
          );
        })}
      </div>

      {/* Search */}
      <div style={{ position: 'relative', maxWidth: '400px' }}>
        <Search
          style={{
            position: 'absolute',
            left: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '16px',
            height: '16px',
            color: c.textMuted,
            pointerEvents: 'none',
          }}
        />
        <input
          type="text"
          placeholder="Cari kampanye..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          style={{
            width: '100%',
            padding: '10px 12px 10px 36px',
            minHeight: '44px',
            borderRadius: '10px',
            border: '1px solid ' + c.border,
            backgroundColor: c.cardBg,
            color: c.textPrimary,
            fontSize: '14px',
            outline: 'none',
            boxSizing: 'border-box',
          }}
          onFocus={(e) => { e.target.style.borderColor = c.primary; }}
          onBlur={(e) => { e.target.style.borderColor = c.border; }}
        />
      </div>

      {/* Count */}
      <p style={{ fontSize: '13px', color: c.textMuted, margin: 0 }}>
        {filtered.length} kampanye ditemukan
      </p>

      {/* Grid */}
      {loading ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: c.cardBg,
            borderRadius: '14px',
            border: '1px solid ' + c.border,
          }}
        >
          <p style={{ color: c.textMuted }}>{t.foundation.loadingData}</p>
        </div>
      ) : filtered.length === 0 ? (
        <div
          style={{
            textAlign: 'center',
            padding: '60px 20px',
            backgroundColor: c.cardBg,
            borderRadius: '14px',
            border: '1px solid ' + c.border,
          }}
        >
          <div style={{ fontSize: '48px', marginBottom: '12px' }}>{'\u{1F91D}'}</div>
          <p style={{ fontSize: '16px', fontWeight: 600, color: c.textPrimary, margin: '0 0 4px' }}>
            {t.foundation.emptyTitle}
          </p>
          <p style={{ fontSize: '14px', color: c.textMuted, margin: 0 }}>{t.foundation.emptyDesc}</p>
        </div>
      ) : (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
            gap: '16px',
          }}
        >
          {filtered.map((campaign) => {
            const pct = Math.min(100, Math.round((campaign.currentAmount / campaign.targetAmount) * 100));
            const daysLeft = getDaysLeft(campaign.deadline);
            const emoji = CATEGORY_EMOJI[campaign.category] || '\u{1F4E6}';
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
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 8px 24px rgba(0,0,0,0.1)';
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
                    background: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '52px',
                    position: 'relative',
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
                    emoji
                  )}
                  {/* Status Badge */}
                  <div
                    style={{
                      position: 'absolute',
                      top: '10px',
                      right: '10px',
                      padding: '3px 10px',
                      borderRadius: '6px',
                      backgroundColor: 'rgba(0,0,0,0.5)',
                      color: '#fff',
                      fontSize: '11px',
                      fontWeight: 600,
                    }}
                  >
                    <span style={{ color: statusColor[campaign.status] || '#fff' }}>●</span>
                    {' '}
                    {campaign.status === 'active' ? 'Aktif' : campaign.status === 'completed' ? 'Selesai' : 'Dibatalkan'}
                  </div>
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
                      marginBottom: '8px',
                    }}
                  >
                    {getCategoryLabel(campaign.category)}
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

                  {/* Progress */}
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
                        }}
                      />
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: c.primary }}>
                        {formatRupiah(campaign.currentAmount)}
                      </span>
                      <span style={{ fontSize: '11px', color: c.textMuted }}>{pct}%</span>
                    </div>
                  </div>

                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      paddingTop: '12px',
                      borderTop: '1px solid ' + c.borderLight,
                    }}
                  >
                    <span style={{ fontSize: '12px', color: c.textMuted }}>
                      {campaign._count.donations} donatur
                    </span>
                    {daysLeft !== null ? (
                      <span style={{ fontSize: '11px', color: daysLeft <= 7 ? '#DC2626' : c.textMuted, fontWeight: daysLeft <= 7 ? 600 : 400 }}>
                        {daysLeft} {t.foundation.daysLeft}
                      </span>
                    ) : (
                      <span style={{ fontSize: '11px', color: c.textMuted }}>{t.foundation.noDeadline}</span>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
