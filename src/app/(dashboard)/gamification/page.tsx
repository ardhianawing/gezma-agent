'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, Star, Medal, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';

interface GamificationStats {
  totalPoints: number;
  level: number;
  badgeCount: number;
  rank: number;
  agencyPoints: number;
}

interface Badge {
  key: string;
  name: string;
  emoji: string;
  unlocked: boolean;
  unlockedAt: string | null;
}

interface LeaderboardEntry {
  rank: number;
  agencyId: string;
  agencyName: string;
  logoUrl: string | null;
  totalPoints: number;
  pilgrimCount: number;
  level: number;
}

interface PointEvent {
  id: string;
  type: string;
  action: string;
  points: number;
  description: string;
  createdAt: string;
}

export default function GamificationPage() {
  const { c } = useTheme();
  const { isMobile, isTablet } = useResponsive();
  const [stats, setStats] = useState<GamificationStats | null>(null);
  const [badges, setBadges] = useState<Badge[]>([]);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [history, setHistory] = useState<PointEvent[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPages, setHistoryTotalPages] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch('/api/gamification/stats').then(r => r.json()),
      fetch('/api/gamification/badges').then(r => r.json()),
      fetch('/api/gamification/leaderboard').then(r => r.json()),
      fetch('/api/gamification/history').then(r => r.json()),
    ]).then(([statsData, badgesData, leaderboardData, historyData]) => {
      setStats(statsData);
      setBadges(badgesData.badges || []);
      setLeaderboard(leaderboardData.leaderboard || []);
      setHistory(historyData.data || []);
      setHistoryTotalPages(historyData.pagination?.totalPages || 1);
    }).catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (historyPage === 1) return;
    fetch(`/api/gamification/history?page=${historyPage}`)
      .then(r => r.json())
      .then(data => {
        setHistory(data.data || []);
        setHistoryTotalPages(data.pagination?.totalPages || 1);
      })
      .catch(console.error);
  }, [historyPage]);

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '400px' }}>
        <p style={{ color: c.textMuted }}>Memuat data gamifikasi...</p>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Poin', value: stats?.totalPoints ?? 0, icon: Star, color: '#F59E0B' },
    { label: 'Level', value: stats?.level ?? 1, icon: TrendingUp, color: '#3B82F6' },
    { label: 'Badge', value: stats?.badgeCount ?? 0, icon: Medal, color: '#10B981' },
    { label: 'Rank', value: `#${stats?.rank ?? '-'}`, icon: Trophy, color: '#8B5CF6' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: c.textPrimary, margin: 0 }}>
          Gamifikasi
        </h1>
        <p style={{ fontSize: '14px', color: c.textMuted, marginTop: '4px' }}>
          Kumpulkan poin, raih badge, dan bersaing di leaderboard!
        </p>
      </div>

      {/* Stats Bar */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: '16px',
        }}
      >
        {statCards.map(card => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              style={{
                backgroundColor: c.cardBg,
                borderRadius: '12px',
                border: `1px solid ${c.border}`,
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '12px',
                  backgroundColor: `${card.color}15`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                }}
              >
                <Icon style={{ width: '24px', height: '24px', color: card.color }} />
              </div>
              <div>
                <p style={{ fontSize: '12px', color: c.textMuted, margin: 0 }}>{card.label}</p>
                <p style={{ fontSize: '24px', fontWeight: '700', color: c.textPrimary, margin: '4px 0 0 0' }}>
                  {card.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Rewards Link Card */}
      <Link href="/gamification/rewards" style={{ textDecoration: 'none' }}>
        <div
          style={{
            backgroundColor: c.cardBg,
            borderRadius: '12px',
            border: '1px solid #F59E0B40',
            padding: '20px',
            display: 'flex',
            alignItems: 'center',
            gap: '16px',
            cursor: 'pointer',
            background: `linear-gradient(135deg, ${c.cardBg} 0%, #F59E0B08 100%)`,
            transition: 'all 0.2s',
          }}
        >
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              backgroundColor: '#10B98115',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '24px',
              flexShrink: 0,
            }}
          >
            🎁
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '16px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>
              Tukarkan Poin
            </p>
            <p style={{ fontSize: '13px', color: c.textMuted, margin: '4px 0 0 0' }}>
              Lihat hadiah yang bisa Anda tukarkan →
            </p>
          </div>
        </div>
      </Link>

      {/* Badge Showcase + Leaderboard */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile || isTablet ? '1fr' : '1fr 1fr',
          gap: '16px',
        }}
      >
        {/* Badge Showcase */}
        <div
          style={{
            backgroundColor: c.cardBg,
            borderRadius: '12px',
            border: `1px solid ${c.border}`,
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '20px', borderBottom: `1px solid ${c.borderLight}` }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: c.textPrimary, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Medal style={{ width: '20px', height: '20px', color: '#F59E0B' }} />
              Badge Collection
            </h2>
          </div>
          <div
            style={{
              padding: '20px',
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
              gap: '12px',
            }}
          >
            {badges.map(badge => (
              <div
                key={badge.key}
                style={{
                  padding: '16px',
                  borderRadius: '12px',
                  border: `1px solid ${badge.unlocked ? '#F59E0B40' : c.borderLight}`,
                  backgroundColor: badge.unlocked ? '#F59E0B08' : c.cardBgHover,
                  textAlign: 'center',
                  opacity: badge.unlocked ? 1 : 0.5,
                  transition: 'all 0.2s',
                }}
              >
                <div style={{ fontSize: '32px', marginBottom: '8px' }}>
                  {badge.unlocked ? badge.emoji : '\u{1F512}'}
                </div>
                <p style={{ fontSize: '12px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>
                  {badge.name}
                </p>
                {badge.unlocked && badge.unlockedAt && (
                  <p style={{ fontSize: '10px', color: c.textMuted, margin: '4px 0 0 0' }}>
                    {new Date(badge.unlockedAt).toLocaleDateString('id-ID')}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Leaderboard */}
        <div
          style={{
            backgroundColor: c.cardBg,
            borderRadius: '12px',
            border: `1px solid ${c.border}`,
            overflow: 'hidden',
          }}
        >
          <div style={{ padding: '20px', borderBottom: `1px solid ${c.borderLight}` }}>
            <h2 style={{ fontSize: '18px', fontWeight: '600', color: c.textPrimary, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Trophy style={{ width: '20px', height: '20px', color: '#8B5CF6' }} />
              Leaderboard Bulan Ini
            </h2>
          </div>
          <div style={{ padding: '20px' }}>
            {leaderboard.length === 0 ? (
              <EmptyState icon={Trophy} title="Belum ada data leaderboard" />
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {leaderboard.map(entry => {
                  const rankColors: Record<number, string> = { 1: '#F59E0B', 2: '#94A3B8', 3: '#CD7F32' };
                  const rankColor = rankColors[entry.rank] || c.textMuted;
                  return (
                    <div
                      key={entry.agencyId}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        borderRadius: '8px',
                        backgroundColor: entry.rank <= 3 ? `${rankColor}08` : 'transparent',
                        border: `1px solid ${entry.rank <= 3 ? `${rankColor}30` : c.borderLight}`,
                      }}
                    >
                      <div
                        style={{
                          width: '32px',
                          height: '32px',
                          borderRadius: '50%',
                          backgroundColor: `${rankColor}20`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '14px',
                          fontWeight: '700',
                          color: rankColor,
                          flexShrink: 0,
                        }}
                      >
                        {entry.rank}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: c.textPrimary, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {entry.agencyName}
                        </p>
                        <p style={{ fontSize: '12px', color: c.textMuted, margin: '2px 0 0 0' }}>
                          {entry.pilgrimCount} jemaah
                        </p>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ fontSize: '14px', fontWeight: '700', color: '#F59E0B', margin: 0 }}>
                          {entry.totalPoints.toLocaleString('id-ID')} pts
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Point History */}
      <div
        style={{
          backgroundColor: c.cardBg,
          borderRadius: '12px',
          border: `1px solid ${c.border}`,
          overflow: 'hidden',
        }}
      >
        <div style={{ padding: '20px', borderBottom: `1px solid ${c.borderLight}` }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: c.textPrimary, margin: 0, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Star style={{ width: '20px', height: '20px', color: '#F59E0B' }} />
            Riwayat Poin
          </h2>
        </div>
        <div style={{ padding: '20px' }}>
          {history.length === 0 ? (
            <EmptyState icon={Star} title="Belum ada riwayat poin" description="Mulai kelola jemaah untuk mendapatkan poin!" />
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {history.map(event => (
                <div
                  key={event.id}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '12px',
                    padding: '12px',
                    borderRadius: '8px',
                    border: `1px solid ${c.borderLight}`,
                  }}
                >
                  <div
                    style={{
                      width: '36px',
                      height: '36px',
                      borderRadius: '8px',
                      backgroundColor: '#10B98115',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '14px',
                      fontWeight: '700',
                      color: '#10B981',
                      flexShrink: 0,
                    }}
                  >
                    +{event.points}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: '13px', fontWeight: '500', color: c.textPrimary, margin: 0 }}>
                      {event.description}
                    </p>
                    <p style={{ fontSize: '11px', color: c.textLight, margin: '2px 0 0 0' }}>
                      {new Date(event.createdAt).toLocaleString('id-ID')}
                    </p>
                  </div>
                </div>
              ))}

              {/* Pagination */}
              {historyTotalPages > 1 && (
                <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', paddingTop: '12px' }}>
                  <button
                    onClick={() => setHistoryPage(p => Math.max(1, p - 1))}
                    disabled={historyPage === 1}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: `1px solid ${c.border}`,
                      backgroundColor: c.cardBg,
                      color: historyPage === 1 ? c.textLight : c.textPrimary,
                      cursor: historyPage === 1 ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '13px',
                    }}
                  >
                    <ChevronLeft style={{ width: '16px', height: '16px' }} /> Prev
                  </button>
                  <span style={{ padding: '8px 16px', fontSize: '13px', color: c.textMuted }}>
                    {historyPage} / {historyTotalPages}
                  </span>
                  <button
                    onClick={() => setHistoryPage(p => Math.min(historyTotalPages, p + 1))}
                    disabled={historyPage === historyTotalPages}
                    style={{
                      padding: '8px 12px',
                      borderRadius: '8px',
                      border: `1px solid ${c.border}`,
                      backgroundColor: c.cardBg,
                      color: historyPage === historyTotalPages ? c.textLight : c.textPrimary,
                      cursor: historyPage === historyTotalPages ? 'not-allowed' : 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '4px',
                      fontSize: '13px',
                    }}
                  >
                    Next <ChevronRight style={{ width: '16px', height: '16px' }} />
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
