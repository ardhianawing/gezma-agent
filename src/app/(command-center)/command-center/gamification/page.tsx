'use client';

import { useState } from 'react';
import { Trophy, Star, Award, Users, RefreshCw, Edit2, RotateCcw } from 'lucide-react';

const cc = {
  primary: '#2563EB',
  cardBg: '#FFFFFF',
  pageBg: '#F8FAFC',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  textPrimary: '#0F172A',
  textSecondary: '#334155',
  textMuted: '#64748B',
};

interface Badge {
  id: string;
  name: string;
  criteria: string;
  totalUnlocked: number;
  gradient: [string, string];
  icon: string;
}

interface AgencyRank {
  rank: number;
  agencyName: string;
  points: number;
  level: string;
  badgesEarned: number;
}

const BADGES: Badge[] = [
  { id: '1', name: 'First Pilgrim',   criteria: 'Daftarkan jemaah pertama',              totalUnlocked: 312, gradient: ['#F59E0B', '#EF4444'], icon: '⭐' },
  { id: '2', name: '10 Pilgrims',     criteria: 'Capai 10 jemaah terdaftar',              totalUnlocked: 214, gradient: ['#10B981', '#059669'], icon: '🏅' },
  { id: '3', name: '50 Pilgrims',     criteria: 'Capai 50 jemaah terdaftar',              totalUnlocked: 98,  gradient: ['#3B82F6', '#1D4ED8'], icon: '🥈' },
  { id: '4', name: '100 Pilgrims',    criteria: 'Capai 100 jemaah terdaftar',             totalUnlocked: 41,  gradient: ['#8B5CF6', '#7C3AED'], icon: '🥇' },
  { id: '5', name: 'Complete Docs',   criteria: 'Lengkapi semua dokumen profil agensi',   totalUnlocked: 289, gradient: ['#06B6D4', '#0891B2'], icon: '📋' },
  { id: '6', name: 'Fast Responder',  criteria: 'Respons pertanyaan < 2 jam selama 7 hari',totalUnlocked: 156, gradient: ['#F97316', '#EA580C'], icon: '⚡' },
  { id: '7', name: 'Top Agency',      criteria: 'Masuk 10 besar leaderboard bulanan',     totalUnlocked: 87,  gradient: ['#EC4899', '#DB2777'], icon: '🏆' },
  { id: '8', name: 'Loyal Partner',   criteria: 'Aktif di GEZMA lebih dari 12 bulan',     totalUnlocked: 203, gradient: ['#14B8A6', '#0D9488'], icon: '💎' },
];

const LEADERBOARD: AgencyRank[] = [
  { rank: 1,  agencyName: 'PT Nur Ilahi Tour',      points: 98450, level: 'Platinum', badgesEarned: 8 },
  { rank: 2,  agencyName: 'Al-Barokah Travel',       points: 87320, level: 'Platinum', badgesEarned: 7 },
  { rank: 3,  agencyName: 'Arminareka Perdana',      points: 76890, level: 'Gold',     badgesEarned: 7 },
  { rank: 4,  agencyName: 'Fazam Tour & Travel',     points: 65210, level: 'Gold',     badgesEarned: 6 },
  { rank: 5,  agencyName: 'Baitussalam Tour',        points: 54780, level: 'Gold',     badgesEarned: 6 },
  { rank: 6,  agencyName: 'Khalifa Wisata',          points: 43560, level: 'Silver',   badgesEarned: 5 },
  { rank: 7,  agencyName: 'PT Mina Wisata Islami',   points: 38940, level: 'Silver',   badgesEarned: 5 },
  { rank: 8,  agencyName: 'Safari Suci Tour',        points: 29870, level: 'Silver',   badgesEarned: 4 },
  { rank: 9,  agencyName: 'Rabani Travel',           points: 21450, level: 'Bronze',   badgesEarned: 3 },
  { rank: 10, agencyName: 'Duta Wisata Haji',        points: 14230, level: 'Bronze',   badgesEarned: 3 },
];

const LEVEL_COLORS: Record<string, { bg: string; text: string }> = {
  Platinum: { bg: '#EFF6FF', text: '#1D4ED8' },
  Gold:     { bg: '#FEF3C7', text: '#D97706' },
  Silver:   { bg: '#F1F5F9', text: '#475569' },
  Bronze:   { bg: '#FEF9C3', text: '#92400E' },
};

const RANK_MEDAL: Record<number, string> = { 1: '🥇', 2: '🥈', 3: '🥉' };

