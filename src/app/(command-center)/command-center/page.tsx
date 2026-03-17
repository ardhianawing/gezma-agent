'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, Users, Plane, DollarSign, ChevronRight, AlertTriangle, BarChart3, ShieldOff } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend,
} from 'recharts';

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

interface AnalyticsData {
  pilgrimGrowth: { date: string; count: number }[];
  agencyPerformance: { id: string; name: string; pilgrimCount: number }[];
  tripStats: { status: string; count: number }[];
  revenueEstimate: { month: string; amount: number }[];
  categoryBreakdown: { category: string; count: number }[];
}

const CHART_COLORS = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444', '#06B6D4', '#EC4899'];
const PIE_COLORS = ['#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EF4444'];

const statusColors: Record<string, { bg: string; text: string }> = {
  pending: { bg: '#FEF3C7', text: '#D97706' },
  active: { bg: '#DCFCE7', text: '#15803D' },
  expiring: { bg: '#FFEDD5', text: '#EA580C' },
  expired: { bg: '#FEE2E2', text: '#DC2626' },
  suspended: { bg: '#F1F5F9', text: '#64748B' },
};

export default function CCDashboardPage() {
  const { t } = useLanguage();
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [alerts, setAlerts] = useState<PPIUAlert[]>([]);
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [analyticsPeriod, setAnalyticsPeriod] = useState('30d');
  const [analyticsLoading, setAnalyticsLoading] = useState(false);
  const [suspendLoading, setSuspendLoading] = useState(false);
  const [suspendResult, setSuspendResult] = useState<{ count: number; names: string[] } | null>(null);
  const [showSuspendConfirm, setShowSuspendConfirm] = useState(false);

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

  useEffect(() => {
    setAnalyticsLoading(true);
    fetch(`/api/command-center/analytics?period=${analyticsPeriod}`)
      .then(r => r.json())
      .then(setAnalytics)
      .catch(console.error)
      .finally(() => setAnalyticsLoading(false));
  }, [analyticsPeriod]);

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

      {/* Auto-Suspend PPIU Expired */}
      <div
        style={{
          backgroundColor: cc.cardBg,
          borderRadius: '12px',
          border: `1px solid ${cc.border}`,
          padding: '16px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: '12px',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShieldOff style={{ width: '22px', height: '22px', color: '#DC2626', flexShrink: 0 }} />
          <div>
            <p style={{ fontSize: '14px', fontWeight: '600', color: cc.textPrimary, margin: 0 }}>
              Auto-Suspend PPIU Expired
            </p>
            <p style={{ fontSize: '12px', color: cc.textMuted, margin: '2px 0 0 0' }}>
              Otomatis ubah status agensi yang PPIU-nya sudah kedaluwarsa menjadi &quot;expired&quot;.
            </p>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          {suspendResult && (
            <span style={{ fontSize: '13px', color: suspendResult.count > 0 ? '#DC2626' : '#15803D', fontWeight: '500' }}>
              {suspendResult.count > 0
                ? `${suspendResult.count} agensi di-suspend: ${suspendResult.names.join(', ')}`
                : 'Tidak ada agensi yang perlu di-suspend.'
              }
            </span>
          )}
          {!showSuspendConfirm ? (
            <button
              onClick={() => setShowSuspendConfirm(true)}
              disabled={suspendLoading}
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                fontWeight: '600',
                backgroundColor: '#DC2626',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: suspendLoading ? 'not-allowed' : 'pointer',
                opacity: suspendLoading ? 0.6 : 1,
                whiteSpace: 'nowrap',
              }}
            >
              {suspendLoading ? 'Memproses...' : 'Jalankan'}
            </button>
          ) : (
            <div style={{ display: 'flex', gap: '6px' }}>
              <button
                onClick={async () => {
                  setSuspendLoading(true);
                  setSuspendResult(null);
                  setShowSuspendConfirm(false);
                  try {
                    const res = await fetch('/api/command-center/auto-suspend', { method: 'POST' });
                    const data = await res.json();
                    setSuspendResult({
                      count: data.count || 0,
                      names: (data.affected || []).map((a: { name: string }) => a.name),
                    });
                  } catch {
                    setSuspendResult({ count: -1, names: ['Error saat eksekusi'] });
                  } finally {
                    setSuspendLoading(false);
                  }
                }}
                style={{
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: '600',
                  backgroundColor: '#DC2626',
                  color: 'white',
                  border: 'none',
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                Ya, Jalankan
              </button>
              <button
                onClick={() => setShowSuspendConfirm(false)}
                style={{
                  padding: '8px 16px',
                  fontSize: '13px',
                  fontWeight: '500',
                  backgroundColor: cc.cardBg,
                  color: cc.textSecondary,
                  border: `1px solid ${cc.border}`,
                  borderRadius: '8px',
                  cursor: 'pointer',
                }}
              >
                Batal
              </button>
            </div>
          )}
        </div>
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
          <h2 style={{ fontSize: '18px', fontWeight: '600', color: cc.textPrimary, margin: 0 }}>{t.commandCenter.agenciesTitle}</h2>
          <Link href="/command-center/agencies" style={{ fontSize: '13px', color: cc.primary, textDecoration: 'none', display: 'flex', alignItems: 'center', gap: '4px' }}>
            Lihat Semua <ChevronRight style={{ width: '14px', height: '14px' }} />
          </Link>
        </div>
        <div style={{ padding: '20px' }}>
          {!stats?.recentAgencies?.length ? (
            <p style={{ textAlign: 'center', color: cc.textMuted, fontSize: '14px' }}>{t.common.noData}</p>
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

      {/* Analytics Section */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <BarChart3 style={{ width: '22px', height: '22px', color: cc.primary }} />
            <h2 style={{ fontSize: '20px', fontWeight: '600', color: cc.textPrimary, margin: 0 }}>
              Big Data Analytics
            </h2>
          </div>
          <div style={{ display: 'flex', gap: '6px' }}>
            {(['7d', '30d', '90d', '1y'] as const).map(p => (
              <button
                key={p}
                onClick={() => setAnalyticsPeriod(p)}
                style={{
                  padding: '6px 14px',
                  borderRadius: '8px',
                  border: `1px solid ${analyticsPeriod === p ? cc.primary : cc.border}`,
                  backgroundColor: analyticsPeriod === p ? '#EFF6FF' : cc.cardBg,
                  color: analyticsPeriod === p ? cc.primary : cc.textMuted,
                  fontSize: '13px',
                  fontWeight: analyticsPeriod === p ? 600 : 400,
                  cursor: 'pointer',
                }}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {analyticsLoading ? (
          <p style={{ textAlign: 'center', color: cc.textMuted, fontSize: '14px', padding: '40px 0' }}>
            Memuat analytics...
          </p>
        ) : analytics && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
            {/* Pilgrim Growth - Line Chart */}
            <div style={{
              backgroundColor: cc.cardBg,
              borderRadius: '12px',
              border: `1px solid ${cc.border}`,
              padding: '20px',
            }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: cc.textPrimary, margin: '0 0 16px 0' }}>
                Pertumbuhan Jemaah
              </h3>
              <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                  <LineChart data={analytics.pilgrimGrowth}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis
                      dataKey="date"
                      tick={{ fontSize: 11, fill: '#64748B' }}
                      tickFormatter={(v: string) => v.slice(5)}
                    />
                    <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', fontSize: '13px' }}
                      labelFormatter={(v) => `Tanggal: ${v}`}
                    />
                    <Line type="monotone" dataKey="count" stroke="#2563EB" strokeWidth={2} dot={false} name="Jemaah Baru" />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Top Agencies - Bar Chart */}
            <div style={{
              backgroundColor: cc.cardBg,
              borderRadius: '12px',
              border: `1px solid ${cc.border}`,
              padding: '20px',
            }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: cc.textPrimary, margin: '0 0 16px 0' }}>
                Top 10 Agensi
              </h3>
              <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                  <BarChart data={analytics.agencyPerformance} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis type="number" tick={{ fontSize: 11, fill: '#64748B' }} />
                    <YAxis
                      type="category"
                      dataKey="name"
                      tick={{ fontSize: 11, fill: '#64748B' }}
                      width={100}
                    />
                    <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '13px' }} />
                    <Bar dataKey="pilgrimCount" name="Jemaah" radius={[0, 4, 4, 0]}>
                      {analytics.agencyPerformance.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Trip Status - Pie Chart */}
            <div style={{
              backgroundColor: cc.cardBg,
              borderRadius: '12px',
              border: `1px solid ${cc.border}`,
              padding: '20px',
            }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: cc.textPrimary, margin: '0 0 16px 0' }}>
                Status Perjalanan
              </h3>
              <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={analytics.tripStats}
                      dataKey="count"
                      nameKey="status"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={(props) => `${props.name} (${props.value})`}
                      labelLine={false}
                    >
                      {analytics.tripStats.map((_, i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '13px' }} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Revenue - Area Chart */}
            <div style={{
              backgroundColor: cc.cardBg,
              borderRadius: '12px',
              border: `1px solid ${cc.border}`,
              padding: '20px',
            }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: cc.textPrimary, margin: '0 0 16px 0' }}>
                Estimasi Revenue Bulanan
              </h3>
              <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                  <AreaChart data={analytics.revenueEstimate}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="month" tick={{ fontSize: 11, fill: '#64748B' }} />
                    <YAxis
                      tick={{ fontSize: 11, fill: '#64748B' }}
                      tickFormatter={(v: number) => `${(v / 1_000_000).toFixed(0)}M`}
                    />
                    <Tooltip
                      contentStyle={{ borderRadius: '8px', fontSize: '13px' }}
                      formatter={(value) => [`Rp ${(Number(value) / 1_000_000).toFixed(1)}M`, 'Revenue']}
                    />
                    <Area type="monotone" dataKey="amount" stroke="#8B5CF6" fill="#8B5CF620" strokeWidth={2} name="Revenue" />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Hotel Preferences - Pie Chart */}
            <div style={{
              backgroundColor: cc.cardBg,
              borderRadius: '12px',
              border: `1px solid ${cc.border}`,
              padding: '20px',
            }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: cc.textPrimary, margin: '0 0 16px 0' }}>
                Preferensi Hotel
              </h3>
              <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                  <PieChart>
                    <Pie
                      data={[
                        { name: 'Bintang 5', value: 35 },
                        { name: 'Bintang 4', value: 30 },
                        { name: 'Bintang 3', value: 25 },
                        { name: 'Bintang 2', value: 10 },
                      ]}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={90}
                      label={(props) => `${props.name} (${props.value}%)`}
                      labelLine={false}
                    >
                      {[0, 1, 2, 3].map((i) => (
                        <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '13px' }} />
                    <Legend wrapperStyle={{ fontSize: '12px' }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Spending Patterns - Bar Chart */}
            <div style={{
              backgroundColor: cc.cardBg,
              borderRadius: '12px',
              border: `1px solid ${cc.border}`,
              padding: '20px',
            }}>
              <h3 style={{ fontSize: '15px', fontWeight: '600', color: cc.textPrimary, margin: '0 0 16px 0' }}>
                Pola Pengeluaran (Juta Rp)
              </h3>
              <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                  <BarChart data={[
                    { category: 'Tiket Pesawat', amount: 450 },
                    { category: 'Hotel', amount: 320 },
                    { category: 'Transport Lokal', amount: 85 },
                    { category: 'Makan', amount: 120 },
                    { category: 'Oleh-oleh', amount: 95 },
                    { category: 'Visa', amount: 150 },
                  ]}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" />
                    <XAxis dataKey="category" tick={{ fontSize: 11, fill: '#64748B' }} />
                    <YAxis tick={{ fontSize: 11, fill: '#64748B' }} />
                    <Tooltip contentStyle={{ borderRadius: '8px', fontSize: '13px' }} />
                    <Bar dataKey="amount" name="Jumlah (Juta Rp)" fill="#2563EB" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
