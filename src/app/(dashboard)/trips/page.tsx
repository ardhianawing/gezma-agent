import Link from 'next/link';
import { Plus, Plane } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/status-badge';
import { mockTrips } from '@/data/mock-trips';
import { formatShortDate } from '@/lib/utils';

export default function TripsPage() {
  return (
    <div className="space-y-6">
      <PageHeader
        title="Trips"
        description="Manage departures and trip manifests"
        actions={
          <Link href="/trips/new">
            <Button>
              <Plus className="h-4 w-4" />
              Create Trip
            </Button>
          </Link>
        }
      />

      <div className="grid gap-4">
        {mockTrips.map((trip) => (
          <Link key={trip.id} href={`/trips/${trip.id}`}>
            <Card className="transition-shadow hover:shadow-[var(--shadow-md)] cursor-pointer">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex gap-4">
                    <div className="flex h-12 w-12 items-center justify-center rounded-[12px] bg-[var(--gray-100)]">
                      <Plane className="h-6 w-6 text-[var(--gray-600)]" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-lg text-[var(--charcoal)]">{trip.name}</h3>
                      <p className="text-sm text-[var(--gray-600)] mt-0.5">
                        {formatShortDate(trip.departureDate)} - {formatShortDate(trip.returnDate)}
                      </p>
                      <p className="text-sm text-[var(--gray-600)] mt-1">
                        {trip.flightInfo.departureAirline} • {trip.flightInfo.departureFlightNo}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={trip.status} />
                </div>

                <div className="mt-4 flex items-center gap-6 text-sm">
                  <div>
                    <span className="text-[var(--gray-600)]">Pilgrims: </span>
                    <span className="font-medium text-[var(--charcoal)]">
                      {trip.registeredCount}/{trip.capacity}
                    </span>
                  </div>
                  <div>
                    <span className="text-[var(--gray-600)]">Confirmed: </span>
                    <span className="font-medium text-[var(--charcoal)]">{trip.confirmedCount}</span>
                  </div>
                  <div>
                    <span className="text-[var(--gray-600)]">Available: </span>
                    <span className="font-medium text-[var(--success)]">{trip.capacity - trip.registeredCount}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>
    </div>
  );
}
