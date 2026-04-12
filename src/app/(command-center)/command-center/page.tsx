'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Building2, Users, Plane, DollarSign, ChevronRight, AlertTriangle, BarChart3, ShieldOff } from 'lucide-react';
import { useLanguage } from '@/lib/i18n';
import {
  LineChart, Line, BarChart, Bar, PieChart, Pie, AreaChart, Area,
  XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell, Legend,
} from 'recharts';

// ─── Design tokens ────────────────────────────────────────────────────────────
const bg = '#0F172A';
const cardBg = '#1E293B';
const cardBorder = 'rgba(255,255,255,0.06)';
const textPrimary = '#F1F5F9';
const textSecondary = '#94A3B8';
const textMuted = '#64748B';
const accent = '#F59E0B';
const accentLight = 'rgba(245,158,11,0.1)';
const success = '#22C55E';
const error = '#EF4444';
// const warning = '#F59E0B'; // same as accent, available if needed

// Chart palette: gold · teal · blue · coral · violet · cyan · pink
const CHART_COLORS = ['#F59E0B', '#14B8A6', '#3B82F6', '#F87171', '#A78BFA', '#22D3EE', '#F472B6'];
const PIE_COLORS  = ['#F59E0B', '#14B8A6', '#3B82F6', '#F87171', '#A78BFA'];

const statusColors: Record<string, { bg: string; text: string }> = {
  pending:   { bg: 'rgba(245,158,11,0.15)',  text: '#F59E0B' },
  active:    { bg: 'rgba(34,197,94,0.15)',   text: '#22C55E' },
  expiring:  { bg: 'rgba(251,146,60,0.15)',  text: '#FB923C' },
  expired:   { bg: 'rgba(239,68,68,0.15)',   text: '#EF4444' },
  suspended: { bg: 'rgba(100,116,139,0.15)', text: '#94A3B8' },
};

// ─── Helpers ──────────────────────────────────────────────────────────────────
function SectionTitle({ icon: Icon, title }: { icon: React.ElementType; title: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '4px' }}>
      <Icon style={{ width: '22px', height: '22px', color: accent, flexShrink: 0 }} />
      <h2
        style={{
          fontSize: '20px',
          fontWeight: '700',
          color: textPrimary,
          margin: 0,
          paddingBottom: '6px',
          borderBottom: `2px solid ${accent}`,
        }}
      >
        {title}
      </h2>
    </div>
  );
}

function Card({ children, style = {} }: { children: React.ReactNode; style?: React.CSSProperties }) {
  return (
    <div
      style={{
        backgroundColor: cardBg,
        borderRadius: '14px',
        border: `1px solid ${cardBorder}`,
        boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
        ...style,
      }}
    >
      {children}
    </div>
  );
}

// ─── Types ────────────────────────────────────────────────────────────────────
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

