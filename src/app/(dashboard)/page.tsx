'use client';

import { Users, Package, Plane, TrendingUp, ArrowRight, Calendar } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { ActionCenter } from '@/components/dashboard/action-center';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { StatusBadge } from '@/components/shared/status-badge';
import { formatCurrency, formatShortDate } from '@/lib/utils';
import { mockPilgrims } from '@/data/mock-pilgrims';
import { mockTrips } from '@/data/mock-trips';
import { mockActivities } from '@/data/mock-activity';
import { useLanguage } from '@/lib/i18n';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';

export default function DashboardPage() {
  const { t } = useLanguage();
  const { c } = useTheme();
  const { isMobile, isTablet } = useResponsive();

  // Calculate stats
  const totalPilgrims = mockPilgrims.length;
  const activeTrips = mockTrips.filter((trip) => trip.status === 'preparing' || trip.status === 'ready').length;
  const totalRevenue = mockPilgrims.reduce((sum, p) => sum + p.totalPaid, 0);

  // Responsive grid columns - use auto-fit for better tablet support
  const statGridColumns = isMobile ? '1fr' : 'repeat(auto-fit, minmax(220px, 1fr))';
  const mainGridColumns = isMobile || isTablet ? '1fr' : 'repeat(auto-fit, minmax(380px, 1fr))';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '20px' : '32px' }}>
      <PageHeader
        title={t.dashboard.title}
        description={t.dashboard.description}
      />

      {/* Stat Cards Row */}
      <div style={{ display: 'grid', gridTemplateColumns: statGridColumns, gap: isMobile ? '12px' : '24px' }}>
        <StatCard
          title={t.dashboard.totalPilgrims}
          value={totalPilgrims}
          description={t.dashboard.registeredThisYear}
          icon={Users}
          iconColor={c.info}
          iconBgColor={c.infoLight}
          trend={{ value: 12, isPositive: true }}
          trendLabel={t.dashboard.vsLastMonth}
          href="/pilgrims"
        />
        <StatCard
          title={t.dashboard.activeTrips}
          value={activeTrips}
          description={t.dashboard.inPreparation}
          icon={Plane}
          iconColor={c.warning}
          iconBgColor={c.warningLight}
          href="/trips"
        />
        <StatCard
          title={t.dashboard.totalRevenue}
          value={formatCurrency(totalRevenue)}
          description={t.dashboard.thisMonth}
          icon={TrendingUp}
          iconColor={c.success}
          iconBgColor={c.successLight}
          trend={{ value: 8, isPositive: true }}
          trendLabel={t.dashboard.vsLastMonth}
        />
        <StatCard
          title={t.dashboard.packages}
          value="6"
          description={t.dashboard.availablePackages}
          icon={Package}
          iconColor={c.primary}
          iconBgColor={c.primaryLight}
          href="/packages"
        />
      </div>

      {/* Main Content */}
      <div style={{ display: 'grid', gridTemplateColumns: mainGridColumns, gap: isMobile ? '16px' : '24px', alignItems: 'start' }}>
        {/* Left Column */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '24px' }}>
          {/* Action Center */}
          <ActionCenter />
        </div>

        {/* Right Column - Upcoming Departures */}
        <div
          style={{
            backgroundColor: c.cardBg,
            borderRadius: '12px',
            border: `1px solid ${c.border}`,
            overflow: 'hidden',
            transition: 'background-color 0.3s ease, border-color 0.3s ease',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: isMobile ? '16px' : '24px',
              borderBottom: `1px solid ${c.borderLight}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '12px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Calendar style={{ width: '20px', height: '20px', color: c.textMuted }} />
              <h2 style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>
                {t.dashboard.upcomingDepartures}
              </h2>
            </div>
            <Link href="/trips" style={{ textDecoration: 'none' }}>
              <span
                style={{
                  fontSize: '14px',
                  color: c.primary,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                }}
              >
                {t.common.viewAll}
                <ArrowRight style={{ width: '16px', height: '16px' }} />
              </span>
            </Link>
          </div>

          {/* Content */}
          <div style={{ padding: isMobile ? '16px' : '24px', display: 'flex', flexDirection: 'column', gap: '0' }}>
            {mockTrips
              .filter((trip) => trip.status === 'preparing' || trip.status === 'ready')
              .slice(0, 3)
              .map((trip, index, arr) => (
                <Link key={trip.id} href={`/trips/${trip.id}`} style={{ textDecoration: 'none' }}>
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '12px 0',
                      borderBottom: index < arr.length - 1 ? `1px solid ${c.borderLight}` : 'none',
                      cursor: 'pointer',
                    }}
                  >
                    {/* Icon */}
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        backgroundColor: c.primaryLight,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Plane style={{ width: '20px', height: '20px', color: c.primary }} />
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0, overflow: 'hidden' }}>
                      <p style={{
                        fontSize: '14px',
                        fontWeight: '500',
                        color: c.textPrimary,
                        margin: 0,
                        whiteSpace: 'nowrap',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                      }}>
                        {trip.name}
                      </p>
                      <p style={{
                        fontSize: '13px',
                        color: c.textMuted,
                        margin: '2px 0 0 0',
                        whiteSpace: 'nowrap',
                      }}>
                        {formatShortDate(trip.departureDate)} • {trip.registeredCount}/{trip.capacity} pax
                      </p>
                    </div>

                    {/* Status */}
                    <div style={{ flexShrink: 0 }}>
                      <StatusBadge status={trip.status} size="sm" />
                    </div>
                  </div>
                </Link>
              ))}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Recent Activity */}
      <div
        style={{
          backgroundColor: c.cardBg,
          borderRadius: '12px',
          border: `1px solid ${c.border}`,
          overflow: 'hidden',
          transition: 'background-color 0.3s ease, border-color 0.3s ease',
        }}
      >
        {/* Header */}
        <div style={{ padding: isMobile ? '16px' : '24px', borderBottom: `1px solid ${c.borderLight}` }}>
          <h2 style={{ fontSize: isMobile ? '16px' : '18px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>
            {t.dashboard.recentActivity}
          </h2>
        </div>

        {/* Content */}
        <div style={{ padding: isMobile ? '16px' : '24px', position: 'relative' }}>
          {/* Timeline Line */}
          <div
            style={{
              position: 'absolute',
              left: isMobile ? '35px' : '43px',
              top: '36px',
              bottom: '36px',
              width: '2px',
              background: `linear-gradient(to bottom, ${c.primary}, ${c.border}, transparent)`,
            }}
          />

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0' }}>
            {mockActivities.slice(0, 5).map((activity, i) => (
              <div
                key={activity.id}
                style={{
                  display: 'flex',
                  gap: isMobile ? '12px' : '16px',
                  position: 'relative',
                  padding: '16px 0',
                }}
              >
                <div
                  style={{
                    width: isMobile ? '32px' : '40px',
                    height: isMobile ? '32px' : '40px',
                    borderRadius: '50%',
                    backgroundColor: i === 0 ? c.primary : c.cardBg,
                    border: i === 0 ? 'none' : `2px solid ${c.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    zIndex: 10,
                  }}
                >
                  <div
                    style={{
                      width: isMobile ? '8px' : '10px',
                      height: isMobile ? '8px' : '10px',
                      borderRadius: '50%',
                      backgroundColor: i === 0 ? 'white' : c.textLight,
                    }}
                  />
                </div>
                <div style={{ flex: 1, paddingTop: isMobile ? '4px' : '8px' }}>
                  <p style={{ fontSize: '14px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>
                    {activity.title}
                  </p>
                  <p style={{ fontSize: isMobile ? '13px' : '14px', color: c.textMuted, marginTop: '2px', marginBottom: 0 }}>
                    {activity.description}
                  </p>
                  <p style={{ fontSize: '12px', color: c.textLight, marginTop: '8px', marginBottom: 0 }}>
                    {formatShortDate(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
