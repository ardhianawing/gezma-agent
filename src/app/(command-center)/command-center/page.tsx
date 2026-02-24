'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, Users, Plane, DollarSign, ChevronRight } from 'lucide-react';

const cc = {
  primary: '#2563EB',
  cardBg: '#FFFFFF',
  border: '#E2E8F0',
  borderLight: '#F1F5F9',
  textPrimary: '#0F172A',
  textSecondary: '#334155',
  textMuted: '#64748B',
};

interface Stats {
  totalAgencies: number;
  totalPilgrims: number;
  totalTrips: number;
  totalRevenue: number;
  recentAgencies: { id: string; name: string; ppiuStatus: string; createdAt: string; _count: { pilgrims: number } }[];
}

const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: '#FEF3C7', text: '#D97706' },
  active: { bg: '#DCFCE7', text: '#15803D' },
  expiring: { bg: '#FFEDD5', text: '#EA580C' },
  expired: { bg: '#FEE2E2', text: '#DC2626' },
  suspended: { bg: '#F1F5F9', text: '#64748B' },
};

export default function CCDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/command-center/stats')
      .then(r => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Total Agencies', value: stats?.totalAgencies ?? 0, icon: Building2, color: '#2563EB' },
    { label: 'Total Jemaah', value: stats?.totalPilgrims ?? 0, icon: Users, color: '#10B981' },
    { label: 'Total Trips', value: stats?.totalTrips ?? 0, icon: Plane, color: '#F59E0B' },
    { label: 'Total Revenue', value: `Rp ${((stats?.totalRevenue ?? 0) / 1_000_000).toFixed(1)}M`, icon: DollarSign, color: '#8B5CF6' },
  ];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: cc.textPrimary, margin: 0 }}>
          Command Center Dashboard
        </h1>
        <p style={{ fontSize: '14px', color: cc.textMuted, marginTop: '4px' }}>
          Overview seluruh agensi dalam ekosistem GEZMA.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', opacity: loading ? 0.5 : 1 }}>
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
                <p style={{ fontSize: '12px', color: cc.textMuted, margin: 0 }}>{card.label}</p>
                <p style={{ fontSize: '24px', fontWeight: '700', color: cc.textPrimary, margin: '4px 0 0 0' }}>
                  {card.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Recent Agencies */}
      <div style={{ backgroundColor: cc.cardBg, borderRadius: '12px', border: `1px solid ${cc.border}`, overflow: 'hidden' }}>
        <div style={{ padding: '20px', borderBottom: `1px solid ${cc.borderLight}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: cc.textPrimary, margin: 0 }}>Agensi Terbaru</h2>
          <Link href="/command-center/agencies" style={{ fontSize: '13px', color: cc.primary, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Lihat Semua <ChevronRight style={{ width: '14px', height: '14px' }} />
          </Link>
        </div>
        <div style={{ padding: '20px' }}>
          {!stats?.recentAgencies?.length ? (
            <p style={{ textAlign: 'center', color: cc.textMuted, fontSize: '14px' }}>Belum ada agensi.</p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {stats.recentAgencies.map(agency => {
                const status = statusColors[agency.ppiuStatus] || statusColors.pending;
                return (
                  <Link key={agency.id} href={`/command-center/agencies/${agency.id}`} style={{ textDecoration: 'none' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '14px',
                        borderRadius: '8px',
                        border: `1px solid ${cc.borderLight}`,
                        cursor: 'pointer',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: cc.textPrimary, margin: 0 }}>{agency.name}</p>
                        <p style={{ fontSize: '12px', color: cc.textMuted, margin: '2px 0 0 0' }}>
                          {agency._count.pilgrims} jemaah &middot; {new Date(agency.createdAt).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: '600',
                          padding: '4px 10px',
                          borderRadius: '6px',
                          backgroundColor: status.bg,
                          color: status.text,
                          textTransform: 'capitalize',
                        }}
                      >
                        {agency.ppiuStatus}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
