'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Trophy, Star, Medal, TrendingUp, ChevronLeft, ChevronRight, Award, Zap, Users, CheckCircle, Lock, Gift, Crown, Flame, Target, BookOpen } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { useLanguage } from '@/lib/i18n';

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

// Badge key -> gradient + icon mapping
const BADGE_STYLES: Record<string, { gradient: string; Icon: React.ElementType }> = {
  first_pilgrim:    { gradient: 'linear-gradient(135deg, #F59E0B, #D97706)', Icon: Star },
  ten_pilgrims:     { gradient: 'linear-gradient(135deg, #3B82F6, #1D4ED8)', Icon: Users },
  fifty_pilgrims:   { gradient: 'linear-gradient(135deg, #8B5CF6, #6D28D9)', Icon: Crown },
  hundred_pilgrims: { gradient: 'linear-gradient(135deg, #10B981, #059669)', Icon: Award },
  complete_docs:    { gradient: 'linear-gradient(135deg, #06B6D4, #0891B2)', Icon: CheckCircle },
  fast_responder:   { gradient: 'linear-gradient(135deg, #EF4444, #DC2626)', Icon: Zap },
  top_agency:       { gradient: 'linear-gradient(135deg, #F59E0B, #EF4444)', Icon: Trophy },
  loyal_partner:    { gradient: 'linear-gradient(135deg, #EC4899, #BE185D)', Icon: Flame },
  goal_setter:      { gradient: 'linear-gradient(135deg, #14B8A6, #0F766E)', Icon: Target },
  scholar:          { gradient: 'linear-gradient(135deg, #6366F1, #4338CA)', Icon: BookOpen },
};

const DEFAULT_BADGE_STYLE = { gradient: 'linear-gradient(135deg, #94A3B8, #64748B)', Icon: Gift };

const AVATAR_COLORS = [
  '#EF4444', '#F59E0B', '#10B981', '#3B82F6',
  '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16',
  '#F97316', '#6366F1',
];

function hashName(name: string): number {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = (hash * 31 + name.charCodeAt(i)) & 0xffff;
  }
  return hash;
}

function getInitials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

export default function GamificationPage() {
  const { c } = useTheme();
  const { isMobile, isTablet } = useResponsive();
  const { t } = useLanguage();
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
        <p style={{ color: c.textMuted }}>{t.common.loadingData}</p>
      </div>
    );
  }

  const statCards = [
    { label: t.gamification.statPoints, value: stats?.totalPoints ?? 0, icon: Star, color: '#F59E0B' },
    { label: t.gamification.statLevel, value: stats?.level ?? 1, icon: TrendingUp, color: '#3B82F6' },
    { label: t.gamification.statBadge, value: stats?.badgeCount ?? 0, icon: Medal, color: '#10B981' },
    { label: t.gamification.statRank, value: `#${stats?.rank ?? '-'}`, icon: Trophy, color: '#8B5CF6' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* Header */}
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: c.textPrimary, margin: 0 }}>
          {t.gamification.title}
        </h1>
        <p style={{ fontSize: '14px', color: c.textMuted, marginTop: '4px' }}>
          {t.gamification.subtitle}
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
              background: 'linear-gradient(135deg, #10B981, #059669)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              boxShadow: '0 4px 12px rgba(16,185,129,0.3)',
            }}
          >
            <Gift style={{ width: '24px', height: '24px', color: '#FFFFFF' }} />
          </div>
          <div style={{ flex: 1 }}>
            <p style={{ fontSize: '16px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>
              {t.gamification.rewardsTitle}
            </p>
            <p style={{ fontSize: '13px', color: c.textMuted, margin: '4px 0 0 0' }}>
              {t.gamification.rewardsSubtitle} →
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
              {t.gamification.badgeCollection}
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
            {badges.map(badge => {
              const style = BADGE_STYLES[badge.key] || DEFAULT_BADGE_STYLE;
              const BadgeIcon = badge.unlocked ? style.Icon : Lock;
              const gradient = badge.unlocked ? style.gradient : 'linear-gradient(135deg, #94A3B8, #64748B)';
              return (
                <div
                  key={badge.key}
                  style={{
                    padding: '16px',
                    borderRadius: '12px',
                    border: `1px solid ${badge.unlocked ? '#F59E0B40' : c.borderLight}`,
                    backgroundColor: badge.unlocked ? '#F59E0B08' : c.cardBgHover,
                    textAlign: 'center',
                    opacity: badge.unlocked ? 1 : 0.45,
                    transition: 'all 0.2s',
                  }}
                >
                  <div
                    style={{
                      width: '56px',
                      height: '56px',
                      borderRadius: '50%',
                      background: gradient,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      margin: '0 auto 10px',
                      boxShadow: badge.unlocked ? '0 4px 12px rgba(0,0,0,0.15)' : 'none',
                      flexShrink: 0,
                    }}
                  >
                    <BadgeIcon style={{ width: '24px', height: '24px', color: '#FFFFFF' }} />
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
              );
            })}
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
              {t.gamification.leaderboard}
            </h2>
          </div>
          <div style={{ padding: '20px' }}>
            {leaderboard.length === 0 ? (
              <EmptyState icon={Trophy} title={t.gamification.leaderboardEmpty} />
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
                      {/* Rank badge */}
                      <div
                        style={{
                          width: '24px',
                          textAlign: 'center',
                          fontSize: '13px',
                          fontWeight: '700',
                          color: rankColor,
                          flexShrink: 0,
                        }}
                      >
                        {entry.rank}
                      </div>
                      {/* Initials avatar */}
                      <div
                        style={{
                          width: '36px',
                          height: '36px',
                          borderRadius: '50%',
                          backgroundColor: AVATAR_COLORS[hashName(entry.agencyName) % AVATAR_COLORS.length],
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '13px',
                          fontWeight: '700',
                          color: '#FFFFFF',
                          flexShrink: 0,
                          letterSpacing: '0.02em',
                        }}
                      >
                        {getInitials(entry.agencyName)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: c.textPrimary, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                          {entry.agencyName}
                        </p>
                        <p style={{ fontSize: '12px', color: c.textMuted, margin: '2px 0 0 0' }}>
                          {entry.pilgrimCount} {t.common.pilgrims}
                        </p>
                      </div>
                      <div style={{ textAlign: 'right', flexShrink: 0 }}>
                        <p style={{ fontSize: '14px', fontWeight: '700', color: '#F59E0B', margin: 0 }}>
                          {entry.totalPoints.toLocaleString('id-ID')} {t.gamification.pts}
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
            {t.gamification.history}
          </h2>
        </div>
        <div style={{ padding: '20px' }}>
          {history.length === 0 ? (
            <EmptyState icon={Star} title={t.gamification.historyEmptyTitle} description={t.gamification.historyEmptyDesc} />
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
                    <ChevronLeft style={{ width: '16px', height: '16px' }} /> Sebelumnya
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
                    Selanjutnya <ChevronRight style={{ width: '16px', height: '16px' }} />
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
