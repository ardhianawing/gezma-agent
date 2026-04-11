'use client';

import { useState, useEffect } from 'react';
import { TrendingUp, Heart, Users, Package, Building2, Target } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { useLanguage } from '@/lib/i18n';

interface FoundationStats {
  activeCampaigns: number;
  totalRaised: number;
  totalDonors: number;
  goodsAvailable: number;
  activeFinancings: number;
  peopleImpacted: number;
}

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

function formatRupiah(amount: number): string {
  if (amount >= 1_000_000_000) return `Rp ${(amount / 1_000_000_000).toFixed(2)}M`;
  if (amount >= 1_000_000) return `Rp ${(amount / 1_000_000).toFixed(1)}Jt`;
  return `Rp ${amount.toLocaleString('id-ID')}`;
}

const IMPACT_CATEGORIES = [
  { key: 'bencana', emoji: '\u{1F6A8}', label: 'Bantuan Bencana', desc: 'Keluarga terbantu' },
  { key: 'masjid', emoji: '\u{1F54C}', label: 'Masjid Dibangun', desc: 'Bangunan didirikan' },
  { key: 'yatim', emoji: '\u{1F91D}', label: 'Anak Yatim', desc: 'Anak diasuh' },
  { key: 'kesehatan', emoji: '\u{1F3E5}', label: 'Layanan Kesehatan', desc: 'Pasien dilayani' },
  { key: 'pendidikan', emoji: '\u{1F4DA}', label: 'Beasiswa', desc: 'Siswa didukung' },
  { key: 'umrah_dhuafa', emoji: '\u{1F4FF}', label: 'Umrah Dhuafa', desc: 'Jemaah diberangkatkan' },
];

