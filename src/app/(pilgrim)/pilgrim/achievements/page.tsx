'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';

const PILGRIM_GREEN = '#059669';
const PILGRIM_GREEN_LIGHT = '#ECFDF5';

interface Badge {
  key: string;
  name: string;
  description: string;
  icon: string;
  earned: boolean;
  earnedAt: string | null;
}

interface PointEvent {
  id: string;
  action: string;
  points: number;
  description: string;
  createdAt: string;
}

interface Stats {
  totalPoints: number;
  level: number;
  nextLevelPoints: number;
  pointsToNextLevel: number;
  badgeCount: number;
  recentPoints: PointEvent[];
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  });
}

export default function PilgrimAchievementsPage() {
  const { c } = useTheme();
  const { isMobile } = useResponsive();
  const [stats, setStats] = useState<Stats | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/pilgrim-portal/gamification/stats').then(r => r.json()),
      fetch('/api/pilgrim-portal/gamification/badges').then(r => r.json()),
    ])
      .then(([statsData, badgesData]) => {
        setStats(statsData);
        setBadges(badgesData.data || []);
      })
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: c.textMuted, fontSize: '14px' }}>
        Memuat pencapaian...
      </div>
    );
  }

  if (!stats) return null;

  const progressPercent = stats.nextLevelPoints > 0
    ? Math.round(((stats.nextLevelPoints - stats.pointsToNextLevel) / stats.nextLevelPoints) * 100)
    : 100;

  const cardStyle: React.CSSProperties = {
    backgroundColor: c.cardBg,
    border: '1px solid ' + c.border,
    borderRadius: '16px',
    padding: '20px',
    marginBottom: '16px',
  };

  return (
    <div>
      <h1 style={{
        fontSize: isMobile ? '22px' : '26px',
        fontWeight: 700,
        color: c.textPrimary,
        margin: '0 0 20px 0',
        display: 'flex',
        alignItems: 'center',
        gap: '10px',
      }}>
        {'\u{1F3C6}'} Pencapaian
      </h1>

      {/* Stats bar */}
      <div style={{
        ...cardStyle,
        background: `linear-gradient(135deg, ${PILGRIM_GREEN}, #047857)`,
        border: 'none',
        color: '#FFFFFF',
      }}>
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '16px',
          textAlign: 'center',
          marginBottom: '16px',
        }}>
          <div>
            <p style={{ fontSize: '28px', fontWeight: 700, margin: 0 }}>{stats.level}</p>
            <p style={{ fontSize: '12px', opacity: 0.85, margin: '2px 0 0 0' }}>Level</p>
          </div>
          <div>
            <p style={{ fontSize: '28px', fontWeight: 700, margin: 0 }}>{stats.totalPoints}</p>
            <p style={{ fontSize: '12px', opacity: 0.85, margin: '2px 0 0 0' }}>Total Poin</p>
          </div>
          <div>
            <p style={{ fontSize: '28px', fontWeight: 700, margin: 0 }}>{stats.badgeCount}</p>
            <p style={{ fontSize: '12px', opacity: 0.85, margin: '2px 0 0 0' }}>Badge</p>
          </div>
        </div>

        {/* Progress to next level */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
            <span style={{ fontSize: '12px', opacity: 0.85 }}>Level {stats.level}</span>
            <span style={{ fontSize: '12px', opacity: 0.85 }}>Level {stats.level + 1}</span>
          </div>
          <div style={{
            height: '8px',
            backgroundColor: 'rgba(255,255,255,0.25)',
            borderRadius: '4px',
            overflow: 'hidden',
          }}>
            <div style={{
              width: progressPercent + '%',
              height: '100%',
              backgroundColor: '#FFFFFF',
              borderRadius: '4px',
              transition: 'width 0.5s ease',
            }} />
          </div>
          <p style={{ fontSize: '11px', opacity: 0.75, margin: '6px 0 0 0', textAlign: 'right' }}>
            {stats.pointsToNextLevel} poin lagi ke level berikutnya
          </p>
        </div>
      </div>

      {/* Badge Grid */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: '15px', fontWeight: 600, color: c.textPrimary, margin: '0 0 16px 0' }}>
          Badge
        </h2>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr',
          gap: '12px',
        }}>
          {badges.map((badge) => (
            <div key={badge.key} style={{
              padding: '16px 12px',
              borderRadius: '12px',
              border: `1px solid ${badge.earned ? PILGRIM_GREEN : c.borderLight}`,
              backgroundColor: badge.earned ? PILGRIM_GREEN_LIGHT : c.pageBg,
              textAlign: 'center',
              opacity: badge.earned ? 1 : 0.5,
              filter: badge.earned ? 'none' : 'grayscale(0.8)',
              transition: 'all 0.2s',
            }}>
              <span style={{ fontSize: '32px', display: 'block', marginBottom: '8px' }}>
                {badge.icon}
              </span>
              <p style={{
                fontSize: '13px',
                fontWeight: 600,
                color: badge.earned ? PILGRIM_GREEN : c.textMuted,
                margin: '0 0 4px 0',
              }}>
                {badge.name}
              </p>
              <p style={{
                fontSize: '11px',
                color: c.textMuted,
                margin: 0,
                lineHeight: 1.3,
              }}>
                {badge.description}
              </p>
              {badge.earned && badge.earnedAt && (
                <p style={{
                  fontSize: '10px',
                  color: PILGRIM_GREEN,
                  margin: '6px 0 0 0',
                  fontWeight: 500,
                }}>
                  Diperoleh {formatDate(badge.earnedAt)}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Recent Points */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: '15px', fontWeight: 600, color: c.textPrimary, margin: '0 0 14px 0' }}>
          Riwayat Poin Terbaru
        </h2>
        {stats.recentPoints.length === 0 ? (
          <p style={{ textAlign: 'center', color: c.textMuted, fontSize: '14px', padding: '16px 0' }}>
            Belum ada riwayat poin.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {stats.recentPoints.map((event) => (
              <div key={event.id} style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '10px 12px',
                borderRadius: '8px',
                backgroundColor: c.pageBg,
                border: `1px solid ${c.borderLight}`,
              }}>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <p style={{ fontSize: '13px', fontWeight: 500, color: c.textPrimary, margin: 0 }}>
                    {event.description}
                  </p>
                  <p style={{ fontSize: '11px', color: c.textMuted, margin: '2px 0 0 0' }}>
                    {formatDate(event.createdAt)}
                  </p>
                </div>
                <span style={{
                  fontSize: '14px',
                  fontWeight: 700,
                  color: PILGRIM_GREEN,
                  flexShrink: 0,
                  marginLeft: '12px',
                }}>
                  +{event.points}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