// ─── Component ────────────────────────────────────────────────────────────────
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
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [hoveredRow, setHoveredRow] = useState<string | null>(null);
  const [hoveredBtn, setHoveredBtn] = useState<string | null>(null);

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

  // Stat card definitions
  const statCards = [
    { key: 'agencies', label: 'Total Agencies',  value: stats?.totalAgencies ?? 0, icon: Building2, gradient: 'linear-gradient(135deg, #3B82F6, #1D4ED8)' },
    { key: 'jemaah',   label: 'Total Jemaah',    value: stats?.totalPilgrims ?? 0, icon: Users,     gradient: 'linear-gradient(135deg, #14B8A6, #0F766E)' },
    { key: 'trips',    label: 'Total Trips',      value: stats?.totalTrips ?? 0,   icon: Plane,      gradient: 'linear-gradient(135deg, #F59E0B, #B45309)' },
    {
      key: 'revenue',
      label: 'Total Revenue',
      value: `Rp ${((stats?.totalRevenue ?? 0) / 1_000_000).toFixed(1)}M`,
      icon: DollarSign,
      gradient: 'linear-gradient(135deg, #A78BFA, #6D28D9)',
      gold: true,
    },
  ];

  // Shared tooltip style for charts
  const tooltipStyle = {
    backgroundColor: '#1E293B',
    border: `1px solid rgba(255,255,255,0.08)`,
    borderRadius: '8px',
    fontSize: '13px',
    color: textPrimary,
  };
  const tickStyle = { fontSize: 11, fill: textMuted };
  const gridStroke = 'rgba(255,255,255,0.05)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '28px', padding: '4px 0' }}>

      {/* ── Page header ── */}
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: '800', color: textPrimary, margin: 0, letterSpacing: '-0.5px' }}>
          Command Center Dashboard
        </h1>
        <p style={{ fontSize: '14px', color: textMuted, marginTop: '6px', margin: '6px 0 0 0' }}>
          Overview seluruh agensi dalam ekosistem GEZMA.
        </p>
      </div>

      {/* ── Stat cards ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px', opacity: loading ? 0.5 : 1 }}>
        {statCards.map(card => {
          const Icon = card.icon;
          const isHovered = hoveredCard === card.key;
          return (
            <div
              key={card.key}
              onMouseEnter={() => setHoveredCard(card.key)}
              onMouseLeave={() => setHoveredCard(null)}
              style={{
                backgroundColor: cardBg,
                borderRadius: '14px',
                border: `1px solid ${isHovered ? `rgba(245,158,11,0.25)` : cardBorder}`,
                padding: '22px 20px',
                display: 'flex',
                alignItems: 'center',
                gap: '16px',
                boxShadow: isHovered
                  ? `0 0 0 1px rgba(245,158,11,0.15), 0 8px 32px rgba(0,0,0,0.4)`
                  : '0 4px 16px rgba(0,0,0,0.3)',
                transition: 'all 0.2s ease',
                cursor: 'default',
              }}
            >
              {/* Icon circle */}
              <div
                style={{
                  width: '50px',
                  height: '50px',
                  borderRadius: '50%',
                  background: card.gradient,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  flexShrink: 0,
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                }}
              >
                <Icon style={{ width: '22px', height: '22px', color: '#FFFFFF' }} />
              </div>
              <div>
                <p style={{ fontSize: '12px', color: textMuted, margin: 0, textTransform: 'uppercase', letterSpacing: '0.6px' }}>
                  {card.label}
                </p>
                <p
                  style={{
                    fontSize: '26px',
                    fontWeight: '800',
                    color: card.gold ? accent : textPrimary,
                    margin: '4px 0 0 0',
                    lineHeight: 1,
                    letterSpacing: '-0.5px',
                  }}
                >
                  {card.value}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* ── Auto-Suspend PPIU Expired ── */}
      <Card style={{ padding: '18px 22px' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px', height: '40px', borderRadius: '10px',
                backgroundColor: 'rgba(239,68,68,0.12)',
                display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
              }}
            >
              <ShieldOff style={{ width: '20px', height: '20px', color: error }} />
            </div>
            <div>
              <p style={{ fontSize: '14px', fontWeight: '700', color: textPrimary, margin: 0 }}>
                Auto-Suspend PPIU Expired
              </p>
              <p style={{ fontSize: '12px', color: textMuted, margin: '2px 0 0 0' }}>
                Otomatis ubah status agensi yang PPIU-nya sudah kedaluwarsa menjadi &quot;expired&quot;.
              </p>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            {suspendResult && (
              <span
                style={{
                  fontSize: '13px',
                  color: suspendResult.count > 0 ? error : success,
                  fontWeight: '600',
                }}
              >
                {suspendResult.count > 0
                  ? `${suspendResult.count} agensi di-suspend: ${suspendResult.names.join(', ')}`
                  : 'Tidak ada agensi yang perlu di-suspend.'}
              </span>
            )}

            {!showSuspendConfirm ? (
              <button
                onClick={() => setShowSuspendConfirm(true)}
                disabled={suspendLoading}
                onMouseEnter={() => setHoveredBtn('run')}
                onMouseLeave={() => setHoveredBtn(null)}
                style={{
                  padding: '9px 18px',
                  fontSize: '13px',
                  fontWeight: '600',
                  backgroundColor: hoveredBtn === 'run' ? error : 'rgba(239,68,68,0.12)',
                  color: error,
                  border: `1px solid ${error}`,
                  borderRadius: '8px',
                  cursor: suspendLoading ? 'not-allowed' : 'pointer',
                  opacity: suspendLoading ? 0.6 : 1,
                  whiteSpace: 'nowrap',
                  transition: 'all 0.2s ease',
                  ...(hoveredBtn === 'run' ? { color: '#fff' } : {}),
                }}
              >
                {suspendLoading ? 'Memproses...' : 'Jalankan'}
              </button>
            ) : (
              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  onMouseEnter={() => setHoveredBtn('confirm')}
                  onMouseLeave={() => setHoveredBtn(null)}
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
                    padding: '9px 18px',
                    fontSize: '13px',
                    fontWeight: '600',
                    backgroundColor: hoveredBtn === 'confirm' ? error : 'rgba(239,68,68,0.12)',
                    color: hoveredBtn === 'confirm' ? '#fff' : error,
                    border: `1px solid ${error}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  Ya, Jalankan
                </button>
                <button
                  onMouseEnter={() => setHoveredBtn('cancel')}
                  onMouseLeave={() => setHoveredBtn(null)}
                  onClick={() => setShowSuspendConfirm(false)}
                  style={{
                    padding: '9px 18px',
                    fontSize: '13px',
                    fontWeight: '500',
                    backgroundColor: hoveredBtn === 'cancel' ? 'rgba(255,255,255,0.06)' : 'transparent',
                    color: textSecondary,
                    border: `1px solid ${cardBorder}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  Batal
                </button>
              </div>
            )}
          </div>
        </div>
      </Card>

      {/* ── PPIU Expiry Alerts ── */}
      {alerts.length > 0 && (
        <div
          style={{
            borderRadius: '14px',
            border: `1px solid ${cardBorder}`,
            backgroundColor: cardBg,
            overflow: 'hidden',
            boxShadow: '0 4px 24px rgba(0,0,0,0.3)',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '16px 22px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              borderBottom: `1px solid ${cardBorder}`,
              borderLeft: `4px solid ${alerts.some(a => a.daysRemaining < 0) ? error : accent}`,
            }}
          >
            <AlertTriangle
              style={{
                width: '22px',
                height: '22px',
                color: alerts.some(a => a.daysRemaining < 0) ? error : accent,
                flexShrink: 0,
              }}
            />
            <div>
              <p style={{ fontSize: '15px', fontWeight: '700', color: textPrimary, margin: 0 }}>
                {alerts.length} agensi dengan PPIU akan/sudah kedaluwarsa
              </p>
              <p style={{ fontSize: '13px', color: textMuted, margin: '2px 0 0 0' }}>
                Agensi dengan izin PPIU yang mendekati atau melewati masa berlaku.
              </p>
            </div>
          </div>

          {/* Alert rows */}
          <div style={{ padding: '14px 18px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {alerts.map(alert => {
              const isExpired = alert.daysRemaining < 0;
              const borderColor = isExpired ? error : accent;
              return (
                <Link key={alert.id} href={`/command-center/agencies/${alert.id}`} style={{ textDecoration: 'none' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 16px',
                      borderRadius: '10px',
                      backgroundColor: isExpired ? 'rgba(239,68,68,0.07)' : accentLight,
                      border: `1px solid ${isExpired ? 'rgba(239,68,68,0.2)' : 'rgba(245,158,11,0.2)'}`,
                      borderLeft: `3px solid ${borderColor}`,
                      transition: 'background-color 0.15s ease',
                    }}
                  >
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: textPrimary,
                          margin: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                        }}
                      >
                        {alert.name}
                      </p>
                      <p style={{ fontSize: '12px', color: textMuted, margin: '2px 0 0 0' }}>
                        PPIU: {alert.ppiuNumber || '-'}
                      </p>
                    </div>
                    <span
                      style={{
                        fontSize: '11px',
                        fontWeight: '700',
                        padding: '4px 12px',
                        borderRadius: '99px',
                        backgroundColor: isExpired ? 'rgba(239,68,68,0.15)' : 'rgba(245,158,11,0.15)',
                        color: isExpired ? error : accent,
                        border: `1px solid ${isExpired ? 'rgba(239,68,68,0.3)' : 'rgba(245,158,11,0.3)'}`,
                        whiteSpace: 'nowrap',
                        flexShrink: 0,
                        letterSpacing: '0.3px',
                      }}
                    >
                      {isExpired
                        ? `Expired ${Math.abs(alert.daysRemaining)} hari lalu`
                        : alert.daysRemaining === 0
                          ? 'Kedaluwarsa hari ini'
                          : `${alert.daysRemaining} hari lagi`}
                    </span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      )}

      {/* ── Recent Agencies table ── */}
      <Card style={{ overflow: 'hidden' }}>
        {/* Table header */}
        <div
          style={{
            padding: '18px 22px',
            borderBottom: `1px solid ${cardBorder}`,
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            backgroundColor: '#263145',
          }}
        >
          <h2 style={{ fontSize: '16px', fontWeight: '700', color: textPrimary, margin: 0 }}>
            {t.commandCenter.agenciesTitle}
          </h2>
          <Link
            href="/command-center/agencies"
            style={{
              fontSize: '13px',
              color: accent,
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              fontWeight: '600',
            }}
          >
            Lihat Semua <ChevronRight style={{ width: '14px', height: '14px' }} />
          </Link>
        </div>

        <div style={{ padding: '16px 20px' }}>
          {!stats?.recentAgencies?.length ? (
            <p style={{ textAlign: 'center', color: textMuted, fontSize: '14px', padding: '24px 0' }}>
              {t.common.noData}
            </p>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {stats.recentAgencies.map((agency, idx) => {
                const status = statusColors[agency.ppiuStatus] || statusColors.pending;
                const isRowHovered = hoveredRow === agency.id;
                const isEven = idx % 2 === 0;
                return (
                  <Link key={agency.id} href={`/command-center/agencies/${agency.id}`} style={{ textDecoration: 'none' }}>
                    <div
                      onMouseEnter={() => setHoveredRow(agency.id)}
                      onMouseLeave={() => setHoveredRow(null)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '13px 14px',
                        borderRadius: '8px',
                        backgroundColor: isRowHovered
                          ? 'rgba(245,158,11,0.05)'
                          : isEven
                            ? 'transparent'
                            : 'rgba(255,255,255,0.02)',
                        cursor: 'pointer',
                        transition: 'background-color 0.15s ease',
                      }}
                    >
                      <div style={{ flex: 1 }}>
                        <p style={{ fontSize: '14px', fontWeight: '600', color: textPrimary, margin: 0 }}>
                          {agency.name}
                        </p>
                        <p style={{ fontSize: '12px', color: textMuted, margin: '2px 0 0 0' }}>
                          {agency._count.pilgrims} jemaah &middot;{' '}
                          {new Date(agency.createdAt).toLocaleDateString('id-ID')}
                        </p>
                      </div>
                      <span
                        style={{
                          fontSize: '11px',
                          fontWeight: '700',
                          padding: '4px 12px',
                          borderRadius: '99px',
                          backgroundColor: status.bg,
                          color: status.text,
                          textTransform: 'capitalize',
                          letterSpacing: '0.3px',
                          border: `1px solid ${status.text}30`,
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
      </Card>

      {/* ── Analytics Section ── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
        {/* Section header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '12px' }}>
          <SectionTitle icon={BarChart3} title="Big Data Analytics" />

          {/* Period toggle */}
          <div style={{ display: 'flex', gap: '6px' }}>
            {(['7d', '30d', '90d', '1y'] as const).map(p => {
              const isActive = analyticsPeriod === p;
              return (
                <button
                  key={p}
                  onClick={() => setAnalyticsPeriod(p)}
                  style={{
                    padding: '7px 16px',
                    borderRadius: '8px',
                    border: `1px solid ${isActive ? accent : cardBorder}`,
                    backgroundColor: isActive ? accentLight : 'transparent',
                    color: isActive ? accent : textMuted,
                    fontSize: '13px',
                    fontWeight: isActive ? 700 : 400,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {p}
                </button>
              );
            })}
          </div>
        </div>

        {analyticsLoading ? (
          <p style={{ textAlign: 'center', color: textMuted, fontSize: '14px', padding: '48px 0' }}>
            Memuat analytics...
          </p>
        ) : analytics && (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>

            {/* Pilgrim Growth — Line Chart */}
            <Card style={{ padding: '22px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: textPrimary, margin: '0 0 18px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Pertumbuhan Jemaah
              </h3>
              <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                  <LineChart data={analytics.pilgrimGrowth}>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                    <XAxis dataKey="date" tick={tickStyle} tickFormatter={(v: string) => v.slice(5)} />
                    <YAxis tick={tickStyle} />
                    <Tooltip contentStyle={tooltipStyle} labelFormatter={(v) => `Tanggal: ${v}`} />
                    <Line
                      type="monotone"
                      dataKey="count"
                      stroke={accent}
                      strokeWidth={2.5}
                      dot={false}
                      name="Jemaah Baru"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Top Agencies — Horizontal Bar Chart */}
            <Card style={{ padding: '22px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: textPrimary, margin: '0 0 18px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Top 10 Agensi
              </h3>
              <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                  <BarChart data={analytics.agencyPerformance} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                    <XAxis type="number" tick={tickStyle} />
                    <YAxis type="category" dataKey="name" tick={tickStyle} width={100} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="pilgrimCount" name="Jemaah" radius={[0, 4, 4, 0]}>
                      {analytics.agencyPerformance.map((_, i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Trip Status — Pie Chart */}
            <Card style={{ padding: '22px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: textPrimary, margin: '0 0 18px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
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
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: '12px', color: textSecondary }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Revenue Estimate — Area Chart */}
            <Card style={{ padding: '22px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: textPrimary, margin: '0 0 18px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Estimasi Revenue Bulanan
              </h3>
              <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                  <AreaChart data={analytics.revenueEstimate}>
                    <defs>
                      <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%"  stopColor={accent} stopOpacity={0.25} />
                        <stop offset="95%" stopColor={accent} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                    <XAxis dataKey="month" tick={tickStyle} />
                    <YAxis tick={tickStyle} tickFormatter={(v: number) => `${(v / 1_000_000).toFixed(0)}M`} />
                    <Tooltip
                      contentStyle={tooltipStyle}
                      formatter={(value) => [`Rp ${(Number(value) / 1_000_000).toFixed(1)}M`, 'Revenue']}
                    />
                    <Area
                      type="monotone"
                      dataKey="amount"
                      stroke={accent}
                      fill="url(#revenueGrad)"
                      strokeWidth={2.5}
                      name="Revenue"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Hotel Preferences — Pie Chart */}
            <Card style={{ padding: '22px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: textPrimary, margin: '0 0 18px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
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
                    <Tooltip contentStyle={tooltipStyle} />
                    <Legend wrapperStyle={{ fontSize: '12px', color: textSecondary }} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </Card>

            {/* Spending Patterns — Bar Chart */}
            <Card style={{ padding: '22px' }}>
              <h3 style={{ fontSize: '14px', fontWeight: '700', color: textPrimary, margin: '0 0 18px 0', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Pola Pengeluaran (Juta Rp)
              </h3>
              <div style={{ width: '100%', height: 250 }}>
                <ResponsiveContainer>
                  <BarChart
                    data={[
                      { category: 'Tiket Pesawat', amount: 450 },
                      { category: 'Hotel',          amount: 320 },
                      { category: 'Transport',       amount: 85  },
                      { category: 'Makan',           amount: 120 },
                      { category: 'Oleh-oleh',       amount: 95  },
                      { category: 'Visa',            amount: 150 },
                    ]}
                  >
                    <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
                    <XAxis dataKey="category" tick={tickStyle} />
                    <YAxis tick={tickStyle} />
                    <Tooltip contentStyle={tooltipStyle} />
                    <Bar dataKey="amount" name="Jumlah (Juta Rp)" fill={accent} radius={[4, 4, 0, 0]}>
                      {[0, 1, 2, 3, 4, 5].map((i) => (
                        <Cell key={i} fill={CHART_COLORS[i % CHART_COLORS.length]} />
                      ))}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </Card>

          </div>
        )}
      </div>
    </div>
  );
}
