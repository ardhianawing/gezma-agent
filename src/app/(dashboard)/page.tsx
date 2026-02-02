'use client';

import { Users, Package, Plane, TrendingUp, ArrowRight, Calendar } from 'lucide-react';
import Link from 'next/link';
import { PageHeader } from '@/components/layout/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { ActionCenter } from '@/components/dashboard/action-center';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/status-badge';
import { Button } from '@/components/ui/button';
import { formatCurrency, formatShortDate } from '@/lib/utils';
import { mockPilgrims } from '@/data/mock-pilgrims';
import { mockTrips } from '@/data/mock-trips';
import { mockActivities } from '@/data/mock-activity';

export default function DashboardPage() {
  // Calculate stats
  const totalPilgrims = mockPilgrims.length;
  const activeTrips = mockTrips.filter((t) => t.status === 'preparing' || t.status === 'ready').length;
  const totalRevenue = mockPilgrims.reduce((sum, p) => sum + p.totalPaid, 0);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Welcome back! Here's what's happening with your agency."
      />

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard
          title="Total Pilgrims"
          value={totalPilgrims}
          description="Registered this year"
          icon={Users}
          iconColor="var(--info)"
          iconBgColor="var(--info-light)"
          trend={{ value: 12, isPositive: true }}
          href="/pilgrims"
        />
        <StatCard
          title="Active Trips"
          value={activeTrips}
          description="In preparation"
          icon={Plane}
          iconColor="var(--warning)"
          iconBgColor="var(--warning-light)"
          href="/trips"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          description="This month"
          icon={TrendingUp}
          iconColor="var(--success)"
          iconBgColor="var(--success-light)"
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Packages"
          value="6"
          description="Available packages"
          icon={Package}
          iconColor="var(--gezma-red)"
          iconBgColor="var(--gezma-red-light)"
          href="/packages"
        />
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        {/* Action Center */}
        <div className="relative z-0">
          <ActionCenter />
        </div>

        {/* Upcoming Trips */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-4">
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-[var(--gray-500)]" />
              Upcoming Departures
            </CardTitle>
            <Link href="/trips">
              <Button variant="ghost" size="sm" className="text-[var(--gezma-red)]">
                View All
                <ArrowRight className="h-4 w-4 ml-1" />
              </Button>
            </Link>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockTrips
              .filter((t) => t.status === 'preparing' || t.status === 'ready')
              .slice(0, 3)
              .map((trip) => (
                <Link key={trip.id} href={`/trips/${trip.id}`}>
                  <div className="flex items-center justify-between rounded-xl border border-[var(--gray-200)] bg-[var(--gray-50)] p-4 hover:border-[var(--gezma-red)] hover:bg-white transition-all cursor-pointer group">
                    <div className="flex items-center gap-4">
                      <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-[var(--gezma-red-light)] group-hover:bg-[var(--gezma-red)] transition-colors">
                        <Plane className="h-5 w-5 text-[var(--gezma-red)] group-hover:text-white transition-colors" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm text-[var(--charcoal)]">{trip.name}</p>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-xs text-[var(--gray-500)]">
                            {formatShortDate(trip.departureDate)}
                          </span>
                          <span className="text-xs text-[var(--gray-300)]">•</span>
                          <span className="text-xs text-[var(--gray-500)]">
                            {trip.registeredCount}/{trip.capacity} pax
                          </span>
                        </div>
                      </div>
                    </div>
                    <StatusBadge status={trip.status} size="sm" />
                  </div>
                </Link>
              ))}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <QuickActions />

      {/* Recent Activity */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-0 relative">
            {/* Timeline Line */}
            <div className="absolute left-[19px] top-3 bottom-3 w-0.5 bg-gradient-to-b from-[var(--gezma-red)] via-[var(--gray-200)] to-transparent" />

            {mockActivities.slice(0, 5).map((activity, i) => (
              <div key={activity.id} className="flex gap-4 relative py-3 group">
                <div className={`
                  flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full z-10 transition-transform group-hover:scale-110
                  ${i === 0
                    ? 'bg-gradient-to-br from-[var(--gezma-red)] to-[var(--gezma-red-hover)] shadow-md'
                    : 'bg-white border-2 border-[var(--gray-200)]'
                  }
                `}>
                  <div className={`h-2.5 w-2.5 rounded-full ${i === 0 ? 'bg-white' : 'bg-[var(--gray-300)]'}`} />
                </div>
                <div className="flex-1 pt-2">
                  <p className="text-sm font-semibold text-[var(--charcoal)]">{activity.title}</p>
                  <p className="text-sm text-[var(--gray-500)] mt-0.5">{activity.description}</p>
                  <p className="text-xs text-[var(--gray-400)] mt-2">
                    {formatShortDate(activity.timestamp)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
