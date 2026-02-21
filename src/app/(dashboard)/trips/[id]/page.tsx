'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2 } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { StatusBadge } from '@/components/shared/status-badge';
import { formatDate, formatCurrency } from '@/lib/utils';
import type { TripStatus, PilgrimStatus } from '@/types';

interface ManifestEntry {
  pilgrimId: string;
  pilgrimName: string;
  pilgrimStatus: string;
  documentsComplete: number;
  documentsTotal: number;
  roomNumber?: string;
}

interface TripDetail {
  id: string;
  name: string;
  packageId: string | null;
  departureDate: string | null;
  returnDate: string | null;
  capacity: number;
  registeredCount: number;
  confirmedCount: number;
  status: string;
  muthawwifName: string | null;
  muthawwifPhone: string | null;
  flightInfo: {
    departureAirline?: string;
    departureFlightNo?: string;
    departureTime?: string;
    returnAirline?: string;
    returnFlightNo?: string;
    returnTime?: string;
  } | null;
  checklist: {
    allPilgrimsConfirmed?: boolean;
    manifestComplete?: boolean;
    roomingListFinalized?: boolean;
    flightTicketsIssued?: boolean;
    hotelConfirmed?: boolean;
    guideAssigned?: boolean;
    insuranceProcessed?: boolean;
    departureBriefingDone?: boolean;
  } | null;
  manifest: ManifestEntry[];
}

export default function TripDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const [trip, setTrip] = useState<TripDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetch(`/api/trips/${id}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json();
      })
      .then((data) => setTrip(data))
      .catch(() => setError('Trip tidak ditemukan'))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading) {
    return <div className="p-6 text-center text-[var(--gray-600)]">Memuat data trip...</div>;
  }

  if (error || !trip) {
    return <div className="p-6 text-center text-[var(--gray-600)]">{error || 'Trip tidak ditemukan'}</div>;
  }

  const checklist = trip.checklist || {};
  const checklistItems = [
    { label: 'All pilgrims confirmed', checked: checklist.allPilgrimsConfirmed },
    { label: 'Manifest complete', checked: checklist.manifestComplete },
    { label: 'Rooming list finalized', checked: checklist.roomingListFinalized },
    { label: 'Flight tickets issued', checked: checklist.flightTicketsIssued },
    { label: 'Hotel confirmed', checked: checklist.hotelConfirmed },
    { label: 'Guide assigned', checked: checklist.guideAssigned },
    { label: 'Insurance processed', checked: checklist.insuranceProcessed },
    { label: 'Departure briefing done', checked: checklist.departureBriefingDone },
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
          description={trip.packageId || ''}
          actions={
            <StatusBadge status={trip.status as TripStatus} />
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
                <p className="text-sm text-[var(--charcoal)]">{trip.departureDate ? formatDate(trip.departureDate) : '-'}</p>
                <p className="text-xs text-[var(--gray-600)] mt-1">
                  {trip.flightInfo?.departureAirline || ''} {trip.flightInfo?.departureFlightNo || ''} {trip.flightInfo?.departureTime ? `• ${trip.flightInfo.departureTime}` : ''}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--gray-600)]">Return</p>
                <p className="text-sm text-[var(--charcoal)]">{trip.returnDate ? formatDate(trip.returnDate) : '-'}</p>
                <p className="text-xs text-[var(--gray-600)] mt-1">
                  {trip.flightInfo?.returnAirline || ''} {trip.flightInfo?.returnFlightNo || ''} {trip.flightInfo?.returnTime ? `• ${trip.flightInfo.returnTime}` : ''}
                </p>
              </div>
              <div>
                <p className="text-sm font-medium text-[var(--gray-600)]">Capacity</p>
                <p className="text-sm text-[var(--charcoal)]">
                  {trip.registeredCount}/{trip.capacity} pilgrims
                </p>
              </div>
            </div>

            {(trip.muthawwifName || checklist.guideAssigned) && (
              <div className="pt-4 border-t border-[var(--gray-border)]">
                <p className="text-sm font-medium text-[var(--gray-600)] mb-2">Guide/Muthawwif</p>
                <p className="text-sm text-[var(--charcoal)]">{trip.muthawwifName || '-'}</p>
                <p className="text-sm text-[var(--gray-600)]">{trip.muthawwifPhone || '-'}</p>
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
            <CardTitle>Trip Manifest ({trip.manifest?.length || 0} pilgrims)</CardTitle>
          </CardHeader>
          <CardContent>
            {(!trip.manifest || trip.manifest.length === 0) ? (
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
                          <StatusBadge status={entry.pilgrimStatus as PilgrimStatus} size="sm" />
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