export default function CCGamificationPage() {
  const [resetConfirm, setResetConfirm] = useState<number | null>(null);
  const [leaderboard, setLeaderboard] = useState(LEADERBOARD);

  const totalPoints = leaderboard.reduce((s, a) => s + a.points, 0);
  const activePlayers = leaderboard.length;
  const totalBadges = BADGES.reduce((s, b) => s + b.totalUnlocked, 0);
  const leaderboardResets = 3; // mock

  const statCards = [
    { label: 'Total Points Issued', value: totalPoints,      icon: Star,       color: '#F59E0B', format: (v: number) => v.toLocaleString('id-ID') },
    { label: 'Active Players',      value: activePlayers,    icon: Users,      color: '#10B981', format: (v: number) => v.toString() },
    { label: 'Badges Earned',       value: totalBadges,      icon: Award,      color: '#8B5CF6', format: (v: number) => v.toLocaleString('id-ID') },
    { label: 'Leaderboard Resets',  value: leaderboardResets,icon: RefreshCw,  color: '#EF4444', format: (v: number) => v.toString() },
  ];

  const handleReset = (rank: number) => {
    setLeaderboard(prev => prev.map(a => a.rank === rank ? { ...a, points: 0 } : a));
    setResetConfirm(null);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '4px' }}>
          <div style={{
            width: '40px',
            height: '40px',
            borderRadius: '10px',
            backgroundColor: '#F59E0B18',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}>
            <Trophy style={{ width: '20px', height: '20px', color: '#F59E0B' }} />
          </div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: cc.textPrimary, margin: 0 }}>
            Gamification Administration
          </h1>
        </div>
        <p style={{ fontSize: '14px', color: cc.textMuted, marginTop: '4px', marginBottom: 0 }}>
          Kelola sistem poin, badge, dan leaderboard agensi dalam ekosistem GEZMA.
        </p>
      </div>

      {/* Stats Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        {statCards.map(card => {
          const Icon = card.icon;
          return (
            <div
              key={card.label}
              style={{
                backgroundColor: cc.cardBg,
                borderRadius: '12px',
                border: `1px solid ${cc.border}`,
                padding: '20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
              }}
            >
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                backgroundColor: `${card.color}15`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
              }}>
                <Icon style={{ width: '24px', height: '24px', color: card.color }} />
              </div>
              <div>
                <p style={{ fontSize: '12px', color: cc.textMuted, margin: 0 }}>{card.label}</p>
                <p style={{ fontSize: '24px', fontWeight: '700', color: cc.textPrimary, margin: '4px 0 0 0' }}>
                  {card.format(card.value)}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Section 1: Badge Management */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: cc.textPrimary, margin: 0 }}>Badge Management</h2>
            <p style={{ fontSize: '13px', color: cc.textMuted, margin: '2px 0 0 0' }}>Kelola tipe dan kriteria badge yang tersedia untuk agensi.</p>
          </div>
          <button style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '8px 16px',
            borderRadius: '8px',
            border: 'none',
            backgroundColor: cc.primary,
            color: 'white',
            fontSize: '13px',
            fontWeight: 600,
            cursor: 'pointer',
          }}>
            + Tambah Badge
          </button>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
          {BADGES.map(badge => (
            <div
              key={badge.id}
              style={{
                backgroundColor: cc.cardBg,
                borderRadius: '12px',
                border: `1px solid ${cc.border}`,
                padding: '20px',
                display: 'flex',
                flexDirection: 'column',
                gap: '14px',
              }}
            >
              {/* Badge Icon */}
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div style={{
                  width: '52px',
                  height: '52px',
                  borderRadius: '50%',
                  background: `linear-gradient(135deg, ${badge.gradient[0]}, ${badge.gradient[1]})`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '24px',
                }}>
                  {badge.icon}
                </div>
                <button
                  title="Edit Badge"
                  style={{
                    width: '30px',
                    height: '30px',
                    borderRadius: '6px',
                    border: `1px solid ${cc.border}`,
                    backgroundColor: cc.pageBg,
                    color: cc.primary,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    cursor: 'pointer',
                    flexShrink: 0,
                  }}
                >
                  <Edit2 style={{ width: '13px', height: '13px' }} />
                </button>
              </div>

              {/* Badge Info */}
              <div>
                <p style={{ fontSize: '14px', fontWeight: '700', color: cc.textPrimary, margin: 0 }}>{badge.name}</p>
                <p style={{ fontSize: '12px', color: cc.textMuted, margin: '4px 0 0 0', lineHeight: '1.5' }}>{badge.criteria}</p>
              </div>

              {/* Unlock Count */}
              <div style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                paddingTop: '12px',
                borderTop: `1px solid ${cc.borderLight}`,
              }}>
                <span style={{ fontSize: '12px', color: cc.textMuted }}>Total Unlocked</span>
                <span style={{
                  fontSize: '13px',
                  fontWeight: '700',
                  color: badge.gradient[0],
                }}>
                  {badge.totalUnlocked.toLocaleString('id-ID')}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Section 2: Top Agencies Leaderboard */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px' }}>
          <div>
            <h2 style={{ fontSize: '18px', fontWeight: '700', color: cc.textPrimary, margin: 0 }}>Top Agencies Leaderboard</h2>
            <p style={{ fontSize: '13px', color: cc.textMuted, margin: '2px 0 0 0' }}>Peringkat agensi berdasarkan total poin yang dikumpulkan.</p>
          </div>
        </div>

        <div style={{ backgroundColor: cc.cardBg, borderRadius: '12px', border: `1px solid ${cc.border}`, overflow: 'hidden' }}>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ backgroundColor: cc.borderLight }}>
                  {['Rank', 'Agency Name', 'Points', 'Level', 'Badges Earned', 'Actions'].map(col => (
                    <th key={col} style={{ padding: '12px 16px', textAlign: 'left', fontSize: '11px', fontWeight: 600, color: cc.textMuted, textTransform: 'uppercase', letterSpacing: '0.05em', whiteSpace: 'nowrap' }}>
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leaderboard.map((agency, i) => {
                  const levelColor = LEVEL_COLORS[agency.level] || LEVEL_COLORS.Bronze;
                  return (
                    <tr
                      key={agency.rank}
                      style={{
                        borderTop: `1px solid ${cc.borderLight}`,
                        backgroundColor: i % 2 === 0 ? '#fff' : cc.pageBg,
                      }}
                    >
                      {/* Rank */}
                      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                          {RANK_MEDAL[agency.rank] ? (
                            <span style={{ fontSize: '18px' }}>{RANK_MEDAL[agency.rank]}</span>
                          ) : (
                            <span style={{
                              width: '26px',
                              height: '26px',
                              borderRadius: '50%',
                              backgroundColor: cc.borderLight,
                              display: 'inline-flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              fontSize: '12px',
                              fontWeight: 700,
                              color: cc.textMuted,
                            }}>
                              {agency.rank}
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Agency Name */}
                      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                        <p style={{ fontSize: '14px', fontWeight: 600, color: cc.textPrimary, margin: 0 }}>{agency.agencyName}</p>
                      </td>

                      {/* Points */}
                      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                        <p style={{ fontSize: '14px', fontWeight: '700', color: cc.primary, margin: 0 }}>
                          {agency.points.toLocaleString('id-ID')} pts
                        </p>
                      </td>

                      {/* Level */}
                      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                        <span style={{
                          fontSize: '11px',
                          fontWeight: 700,
                          color: levelColor.text,
                          backgroundColor: levelColor.bg,
                          padding: '3px 10px',
                          borderRadius: '6px',
                        }}>
                          {agency.level}
                        </span>
                      </td>

                      {/* Badges Earned */}
                      <td style={{ padding: '14px 16px', whiteSpace: 'nowrap' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Award style={{ width: '14px', height: '14px', color: '#F59E0B' }} />
                          <span style={{ fontSize: '13px', fontWeight: 600, color: cc.textSecondary }}>{agency.badgesEarned}</span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td style={{ padding: '14px 16px' }}>
                        {resetConfirm === agency.rank ? (
                          <div style={{ display: 'flex', gap: '4px' }}>
                            <button
                              onClick={() => handleReset(agency.rank)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '6px',
                                border: 'none',
                                backgroundColor: '#DC2626',
                                color: 'white',
                                fontSize: '11px',
                                fontWeight: 600,
                                cursor: 'pointer',
                                whiteSpace: 'nowrap',
                              }}
                            >
                              Ya, Reset
                            </button>
                            <button
                              onClick={() => setResetConfirm(null)}
                              style={{
                                padding: '4px 8px',
                                borderRadius: '6px',
                                border: `1px solid ${cc.border}`,
                                backgroundColor: cc.cardBg,
                                color: cc.textMuted,
                                fontSize: '11px',
                                cursor: 'pointer',
                              }}
                            >
                              Batal
                            </button>
                          </div>
                        ) : (
                          <button
                            title="Reset Points"
                            onClick={() => setResetConfirm(agency.rank)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                              padding: '5px 10px',
                              borderRadius: '6px',
                              border: `1px solid #FECACA`,
                              backgroundColor: '#FEF2F2',
                              color: '#DC2626',
                              fontSize: '12px',
                              fontWeight: 500,
                              cursor: 'pointer',
                              whiteSpace: 'nowrap',
                            }}
                          >
                            <RotateCcw style={{ width: '13px', height: '13px' }} />
                            Reset Points
                          </button>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          {/* Footer */}
          <div style={{ padding: '12px 20px', borderTop: `1px solid ${cc.borderLight}` }}>
            <p style={{ fontSize: '13px', color: cc.textMuted, margin: 0 }}>
              Menampilkan {leaderboard.length} agensi teratas
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
