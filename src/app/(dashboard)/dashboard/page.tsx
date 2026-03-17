'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { Users, Package, Plane, FileText, Calendar, Clock, Trophy, Star, Medal, TrendingUp, Settings2, Eye, EyeOff, RotateCcw, GripVertical } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { StatCard } from '@/components/shared/stat-card';
import { ActionCenter } from '@/components/dashboard/action-center';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { RevenueChart } from '@/components/dashboard/revenue-chart';
import { PilgrimStatusChart } from '@/components/dashboard/pilgrim-status-chart';
import { TripCapacityChart } from '@/components/dashboard/trip-capacity-chart';
import { OnboardingTour } from '@/components/shared/onboarding-tour';
import { useAuth } from '@/lib/auth';
import { StatsSkeleton, TableSkeleton } from '@/components/shared/loading-skeleton';
import { useLanguage } from '@/lib/i18n';

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

// --- Widget definitions ---
type WidgetKey = 'stats' | 'actions' | 'charts' | 'gamification' | 'trips_activity';

interface WidgetDef {
  key: WidgetKey;
  label: string;
}

const ALL_WIDGETS: WidgetDef[] = [
  { key: 'stats', label: 'Statistik' },
  { key: 'actions', label: 'Action Center & Quick Actions' },
  { key: 'charts', label: 'Charts' },
  { key: 'gamification', label: 'Gamifikasi' },
  { key: 'trips_activity', label: 'Upcoming Trips & Activity' },
];

const DEFAULT_LAYOUT: { key: WidgetKey; visible: boolean }[] = ALL_WIDGETS.map(w => ({ key: w.key, visible: true }));

const STORAGE_KEY = 'gezma_dashboard_layout';

function loadLayout(): { key: WidgetKey; visible: boolean }[] {
  if (typeof window === 'undefined') return DEFAULT_LAYOUT;
  try {
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        // Ensure all widgets are present
        const keys = new Set(parsed.map((p: { key: string }) => p.key));
        const result = [...parsed];
        for (const w of ALL_WIDGETS) {
          if (!keys.has(w.key)) {
            result.push({ key: w.key, visible: true });
          }
        }
        return result;
      }
    }
  } catch { /* ignore */ }
  return DEFAULT_LAYOUT;
}

function saveLayout(layout: { key: WidgetKey; visible: boolean }[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(layout));
  } catch { /* ignore */ }
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

// Onboarding steps are defined inside the component to access translations