export default function ImpactPage() {
  const { c } = useTheme();
  const { isMobile, isTablet } = useResponsive();
  const { t } = useLanguage();

  const [stats, setStats] = useState<FoundationStats | null>(null);
  const [campaigns, setCampaigns] = useState<CampaignPreview[]>([]);
  const [loading, setLoading] = useState(true);

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

  const bigStats = [
    { icon: TrendingUp, label: 'Total Dana Terkumpul', value: stats ? formatRupiah(stats.totalRaised) : '-', color: '#DC2626' },
    { icon: Heart, label: 'Kampanye Aktif', value: stats ? String(stats.activeCampaigns) : '-', color: '#DC2626' },
    { icon: Users, label: 'Total Donatur', value: stats ? stats.totalDonors.toLocaleString('id-ID') : '-', color: '#2563EB' },
    { icon: Target, label: 'Orang Dibantu', value: stats ? stats.peopleImpacted.toLocaleString('id-ID') : '-', color: '#16A34A' },
    { icon: Package, label: 'Barang Tersedia', value: stats ? String(stats.goodsAvailable) : '-', color: '#D97706' },
    { icon: Building2, label: 'Pendanaan Aktif', value: stats ? String(stats.activeFinancings) : '-', color: '#7C3AED' },
  ];

  const gridCols = isMobile ? 2 : isTablet ? 3 : 6;
  const impactCols = isMobile ? 2 : 3;
  const campaignCols = isMobile ? 1 : isTablet ? 2 : 3;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <PageHeader
        title={t.foundation.impactTitle}
        description={t.foundation.impactDesc}
      />

      {/* Big Numbers */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: `repeat(${gridCols}, 1fr)`,
          gap: '12px',
        }}
      >
        {bigStats.map((stat) => {
          const Icon = stat.icon;
          return (
            <div
              key={stat.label}
              style={{
                backgroundColor: c.cardBg,
                border: '1px solid ' + c.border,
                borderRadius: '14px',
                padding: '20px 16px',
                textAlign: 'center',
              }}
            >
              <div
                style={{
                  width: '44px',
                  height: '44px',
                  borderRadius: '12px',
                  backgroundColor: stat.color + '18',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  margin: '0 auto 12px',
                }}
              >
                <Icon style={{ width: '20px', height: '20px', color: stat.color }} />
              </div>
              <p style={{ fontSize: isMobile ? '18px' : '22px', fontWeight: 700, color: c.textPrimary, margin: '0 0 4px' }}>
                {loading ? '...' : stat.value}
              </p>
              <p style={{ fontSize: '11px', color: c.textMuted, margin: 0, lineHeight: '1.3' }}>
                {stat.label}
              </p>
            </div>
          );
        })}
      </div>

      {/* Transparency Statement */}
      <div
        style={{
          padding: '24px',
          borderRadius: '14px',
          background: 'linear-gradient(135deg, #DC2626 0%, #991B1B 100%)',
          color: '#fff',
        }}
      >
        <h3 style={{ fontSize: '18px', fontWeight: 700, margin: '0 0 8px' }}>
          {'\u{1F4CA}'} {t.foundation.transparencyReport}
        </h3>
        <p style={{ fontSize: '14px', opacity: 0.9, margin: 0, lineHeight: '1.6' }}>
          Gezma Foundation berkomitmen pada transparansi 100%. Setiap rupiah yang terkumpul tercatat dan dilaporkan
          secara real-time. Donatur dapat memantau penggunaan dana melalui laporan dampak di halaman ini.
        </p>
      </div>

      {/* Impact by Category */}
      <div>
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: c.textPrimary, margin: '0 0 16px' }}>
          Dampak per Kategori Program
        </h3>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${impactCols}, 1fr)`,
            gap: '12px',
          }}
        >
          {IMPACT_CATEGORIES.map((cat) => (
            <div
              key={cat.key}
              style={{
                backgroundColor: c.cardBg,
                border: '1px solid ' + c.border,
                borderRadius: '12px',
                padding: '16px',
                display: 'flex',
                alignItems: 'center',
                gap: '12px',
              }}
            >
              <span style={{ fontSize: '28px', flexShrink: 0 }}>{cat.emoji}</span>
              <div>
                <p style={{ fontSize: '14px', fontWeight: 600, color: c.textPrimary, margin: '0 0 2px' }}>
                  {cat.label}
                </p>
                <p style={{ fontSize: '12px', color: c.textMuted, margin: 0 }}>
                  {cat.desc}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Campaign Progress */}
      {!loading && campaigns.length > 0 && (
        <div>
          <h3 style={{ fontSize: '16px', fontWeight: 700, color: c.textPrimary, margin: '0 0 16px' }}>
            Progress Kampanye Aktif
          </h3>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: `repeat(${campaignCols}, 1fr)`,
              gap: '16px',
            }}
          >
            {campaigns.map((campaign) => {
              const pct = Math.min(100, Math.round((campaign.currentAmount / campaign.targetAmount) * 100));
              return (
                <div
                  key={campaign.id}
                  style={{
                    backgroundColor: c.cardBg,
                    border: '1px solid ' + c.border,
                    borderRadius: '14px',
                    padding: '20px',
                  }}
                >
                  <p style={{ fontSize: '14px', fontWeight: 700, color: c.textPrimary, margin: '0 0 4px', lineHeight: '1.3' }}>
                    {campaign.title}
                  </p>
                  <span style={{ display: 'inline-block', fontSize: '11px', fontWeight: 600, color: '#DC2626', backgroundColor: '#DC262618', padding: '2px 8px', borderRadius: '6px', marginBottom: '12px', textTransform: 'uppercase' }}>
                    {campaign.category.replace('_', ' ')}
                  </span>

                  <div style={{ marginBottom: '8px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                      <span style={{ fontSize: '12px', fontWeight: 600, color: c.primary }}>
                        {formatRupiah(campaign.currentAmount)}
                      </span>
                      <span style={{ fontSize: '12px', color: c.textMuted }}>
                        {pct}%
                      </span>
                    </div>
                    <div
                      style={{
                        height: '8px',
                        borderRadius: '4px',
                        backgroundColor: c.border,
                        overflow: 'hidden',
                      }}
                    >
                      <div
                        style={{
                          height: '100%',
                          width: `${pct}%`,
                          backgroundColor: c.primary,
                          borderRadius: '4px',
                          transition: 'width 0.6s ease',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: '12px', color: c.textMuted }}>
                      Target: {formatRupiah(campaign.targetAmount)}
                    </span>
                    <span style={{ fontSize: '12px', color: c.textMuted }}>
                      {campaign._count.donations} donatur
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SDG Goals Section */}
      <div
        style={{
          backgroundColor: c.cardBg,
          border: '1px solid ' + c.border,
          borderRadius: '14px',
          padding: '24px',
        }}
      >
        <h3 style={{ fontSize: '16px', fontWeight: 700, color: c.textPrimary, margin: '0 0 12px' }}>
          {'\u{1F30D}'} Tujuan Pembangunan Berkelanjutan (SDGs)
        </h3>
        <p style={{ fontSize: '14px', color: c.textSecondary, margin: '0 0 16px', lineHeight: '1.6' }}>
          Gezma Foundation berkontribusi pada pencapaian SDGs melalui program-program sosial yang terukur dan berkelanjutan.
        </p>
        <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          {[
            { num: '1', label: 'Tanpa Kemiskinan', color: '#E5243B' },
            { num: '3', label: 'Kehidupan Sehat', color: '#4C9F38' },
            { num: '4', label: 'Pendidikan Berkualitas', color: '#C5192D' },
            { num: '10', label: 'Berkurangnya Ketimpangan', color: '#DD1367' },
            { num: '17', label: 'Kemitraan', color: '#19486A' },
          ].map((sdg) => (
            <div
              key={sdg.num}
              style={{
                padding: '6px 12px',
                borderRadius: '8px',
                backgroundColor: sdg.color,
                color: '#fff',
                fontSize: '12px',
                fontWeight: 600,
              }}
            >
              SDG {sdg.num}: {sdg.label}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
