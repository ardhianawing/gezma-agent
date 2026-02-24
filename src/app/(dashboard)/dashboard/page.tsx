'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Users, Package, Plane, FileText, Calendar, Clock, Trophy, Star, Medal, TrendingUp } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { StatCard } from '@/components/shared/stat-card';
import { ActionCenter } from '@/components/dashboard/action-center';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { PilgrimStatusChart } from '@/components/dashboard/pilgrim-status-chart';
import { TripCapacityChart } from '@/components/dashboard/trip-capacity-chart';
interface Activity {
  id: string;
  type: string;
  action: string;
  title: string;
  description: string;
  createdAt: string;
}

interface ChartsData {
  revenueTrend: { month: string; amount: number }[];
  pilgrimStatus: { status: string; count: number }[];
  tripCapacity: { name: string; capacity: number; registered: number }[];
}

interface DashboardStats {
  totalPilgrims: number;
  activePackages: number;
  activeTrips: number;
  pendingDocs: number;
  upcomingTrips: { id: string; name: string; departureDate: string | null; registeredCount: number; status: string }[];
}

// --- Activity icon map ---
const activityIconColors: Record<string, string> = {
  pilgrim: '#3B82F6',
  package: '#10B981',
  trip: '#F59E0B',
  payment: '#8B5CF6',
  document: '#EF4444',
};

// --- Status badge colors ---
const statusMap: Record<string, { bg: string; text: string; label: string }> = {
  ready: { bg: '#DCFCE7', text: '#15803D', label: 'Ready' },
  preparing: { bg: '#FEF3C7', text: '#D97706', label: 'Preparing' },
  open: { bg: '#DBEAFE', text: '#2563EB', label: 'Open' },
};

// --- Relative time helper ---
function timeAgo(timestamp: string): string {
  const now = new Date();
  const then = new Date(timestamp);
  const diffMs = now.getTime() - then.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  if (diffMin < 60) return `${diffMin} min ago`;
  const diffHrs = Math.floor(diffMin / 60);
  if (diffHrs < 24) return `${diffHrs}h ago`;
  const diffDays = Math.floor(diffHrs / 24);
  return `${diffDays}d ago`;
}