export default function DashboardPage() {
  const { c } = useTheme();
  const { isMobile, isTablet } = useResponsive();
  const { user, refreshUser } = useAuth();
  const { t } = useLanguage();

  const ONBOARDING_STEPS = [
    { target: 'dashboard-stats', title: t.onboarding.step1Title, description: t.onboarding.step1Desc },
    { target: 'sidebar', title: t.onboarding.step2Title, description: t.onboarding.step2Desc },
    { target: 'search', title: t.onboarding.step3Title, description: t.onboarding.step3Desc },
    { target: 'notifications', title: t.onboarding.step4Title, description: t.onboarding.step4Desc },
    { target: 'quick-actions', title: t.onboarding.step5Title, description: t.onboarding.step5Desc },
    { target: 'action-center', title: t.onboarding.step6Title, description: t.onboarding.step6Desc },
    { target: 'gezma-banner', title: t.onboarding.step7Title, description: t.onboarding.step7Desc },
    { target: 'chat-widget', title: t.onboarding.step8Title, description: t.onboarding.step8Desc },
  ];

  const [showOnboarding, setShowOnboarding] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [activities, setActivities] = useState<Activity[]>([]);
  const [activitiesLoading, setActivitiesLoading] = useState(true);
  const [charts, setCharts] = useState<ChartsData | null>(null);
  const [gamification, setGamification] = useState<{ totalPoints: number; level: number; badgeCount: number; rank: number } | null>(null);
  const [leaderboardMini, setLeaderboardMini] = useState<{ rank: number; agencyName: string; totalPoints: number }[]>([]);

  // Widget layout
  const [widgetLayout, setWidgetLayout] = useState<{ key: WidgetKey; visible: boolean }[]>(DEFAULT_LAYOUT);
  const [editMode, setEditMode] = useState(false);
  const [draggedIdx, setDraggedIdx] = useState<number | null>(null);

  useEffect(() => {
    setWidgetLayout(loadLayout());
  }, []);

  const updateLayout = useCallback((newLayout: { key: WidgetKey; visible: boolean }[]) => {
    setWidgetLayout(newLayout);
    saveLayout(newLayout);
  }, []);

  const toggleWidgetVisibility = useCallback((key: WidgetKey) => {
    const newLayout = widgetLayout.map(w => w.key === key ? { ...w, visible: !w.visible } : w);
    updateLayout(newLayout);
  }, [widgetLayout, updateLayout]);

  const resetLayout = useCallback(() => {
    updateLayout(DEFAULT_LAYOUT);
  }, [updateLayout]);

  const handleDragStart = (idx: number) => {
    setDraggedIdx(idx);
  };

  const handleDragOver = (e: React.DragEvent, idx: number) => {
    e.preventDefault();
    if (draggedIdx === null || draggedIdx === idx) return;
    const newLayout = [...widgetLayout];
    const [moved] = newLayout.splice(draggedIdx, 1);
    newLayout.splice(idx, 0, moved);
    setDraggedIdx(idx);
    updateLayout(newLayout);
  };

  const handleDragEnd = () => {
    setDraggedIdx(null);
  };

  // Onboarding tour
  useEffect(() => {
    if (user && user.onboardingCompleted === false) {
      setShowOnboarding(true);
    }
  }, [user]);

  async function handleOnboardingComplete() {
    setShowOnboarding(false);
    try {
      await fetch('/api/settings/onboarding-complete', { method: 'POST' });
      refreshUser();
    } catch { /* silently fail */ }
  }

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

  const isWidgetVisible = (key: WidgetKey) => {
    const w = widgetLayout.find(wl => wl.key === key);
    return w ? w.visible : true;
  };

  const widgetLabelMap: Record<WidgetKey, string> = {
    stats: t.dashboard.widgetStats,
    actions: t.dashboard.widgetActions,
    charts: t.dashboard.widgetCharts,
    gamification: t.dashboard.widgetGamification,
    trips_activity: t.dashboard.widgetTripsActivity,
  };
  const widgetLabel = (key: WidgetKey) => widgetLabelMap[key] || key;

  const renderWidget = (key: WidgetKey) => {
    switch (key) {
      case 'stats':
        return (
          <div
            data-tour="dashboard-stats"
            style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
              gap: isMobile ? '12px' : '16px',
              opacity: loading ? 0.5 : 1,
              transition: 'opacity 0.2s',
            }}
          >
            <StatCard title={t.dashboard.totalPilgrims} value={totalJemaah} icon={Users} iconColor="#3B82F6" iconBgColor="#3B82F615" href="/pilgrims" />
            <StatCard title={t.dashboard.activePackages} value={activePackages} icon={Package} iconColor="#10B981" iconBgColor="#10B98115" href="/packages" />
            <StatCard title={t.dashboard.activeTrips} value={activeTripsCount} icon={Plane} iconColor="#F59E0B" iconBgColor="#F59E0B15" href="/trips" />
            <StatCard title={t.dashboard.pendingDocs} value={docsIncomplete} icon={FileText} iconColor="#EF4444" iconBgColor="#EF444415" href="/pilgrims?filter=missing_docs" />
          </div>
        );

      case 'actions':
        return (
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
        );

      case 'charts':
        if (!charts) return null;
        return (
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
        );

      case 'gamification':
        if (!gamification) return null;
        return (
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
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: 'white', margin: 0 }}>{t.dashboard.gamificationTitle}</h3>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '16px' }}>
                {[
                  { icon: Star, label: t.dashboard.gamificationPoints, value: gamification.totalPoints, color: '#FDE68A' },
                  { icon: TrendingUp, label: t.dashboard.gamificationLevel, value: gamification.level, color: '#93C5FD' },
                  { icon: Medal, label: t.dashboard.gamificationBadge, value: gamification.badgeCount, color: '#6EE7B7' },
                  { icon: Trophy, label: t.dashboard.gamificationRank, value: `#${gamification.rank}`, color: '#FCA5A5' },
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
                <h3 style={{ fontSize: '16px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>{t.dashboard.leaderboardTitle}</h3>
              </div>
              {leaderboardMini.length === 0 ? (
                <EmptyState icon={Trophy} title={t.dashboard.leaderboardEmpty} />
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
        );

      case 'trips_activity':
        return (
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
                <h2 style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>
                  {t.dashboard.upcomingDepartures}
                </h2>
              </div>
              <div style={{ padding: isMobile ? '16px' : '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {upcomingTrips.length === 0 ? (
                  <EmptyState icon={Calendar} title={t.dashboard.noTrips} />
                ) : (
                  upcomingTrips.map((trip) => {
                    const status = statusMap[trip.status] || { bg: '#F3F4F6', text: '#6B7280', label: trip.status };
                    return (
                      <Link key={trip.id} href={`/trips/${trip.id}`} style={{ textDecoration: 'none' }}>
                        <div style={{ padding: '14px', borderRadius: '8px', border: `1px solid ${c.border}`, backgroundColor: c.cardBgHover, cursor: 'pointer' }}>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                            <h4 style={{ fontSize: '14px', fontWeight: '600', color: c.textPrimary, margin: 0, flex: 1, minWidth: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', paddingRight: '8px' }}>
                              {trip.name}
                            </h4>
                            <span style={{ fontSize: '10px', fontWeight: '600', padding: '3px 8px', borderRadius: '6px', backgroundColor: status.bg, color: status.text, flexShrink: 0 }}>
                              {status.label}
                            </span>
                          </div>
                          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '12px', color: c.textMuted, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Calendar style={{ width: '12px', height: '12px' }} />
                              {trip.departureDate ? new Date(trip.departureDate).toLocaleDateString('id-ID') : '-'}
                            </span>
                            <span style={{ fontSize: '12px', color: c.textMuted, display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Users style={{ width: '12px', height: '12px' }} />
                              {trip.registeredCount} {t.common.pilgrims}
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
                <h2 style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>
                  {t.dashboard.recentActivity}
                </h2>
              </div>
              <div style={{ padding: isMobile ? '16px' : '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {activitiesLoading ? (
                  <TableSkeleton rows={4} columns={3} />
                ) : activities.length === 0 ? (
                  <EmptyState icon={Clock} title={t.dashboard.noActivity} />
                ) : (
                  activities.slice(0, 6).map((activity) => {
                    const dotColor = activityIconColors[activity.type] || c.textMuted;
                    return (
                      <div key={activity.id} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                        <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: dotColor, marginTop: '6px', flexShrink: 0 }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <p style={{ fontSize: '13px', color: c.textPrimary, margin: '0 0 2px 0', fontWeight: '500' }}>{activity.title}</p>
                          <p style={{ fontSize: '12px', color: c.textMuted, margin: '0 0 4px 0', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{activity.description}</p>
                          <span style={{ fontSize: '11px', color: c.textLight }}>{timeAgo(activity.createdAt)}</span>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px', width: '100%' }}>
      {/* ONBOARDING TOUR */}
      {showOnboarding && (
        <OnboardingTour steps={ONBOARDING_STEPS} onComplete={handleOnboardingComplete} />
      )}

      {/* HEADER */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '12px' }}>
        <div>
          <h1 style={{ fontSize: '28px', fontWeight: '700', color: c.textPrimary, margin: 0 }}>
            {t.dashboard.title}
          </h1>
          <p style={{ fontSize: '14px', color: c.textMuted, marginTop: '4px' }}>
            {t.dashboard.subtitle}
          </p>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          {editMode && (
            <button
              onClick={resetLayout}
              style={{
                display: 'inline-flex', alignItems: 'center', gap: '6px',
                padding: '8px 14px', borderRadius: '8px',
                border: `1px solid ${c.border}`, backgroundColor: c.cardBg,
                color: c.textSecondary, fontSize: '13px', fontWeight: 500,
                cursor: 'pointer',
              }}
            >
              <RotateCcw style={{ width: '14px', height: '14px' }} />
              {t.dashboard.resetDefault}
            </button>
          )}
          <button
            onClick={() => setEditMode(!editMode)}
            style={{
              display: 'inline-flex', alignItems: 'center', gap: '6px',
              padding: '8px 14px', borderRadius: '8px',
              border: editMode ? `2px solid ${c.primary}` : `1px solid ${c.border}`,
              backgroundColor: editMode ? c.primaryLight : c.cardBg,
              color: editMode ? c.primary : c.textSecondary,
              fontSize: '13px', fontWeight: 500, cursor: 'pointer',
            }}
          >
            <Settings2 style={{ width: '14px', height: '14px' }} />
            {editMode ? t.dashboard.doneWidget : t.dashboard.editWidget}
          </button>
        </div>
      </div>

      {/* GEZMA BANNER */}
      <div
        data-tour="gezma-banner"
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
          {t.dashboard.bannerTitle}
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
          {t.dashboard.bannerDescription}
        </p>
      </div>

      {/* WIDGETS */}
      {widgetLayout.map((wl, idx) => {
        const visible = wl.visible;

        if (editMode) {
          return (
            <div
              key={wl.key}
              draggable
              onDragStart={() => handleDragStart(idx)}
              onDragOver={(e) => handleDragOver(e, idx)}
              onDragEnd={handleDragEnd}
              style={{
                border: `2px dashed ${draggedIdx === idx ? c.primary : c.border}`,
                borderRadius: '12px',
                padding: '12px 16px',
                backgroundColor: draggedIdx === idx ? c.primaryLight : c.cardBg,
                opacity: visible ? 1 : 0.5,
                transition: 'all 0.2s ease',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: visible ? '12px' : 0 }}>
                <GripVertical style={{ width: '18px', height: '18px', color: c.textMuted, cursor: 'grab', flexShrink: 0 }} />
                <span style={{ flex: 1, fontSize: '14px', fontWeight: 600, color: c.textPrimary }}>
                  {widgetLabel(wl.key)}
                </span>
                <button
                  onClick={() => toggleWidgetVisibility(wl.key)}
                  style={{
                    display: 'inline-flex', alignItems: 'center', gap: '4px',
                    padding: '6px 12px', borderRadius: '6px',
                    border: `1px solid ${c.border}`, backgroundColor: 'transparent',
                    color: visible ? c.success : c.textMuted, fontSize: '12px',
                    fontWeight: 500, cursor: 'pointer',
                  }}
                >
                  {visible ? <Eye style={{ width: '14px', height: '14px' }} /> : <EyeOff style={{ width: '14px', height: '14px' }} />}
                  {visible ? t.dashboard.widgetVisible : t.dashboard.widgetHidden}
                </button>
              </div>
              {visible && renderWidget(wl.key)}
            </div>
          );
        }

        if (!visible) return null;
        return <div key={wl.key}>{renderWidget(wl.key)}</div>;
      })}
    </div>
  );
}
