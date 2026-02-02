import { Users, Package, Plane, TrendingUp } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { StatCard } from '@/components/shared/stat-card';
import { ActionCenter } from '@/components/dashboard/action-center';
import { QuickActions } from '@/components/dashboard/quick-actions';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/status-badge';
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
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Total Pilgrims"
          value={totalPilgrims}
          description="Registered this year"
          icon={Users}
          trend={{ value: 12, isPositive: true }}
          href="/pilgrims"
        />
        <StatCard
          title="Active Trips"
          value={activeTrips}
          description="In preparation"
          icon={Plane}
          href="/trips"
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(totalRevenue)}
          description="This month"
          icon={TrendingUp}
          trend={{ value: 8, isPositive: true }}
        />
        <StatCard
          title="Packages"
          value="6"
          description="Available packages"
          icon={Package}
          href="/packages"
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Action Center */}
        <ActionCenter />

        {/* Upcoming Trips */}
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Departures</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {mockTrips
              .filter((t) => t.status === 'preparing' || t.status === 'ready')
              .slice(0, 3)
              .map((trip) => (
                <div key={trip.id} className="flex items-center justify-between rounded-[12px] border border-[var(--gray-border)] bg-white p-4">
                  <div>
                    <p className="font-medium text-sm text-[var(--charcoal)]">{trip.name}</p>
                    <p className="text-sm text-[var(--gray-600)] mt-0.5">
                      {formatShortDate(trip.departureDate)} • {trip.registeredCount}/{trip.capacity} pilgrims
                    </p>
                  </div>
                  <StatusBadge status={trip.status} size="sm" />
                </div>
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
          <div className="space-y-4">
            {mockActivities.slice(0, 5).map((activity) => (
              <div key={activity.id} className="flex gap-4">
                <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-full bg-[var(--gray-100)]">
                  <div className="h-2 w-2 rounded-full bg-[var(--gezma-red)]" />
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-[var(--charcoal)]">{activity.title}</p>
                  <p className="text-sm text-[var(--gray-600)]">{activity.description}</p>
                  <p className="text-xs text-[var(--gray-400)] mt-1">
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
