import Link from 'next/link';
import { ArrowLeft, Edit, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/status-badge';
import { mockTrips } from '@/data/mock-trips';
import { formatDate, formatCurrency } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';

export default function TripDetailPage({ params }: { params: { id: string } }) {
  const trip = mockTrips.find((t) => t.id === params.id);

  if (!trip) {
    return <div>Trip not found</div>;
  }

  const checklistItems = [
    { label: 'All pilgrims confirmed', checked: trip.checklist.allPilgrimsConfirmed },
    { label: 'Manifest complete', checked: trip.checklist.manifestComplete },
    { label: 'Rooming list finalized', checked: trip.checklist.roomingListFinalized },
    { label: 'Flight tickets issued', checked: trip.checklist.flightTicketsIssued },
    { label: 'Hotel confirmed', checked: trip.checklist.hotelConfirmed },
    { label: 'Guide assigned', checked: trip.checklist.guideAssigned },
    { label: 'Insurance processed', checked: trip.checklist.insuranceProcessed },
    { label: 'Departure briefing done', checked: trip.checklist.departureBriefingDone },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Link href="/trips">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="h-5 w-5" />
          </Button>
        </Link>
        <PageHeader
          title={trip.name}
          description={trip.packageName}
          actions={
            <StatusBadge status={trip.status} />
          }
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Trip Info */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Trip Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-medium text-[var(--gray-600)]">Departure</p>
                <p className="text-sm text-[var(--charcoal)]">{formatDate(trip.departureDate)}</p>
                <p className="text-xs text-[var(--gray-600)] mt-1">
                  {trip.flightInfo.departureAirline} {trip.flightInfo.departureFlightNo} • {trip.flightInfo.departureTime}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--gray-600)]">Return</p>
                <p className="text-sm text-[var(--charcoal)]">{formatDate(trip.returnDate)}</p>
                <p className="text-xs text-[var(--gray-600)] mt-1">
                  {trip.flightInfo.returnAirline} {trip.flightInfo.returnFlightNo} • {trip.flightInfo.returnTime}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--gray-600)]">Capacity</p>
                <p className="text-sm text-[var(--charcoal)]">
                  {trip.registeredCount}/{trip.capacity} pilgrims
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--gray-600)]">Price per Person</p>
                <p className="text-sm font-bold text-[var(--charcoal)]">{formatCurrency(trip.pricePerPerson)}</p>
              </div>
            </div>

            {trip.checklist.guideAssigned && (
              <div className="pt-4 border-t border-[var(--gray-border)]">
                <p className="text-sm font-medium text-[var(--gray-600)] mb-2">Guide/Muthawwif</p>
                <p className="text-sm text-[var(--charcoal)]">{trip.checklist.guideName}</p>
                <p className="text-sm text-[var(--gray-600)]">{trip.checklist.guidePhone}</p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Operational Checklist */}
        <Card>
          <CardHeader>
            <CardTitle>Operational Checklist</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {checklistItems.map((item, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle2
                    className={`h-4 w-4 ${
                      item.checked ? 'text-[var(--success)]' : 'text-[var(--gray-400)]'
                    }`}
                  />
                  <span className={`text-sm ${item.checked ? 'text-[var(--charcoal)]' : 'text-[var(--gray-600)]'}`}>
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Manifest */}
        <Card className="lg:col-span-3">
          <CardHeader>
            <CardTitle>Trip Manifest ({trip.manifest.length} pilgrims)</CardTitle>
          </CardHeader>
          <CardContent>
            {trip.manifest.length === 0 ? (
              <p className="text-center text-sm text-[var(--gray-600)] py-4">No pilgrims added yet</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="border-b border-[var(--gray-border)]">
                    <tr>
                      <th className="px-4 py-2 text-left text-xs font-medium text-[var(--gray-600)]">Name</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-[var(--gray-600)]">Status</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-[var(--gray-600)]">Documents</th>
                      <th className="px-4 py-2 text-left text-xs font-medium text-[var(--gray-600)]">Room</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[var(--gray-border)]">
                    {trip.manifest.map((entry) => (
                      <tr key={entry.pilgrimId}>
                        <td className="px-4 py-3 text-sm text-[var(--charcoal)]">{entry.pilgrimName}</td>
                        <td className="px-4 py-3">
                          <StatusBadge status={entry.pilgrimStatus} size="sm" />
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--gray-600)]">
                          {entry.documentsComplete}/{entry.documentsTotal}
                        </td>
                        <td className="px-4 py-3 text-sm text-[var(--gray-600)]">{entry.roomNumber || '-'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
