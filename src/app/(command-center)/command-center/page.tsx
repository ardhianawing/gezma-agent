'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, Users, Plane, DollarSign, ChevronRight, AlertTriangle } from 'lucide-react';

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

interface PPIUAlert {
  id: string;
  name: string;
  ppiuNumber: string | null;
  ppiuExpiryDate: string;
  daysRemaining: number;
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
  const [alerts, setAlerts] = useState<PPIUAlert[]>([]);

  useEffect(() => {
    fetch('/api/command-center/stats')
      .then(r => r.json())
      .then(setStats)
      .catch(console.error)
      .finally(() => setLoading(false));

    fetch('/api/command-center/alerts')
      .then(r => r.json())
      .then(data => setAlerts(data.data || []))
      .catch(console.error);
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

      {/* PPIU Expiry Alerts */}
      {alerts.length > 0 && (
        <div
          style={{
            borderRadius: '12px',
            border: `1px solid ${alerts.some(a => a.daysRemaining < 0) ? '#FECACA' : '#FED7AA'}`,
            backgroundColor: alerts.some(a => a.daysRemaining < 0) ? '#FEF2F2' : '#FFFBEB',
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: '16px 20px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              borderBottom: `1px solid ${alerts.some(a => a.daysRemaining < 0) ? '#FECACA' : '#FED7AA'}`,
            }}
          >
            <AlertTriangle
              style={{
                width: '22px',
                height: '22px',
                color: alerts.some(a => a.daysRemaining < 0) ? '#DC2626' : '#EA580C',
                flexShrink: 0,
              }}
            />
            <div>
              <p style={{ fontSize: '15px', fontWeight: '600', color: '#0F172A', margin: 0 }}>
                {alerts.length} agensi dengan PPIU akan/sudah kedaluwarsa
              </p>
              <p style={{ fontSize: '13px', color: '#64748B', margin: '2px 0 0 0' }}>
                Agensi dengan izin PPIU yang mendekati atau melewati masa berlaku.
              </p>
            </div>
          </div>
          <div style={{ padding: '12px 20px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {alerts.map(alert => {
              const isExpired = alert.daysRemaining < 0;
              return (
                <Link key={alert.id} href={`/command-center/agencies/${alert.id}`} style={{ textDecoration: 'none' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 14px',
                      borderRadius: '8px',
                      backgroundColor: isExpired ? '#FEE2E2' : '#FFF7ED',
                      border: `1px solid ${isExpired ? '#FECACA' : '#FDBA74'}`,
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p style={{ fontSize: '14px', fontWeight: '600', color: '#0F172A', margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {alert.name}
                      </p>
                      <p style={{ fontSize: '12px', color: '#64748B', margin: '2px 0 0 0' }}>
                        PPIU: {alert.ppiuNumber || '-'}
                      </p>
                    </div>
                    <span
                      style={{
                        fontSize: '12px',
                        fontWeight: '600',
                        padding: '4px 10px',
                        borderRadius: '6px',
                        backgroundColor: isExpired ? '#DC2626' : '#EA580C',
                        color: '#FFFFFF',
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                      }}
                    >
                      {isExpired
                        ? `Expired ${Math.abs(alert.daysRemaining)} hari lalu`
                        : alert.daysRemaining === 0
                          ? 'Kedaluwarsa hari ini'
                          : `${alert.daysRemaining} hari lagi`
                      }
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

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