export default function DashboardPage() {
  const { c } = useTheme();
  const { isMobile, isTablet } = useResponsive();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [charts, setCharts] = useState<ChartsData | null>(null);
  const [gamification, setGamification] = useState<{ totalPoints: number; level: number; badgeCount: number; rank: number } | null>(null);
  const [leaderboardMini, setLeaderboardMini] = useState<{ rank: number; agencyName: string; totalPoints: number }[]>([]);

  useEffect(() => {
    fetch('/api/gamification/stats').then(r => r.json()).then(setGamification).catch(() => {});
    fetch('/api/gamification/leaderboard').then(r => r.json()).then(d => setLeaderboardMini((d.leaderboard || []).slice(0, 5))).catch(() => {});
  }, []);

  useEffect(() => {
    async function fetchCharts() {
      try {
        const res = await fetch('/api/dashboard/charts');
        if (res.ok) setCharts(await res.json());
      } catch { /* silently fail */ }
    }
    fetchCharts();
  }, []);

  useEffect(() => {
    async function fetchStats() {
      try {
        const res = await fetch('/api/dashboard/stats');
        if (res.ok) {
          const data = await res.json();
          setStats(data);
        }
      } catch {
        // silently fail, stats will show 0
      } finally {
        setLoading(false);
      }
    }
    async function fetchActivities() {
      try {
        const res = await fetch('/api/activities');
        if (res.ok) {
          const json = await res.json();
          setActivities(json.data || []);
        }
      } catch {
        // silently fail
      } finally {
        setActivitiesLoading(false);
      }
    }
    fetchStats();
    fetchActivities();
  }, []);

  const totalJemaah = stats?.totalPilgrims ?? 0;
  const activePackages = stats?.activePackages ?? 0;
  const activeTripsCount = stats?.activeTrips ?? 0;
  const docsIncomplete = stats?.pendingDocs ?? 0;
  const upcomingTrips = stats?.upcomingTrips ?? [];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* HEADER */}
      <div>
        <h1 style={{ fontSize: '28px', fontWeight: '700', color: c.textPrimary, margin: 0 }}>
          Dashboard
        </h1>
        <p style={{ fontSize: '14px', color: c.textMuted, marginTop: '4px' }}>
          Selamat datang kembali! Berikut ringkasan operasional Anda hari ini.
        </p>
      </div>

      {/* GEZMA BANNER */}
      <div
        style={{
          background: 'linear-gradient(135deg, #1E40AF 0%, #3B82F6 100%)',
          borderRadius: isMobile ? '12px' : '16px',
          padding: isMobile ? '20px 24px' : '32px 36px',
          boxShadow: '0 8px 24px rgba(30, 64, 175, 0.25)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
        }}
      >
        <h2
          style={{
            fontSize: isMobile ? '18px' : '24px',
            fontWeight: '800',
            color: 'white',
            margin: '0 0 12px 0',
            letterSpacing: '0.5px',
            textTransform: 'uppercase',
          }}
        >
          GEZMA (Gerakan Generasi Z & Milenial)
        </h2>
        <p
          style={{
            fontSize: isMobile ? '13px' : '15px',
            color: 'rgba(255, 255, 255, 0.95)',
            lineHeight: '1.7',
            margin: 0,
            fontWeight: '500',
          }}
        >
          Ekosistem pembinaan bagi anggota Ashpirasi, menyiapkan generasi penerus yang siap
          menerima tongkat estafet perjuangan menuju Indonesia Emas 2030.
        </p>
      </div>

      {/* STATS CARDS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: isMobile ? '12px' : '16px',
          opacity: loading ? 0.5 : 1,
          transition: 'opacity 0.2s',
        }}
      >
        <StatCard
          title="Total Jemaah"
          value={totalJemaah}
          icon={Users}
          iconColor="#3B82F6"
          iconBgColor="#3B82F615"
          href="/pilgrims"
        />
        <StatCard
          title="Paket Aktif"
          value={activePackages}
          icon={Package}
          iconColor="#10B981"
          iconBgColor="#10B98115"
          href="/packages"
        />
        <StatCard
          title="Trip Aktif"
          value={activeTripsCount}
          icon={Plane}
          iconColor="#F59E0B"
          iconBgColor="#F59E0B15"
          href="/trips"
        />
        <StatCard
          title="Dokumen Pending"
          value={docsIncomplete}
          icon={FileText}
          iconColor="#EF4444"
          iconBgColor="#EF444415"
          href="/pilgrims?filter=missing_docs"
        />
      </div>

      {/* ACTION CENTER + QUICK ACTIONS */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile || isTablet ? '1fr' : '2fr 1fr',
          gap: isMobile ? '12px' : '16px',
        }}
      >
        <ActionCenter />
        <QuickActions />
      </div>

      {/* CHARTS */}
      {charts && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile || isTablet ? '1fr' : '1fr 1fr',
            gap: isMobile ? '12px' : '16px',
          }}
        >
          <div style={{ gridColumn: isMobile || isTablet ? undefined : '1 / -1' }}>
            <RevenueChart data={charts.revenueTrend} />
          </div>
          <PilgrimStatusChart data={charts.pilgrimStatus} />
          <TripCapacityChart data={charts.tripCapacity} />
        </div>
      )}

      {/* GAMIFICATION WIDGET */}
      {gamification && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: isMobile || isTablet ? '1fr' : '1fr 1fr',
            gap: isMobile ? '12px' : '16px',
          }}
        >
          {/* Points & Level Card */}
          <div
            style={{
              background: 'linear-gradient(135deg, #7C3AED 0%, #A855F7 100%)',
              borderRadius: '12px',
              padding: isMobile ? '20px' : '24px',
              boxShadow: '0 4px 16px rgba(124, 58, 237, 0.25)',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Trophy style={{ width: '20px', height: '20px', color: '#FDE68A' }} />
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', margin: 0 }}>Gamifikasi</h3>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
              {[
                { icon: Star, label: 'Poin', value: gamification.totalPoints, color: '#FDE68A' },
                { icon: TrendingUp, label: 'Level', value: gamification.level, color: '#93C5FD' },
                { icon: Medal, label: 'Badge', value: gamification.badgeCount, color: '#6EE7B7' },
                { icon: Trophy, label: 'Rank', value: `#${gamification.rank}`, color: '#FCA5A5' },
              ].map(item => {
                const Icon = item.icon;
                return (
                  <div key={item.label} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <Icon style={{ width: '18px', height: '18px', color: item.color, flexShrink: 0 }} />
                    <div>
                      <p style={{ fontSize: '11px', color: 'rgba(255,255,255,0.7)', margin: 0 }}>{item.label}</p>
                      <p style={{ fontSize: '20px', fontWeight: '700', color: 'white', margin: 0 }}>{item.value}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Mini Leaderboard */}
          <div
            style={{
              backgroundColor: c.cardBg,
              borderRadius: '12px',
              border: `1px solid ${c.border}`,
              padding: isMobile ? '20px' : '24px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '16px' }}>
              <Trophy style={{ width: '18px', height: '18px', color: '#8B5CF6' }} />
              <h3 style={{ fontSize: '16px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>Top 5 Bulan Ini</h3>
            </div>
            {leaderboardMini.length === 0 ? (
              <p style={{ fontSize: '13px', color: c.textMuted }}>Belum ada data.</p>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {leaderboardMini.map(entry => (
                  <div key={entry.rank} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ width: '24px', fontSize: '14px', fontWeight: '700', color: entry.rank <= 3 ? '#F59E0B' : c.textMuted, textAlign: 'center' }}>
                      {entry.rank}
                    </span>
                    <span style={{ flex: 1, fontSize: '13px', color: c.textPrimary, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {entry.agencyName}
                    </span>
                    <span style={{ fontSize: '13px', fontWeight: '600', color: '#F59E0B' }}>
                      {entry.totalPoints.toLocaleString('id-ID')}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* UPCOMING TRIPS + RECENT ACTIVITY */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile || isTablet ? '1fr' : '1fr 1fr',
          gap: isMobile ? '12px' : '16px',
        }}
      >
        {/* UPCOMING TRIPS */}
        <div
          style={{
            backgroundColor: c.cardBg,
            borderRadius: '12px',
            border: `1px solid ${c.border}`,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: isMobile ? '16px' : '24px',
              borderBottom: `1px solid ${c.borderLight}`,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Calendar style={{ width: '18px', height: '18px', color: c.textMuted }} />
            <h2
              style={{
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: '600',
                color: c.textPrimary,
                margin: 0,
              }}
            >
              Upcoming Departures
            </h2>
          </div>
          <div
            style={{
              padding: isMobile ? '16px' : '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px',
            }}
          >
            {upcomingTrips.length === 0 ? (
              <p style={{ textAlign: 'center', fontSize: '14px', color: c.textMuted, padding: '24px 0' }}>
                No upcoming trips.
              </p>
            ) : (
              upcomingTrips.map((trip) => {
                const status = statusMap[trip.status] || {
                  bg: '#F3F4F6',
                  text: '#6B7280',
                  label: trip.status,
                };
                return (
                  <Link key={trip.id} href={`/trips/${trip.id}`} style={{ textDecoration: 'none' }}>
                  <div
                    style={{
                      padding: '14px',
                      borderRadius: '8px',
                      border: `1px solid ${c.border}`,
                      backgroundColor: c.cardBgHover,
                      cursor: 'pointer',
                    }}
                  >
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'flex-start',
                        marginBottom: '8px',
                      }}
                    >
                      <h4
                        style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: c.textPrimary,
                          margin: 0,
                          flex: 1,
                          minWidth: 0,
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap',
                          paddingRight: '8px',
                        }}
                      >
                        {trip.name}
                      </h4>
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: '600',
                          padding: '3px 8px',
                          borderRadius: '6px',
                          backgroundColor: status.bg,
                          color: status.text,
                          flexShrink: 0,
                        }}
                      >
                        {status.label}
                      </span>
                    </div>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                      }}
                    >
                      <span
                        style={{
                          fontSize: '12px',
                          color: c.textMuted,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Calendar style={{ width: '12px', height: '12px' }} />
                        {trip.departureDate ? new Date(trip.departureDate).toLocaleDateString('id-ID') : '-'}
                      </span>
                      <span
                        style={{
                          fontSize: '12px',
                          color: c.textMuted,
                          display: 'flex',
                          alignItems: 'center',
                          gap: '4px',
                        }}
                      >
                        <Users style={{ width: '12px', height: '12px' }} />
                        {trip.registeredCount} jemaah
                      </span>
                    </div>
                  </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* RECENT ACTIVITY */}
        <div
          style={{
            backgroundColor: c.cardBg,
            borderRadius: '12px',
            border: `1px solid ${c.border}`,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: isMobile ? '16px' : '24px',
              borderBottom: `1px solid ${c.borderLight}`,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}
          >
            <Clock style={{ width: '18px', height: '18px', color: c.textMuted }} />
            <h2
              style={{
                fontSize: isMobile ? '16px' : '18px',
                fontWeight: '600',
                color: c.textPrimary,
                margin: 0,
              }}
            >
              Recent Activity
            </h2>
          </div>
          <div
            style={{
              padding: isMobile ? '16px' : '24px',
              display: 'flex',
              flexDirection: 'column',
              gap: '16px',
            }}
          >
            {activitiesLoading ? (
              <p style={{ textAlign: 'center', fontSize: '14px', color: c.textMuted, padding: '24px 0' }}>
                Loading...
              </p>
            ) : activities.length === 0 ? (
              <p style={{ textAlign: 'center', fontSize: '14px', color: c.textMuted, padding: '24px 0' }}>
                Belum ada aktivitas.
              </p>
            ) : (
              activities.slice(0, 6).map((activity) => {
                const dotColor = activityIconColors[activity.type] || c.textMuted;
                return (
                  <div
                    key={activity.id}
                    style={{
                      display: 'flex',
                      gap: '12px',
                      alignItems: 'flex-start',
                    }}
                  >
                    <div
                      style={{
                        width: '8px',
                        height: '8px',
                        borderRadius: '50%',
                        backgroundColor: dotColor,
                        marginTop: '6px',
                        flexShrink: 0,
                      }}
                    />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <p
                        style={{
                          fontSize: '13px',
                          color: c.textPrimary,
                          margin: '0 0 2px 0',
                          fontWeight: '500',
                        }}
                      >
                        {activity.title}
                      </p>
                      <p
                        style={{
                          fontSize: '12px',
                          color: c.textMuted,
                          margin: '0 0 4px 0',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                        }}
                      >
                        {activity.description}
                      </p>
                      <span style={{ fontSize: '11px', color: c.textLight }}>
                        {timeAgo(activity.createdAt)}
                      </span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
