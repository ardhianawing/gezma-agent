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

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {mockTrips.map((trip) => {
          const occupancy = (trip.registeredCount / trip.capacity) * 100;

          return (
            <Link key={trip.id} href={`/trips/${trip.id}`} className="group">
              <Card className="h-full transition-all duration-200 hover:shadow-[var(--shadow-lg)] hover:border-[var(--gezma-red-light)] cursor-pointer group-hover:-translate-y-1">
                <CardContent className="p-5 flex flex-col h-full">
                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[10px] bg-[var(--gezma-red-light)] text-[var(--gezma-red)]">
                        <Plane className="h-5 w-5" />
                      </div>
                      <div>
                        <h3 className="font-bold text-[var(--charcoal)] line-clamp-1 group-hover:text-[var(--gezma-red)] transition-colors">
                          {trip.name}
                        </h3>
                        <p className="text-xs text-[var(--gray-600)] mt-1 font-medium">
                          {formatShortDate(trip.departureDate)} - {formatShortDate(trip.returnDate)}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={trip.status} size="sm" />
                  </div>

                  {/* Flight Info Ticket Stub */}
                  <div className="bg-[var(--gray-100)] rounded-[8px] p-3 mb-4 text-xs border border-[var(--gray-200)] border-dashed">
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-[var(--gray-600)]">Departure</span>
                      <span className="font-mono font-medium text-[var(--charcoal)]">{trip.flightInfo.departureFlightNo}</span>
                    </div>
                    <div className="flex justify-between items-center text-[var(--charcoal)] font-medium">
                      <span>{trip.flightInfo.departureAirline}</span>
                      <span>CGK → JED</span>
                    </div>
                  </div>

                  <div className="mt-auto">
                    {/* Progress Bar Label */}
                    <div className="flex justify-between text-xs mb-1.5">
                      <span className="text-[var(--gray-600)]">Seat Availability</span>
                      <span className="font-bold text-[var(--charcoal)]">
                        {trip.registeredCount} <span className="text-[var(--gray-400)] font-normal">/ {trip.capacity}</span>
                      </span>
                    </div>

                    {/* Custom Progress Bar */}
                    <div className="h-2 w-full bg-[var(--gray-200)] rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-500 ${occupancy >= 100 ? 'bg-[var(--success)]' :
                            occupancy >= 80 ? 'bg-[var(--warning)]' : 'bg-[var(--gezma-red)]'
                          }`}
                        style={{ width: `${occupancy}%` }}
                      />
                    </div>

                    <div className="flex justify-between mt-3 text-xs">
                      <div className="flex items-center gap-1.5">
                        <div className="w-1.5 h-1.5 rounded-full bg-[var(--success)]" />
                        <span className="text-[var(--gray-600)]">Confirmed: <span className="font-medium text-[var(--charcoal)]">{trip.confirmedCount}</span></span>
                      </div>
                      <div className="text-[var(--success)] font-medium">
                        {trip.capacity - trip.registeredCount} left
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
