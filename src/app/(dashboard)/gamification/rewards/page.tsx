'use client';

import { useState, useEffect } from 'react';
import { PageHeader } from '@/components/layout/page-header';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { useLanguage } from '@/lib/i18n';

interface Reward {
  id: number;
  emoji: string;
  name: string;
  points: number;
  category: string;
}

const REWARDS: Reward[] = [
  { id: 1, emoji: '\uD83C\uDFF7\uFE0F', name: 'Diskon Paket Umrah 5%', points: 500, category: 'Diskon' },
  { id: 2, emoji: '\uD83C\uDFF7\uFE0F', name: 'Diskon Paket Umrah 10%', points: 1000, category: 'Diskon' },
  { id: 3, emoji: '\uD83D\uDC9D', name: 'Sedekah Rp 50.000', points: 200, category: 'Sedekah' },
  { id: 4, emoji: '\uD83D\uDC9D', name: 'Sedekah Rp 100.000', points: 400, category: 'Sedekah' },
  { id: 5, emoji: '\uD83D\uDC55', name: 'Kaos Eksklusif GEZMA', points: 300, category: 'Merchandise' },
  { id: 6, emoji: '\uD83C\uDF92', name: 'Tas Travel GEZMA', points: 800, category: 'Merchandise' },
  { id: 7, emoji: '\u2B50', name: 'Priority Check-in', points: 600, category: 'Layanan' },
  { id: 8, emoji: '\uD83C\uDFE8', name: 'Upgrade Kamar Hotel', points: 1500, category: 'Layanan' },
];

const CATEGORY_COLORS: Record<string, string> = {
  Diskon: '#3B82F6',
  Sedekah: '#10B981',
  Merchandise: '#8B5CF6',
  Layanan: '#F59E0B',
};

export default function RewardsPage() {
  const { c } = useTheme();
  const { isMobile, isTablet } = useResponsive();
  const { t } = useLanguage();
  const [userPoints, setUserPoints] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/gamification/stats')
      .then((r) => r.json())
      .then((data) => {
        setUserPoints(data.totalPoints ?? 0);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <p style={{ color: c.textMuted }}>{t.common.loadingData}</p>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      <PageHeader title={t.gamification.rewardsTitle} description={t.gamification.rewardsSubtitle} />

      {/* Points Balance Card */}
      <div
        style={{
          backgroundColor: c.cardBg,
          border: '1px solid ' + c.border,
          borderRadius: '16px',
          padding: '24px',
          display: 'flex',
          alignItems: 'center',
          gap: '16px',
        }}
      >
        <div
          style={{
            width: '56px',
            height: '56px',
            borderRadius: '16px',
            backgroundColor: '#F59E0B15',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '28px',
            flexShrink: 0,
          }}
        >
          \u2B50
        </div>
        <div>
          <p style={{ fontSize: '13px', color: c.textMuted, margin: 0 }}>Poin Anda saat ini</p>
          <p style={{ fontSize: '32px', fontWeight: '700', color: '#F59E0B', margin: '4px 0 0 0' }}>
            {userPoints.toLocaleString('id-ID')}
          </p>
        </div>
      </div>

      {/* Rewards Grid */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
          gap: '16px',
        }}
      >
        {REWARDS.map((reward) => {
          const canRedeem = userPoints >= reward.points;
          const categoryColor = CATEGORY_COLORS[reward.category] || '#6B7280';

          return (
            <div
              key={reward.id}
              style={{
                backgroundColor: c.cardBg,
                border: '1px solid ' + c.border,
                borderRadius: '16px',
                padding: '24px',
                display: 'flex',
                flexDirection: 'column',
                gap: '12px',
              }}
            >
              {/* Emoji */}
              <div style={{ fontSize: '40px', lineHeight: 1 }}>{reward.emoji}</div>

              {/* Category Badge */}
              <div>
                <span
                  style={{
                    display: 'inline-block',
                    padding: '4px 10px',
                    borderRadius: '20px',
                    fontSize: '11px',
                    fontWeight: '600',
                    color: categoryColor,
                    backgroundColor: categoryColor + '15',
                  }}
                >
                  {reward.category}
                </span>
              </div>

              {/* Name */}
              <p style={{ fontSize: '15px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>
                {reward.name}
              </p>

              {/* Points Required */}
              <p style={{ fontSize: '13px', color: c.textMuted, margin: 0 }}>
                {reward.points.toLocaleString('id-ID')} poin
              </p>

              {/* Redeem Button */}
              <button
                disabled={!canRedeem}
                onClick={() => {
                  alert('Fitur penukaran segera tersedia');
                }}
                style={{
                  marginTop: 'auto',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  fontSize: '13px',
                  fontWeight: '600',
                  cursor: canRedeem ? 'pointer' : 'not-allowed',
                  backgroundColor: canRedeem ? '#F59E0B' : c.border,
                  color: canRedeem ? '#FFFFFF' : c.textMuted,
                  transition: 'opacity 0.2s',
                }}
              >
                {t.gamification.rewardsTitle}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
