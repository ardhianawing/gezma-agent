'use client';

import { useState, useEffect, use } from 'react';
import Link from 'next/link';
import { ArrowLeft, CheckCircle2, Printer, Plane, ClipboardCheck, Users } from 'lucide-react';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
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
  const { c } = useTheme();
  const { isMobile } = useResponsive();
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

  function handlePrintManifest() {
    if (!trip) return;
    const rows = (trip.manifest || [])
      .map((e, i) => `<tr><td style="padding:8px;border:1px solid #ddd;text-align:center">${i + 1}</td><td style="padding:8px;border:1px solid #ddd">${e.pilgrimName}</td><td style="padding:8px;border:1px solid #ddd;text-align:center">${e.pilgrimStatus}</td><td style="padding:8px;border:1px solid #ddd;text-align:center">${e.documentsComplete}/${e.documentsTotal}</td><td style="padding:8px;border:1px solid #ddd;text-align:center">${e.roomNumber || '-'}</td></tr>`)
      .join('');
    const html = `<!DOCTYPE html><html><head><title>Manifest - ${trip.name}</title><style>body{font-family:sans-serif;padding:24px}table{width:100%;border-collapse:collapse}th{background:#f1f5f9;padding:8px;border:1px solid #ddd;text-align:left;font-size:12px;text-transform:uppercase}td{font-size:13px}h1{font-size:20px;margin:0 0 4px 0}p{color:#666;font-size:13px;margin:0 0 16px 0}@media print{body{padding:0}}</style></head><body><h1>${trip.name}</h1><p>Keberangkatan: ${trip.departureDate ? new Date(trip.departureDate).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'} &bull; ${trip.manifest?.length || 0} jemaah</p><table><thead><tr><th style="width:40px">No</th><th>Nama</th><th style="width:100px">Status</th><th style="width:100px">Dokumen</th><th style="width:80px">Kamar</th></tr></thead><tbody>${rows}</tbody></table></body></html>`;
    const w = window.open('', '_blank');
    if (w) {
      w.document.write(html);
      w.document.close();
      w.print();
    }
  }

  if (loading) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: c.textMuted }}>
        Memuat data trip...
      </div>
    );
  }

  if (error || !trip) {
    return (
      <div style={{ padding: '24px', textAlign: 'center', color: c.textMuted }}>
        {error || 'Trip tidak ditemukan'}
      </div>
    );
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

  const thStyle: React.CSSProperties = {
    padding: '10px 16px',
    textAlign: 'left',
    fontSize: '12px',
    fontWeight: '500',
    color: c.textMuted,
    textTransform: 'uppercase',
    letterSpacing: '0.05em',
  };

  const tdStyle: React.CSSProperties = {
    padding: '12px 16px',
    fontSize: '14px',
    borderTop: `1px solid ${c.border}`,
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <Link href="/trips" style={{ textDecoration: 'none' }}>
          <div
            style={{
              width: '40px',
              height: '40px',
              borderRadius: '10px',
              backgroundColor: c.cardBg,
              border: `1px solid ${c.border}`,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              cursor: 'pointer',
            }}
          >
            <ArrowLeft style={{ width: '18px', height: '18px', color: c.textMuted }} />
          </div>
        </Link>
        <div style={{ flex: 1 }}>
          <h1 style={{ fontSize: isMobile ? '22px' : '28px', fontWeight: '700', color: c.textPrimary, margin: 0 }}>
            {trip.name}
          </h1>
          {trip.packageId && (
            <p style={{ fontSize: '14px', color: c.textMuted, margin: '4px 0 0 0' }}>{trip.packageId}</p>
          )}
        </div>
        <StatusBadge status={trip.status as TripStatus} />
      </div>

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : '2fr 1fr',
          gap: '24px',
        }}
      >
        {/* Trip Info Card */}
        <div
          style={{
            backgroundColor: c.cardBg,
            borderRadius: '16px',
            border: `1px solid ${c.border}`,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: isMobile ? '16px 20px' : '20px 28px',
              borderBottom: `1px solid ${c.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <Plane style={{ width: '18px', height: '18px', color: c.primary }} />
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>
              Trip Information
            </h3>
          </div>
          <div style={{ padding: isMobile ? '20px' : '28px' }}>
            <div
              style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
                gap: '20px',
              }}
            >
              <div>
                <p style={{ fontSize: '13px', fontWeight: '500', color: c.textMuted, margin: '0 0 4px 0' }}>Departure</p>
                <p style={{ fontSize: '14px', color: c.textPrimary, margin: '0 0 4px 0' }}>
                  {trip.departureDate ? formatDate(trip.departureDate) : '-'}
                </p>
                <p style={{ fontSize: '12px', color: c.textMuted, margin: 0 }}>
                  {trip.flightInfo?.departureAirline || ''} {trip.flightInfo?.departureFlightNo || ''}{' '}
                  {trip.flightInfo?.departureTime ? `• ${trip.flightInfo.departureTime}` : ''}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: '500', color: c.textMuted, margin: '0 0 4px 0' }}>Return</p>
                <p style={{ fontSize: '14px', color: c.textPrimary, margin: '0 0 4px 0' }}>
                  {trip.returnDate ? formatDate(trip.returnDate) : '-'}
                </p>
                <p style={{ fontSize: '12px', color: c.textMuted, margin: 0 }}>
                  {trip.flightInfo?.returnAirline || ''} {trip.flightInfo?.returnFlightNo || ''}{' '}
                  {trip.flightInfo?.returnTime ? `• ${trip.flightInfo.returnTime}` : ''}
                </p>
              </div>
              <div>
                <p style={{ fontSize: '13px', fontWeight: '500', color: c.textMuted, margin: '0 0 4px 0' }}>Capacity</p>
                <p style={{ fontSize: '14px', color: c.textPrimary, margin: 0 }}>
                  {trip.registeredCount}/{trip.capacity} pilgrims
                </p>
              </div>
            </div>

            {(trip.muthawwifName || checklist.guideAssigned) && (
              <div style={{ paddingTop: '20px', marginTop: '20px', borderTop: `1px solid ${c.border}` }}>
                <p style={{ fontSize: '13px', fontWeight: '500', color: c.textMuted, margin: '0 0 8px 0' }}>
                  Guide/Muthawwif
                </p>
                <p style={{ fontSize: '14px', color: c.textPrimary, margin: '0 0 4px 0' }}>
                  {trip.muthawwifName || '-'}
                </p>
                <p style={{ fontSize: '14px', color: c.textMuted, margin: 0 }}>{trip.muthawwifPhone || '-'}</p>
              </div>
            )}
          </div>
        </div>

        {/* Operational Checklist Card */}
        <div
          style={{
            backgroundColor: c.cardBg,
            borderRadius: '16px',
            border: `1px solid ${c.border}`,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              padding: isMobile ? '16px 20px' : '20px 28px',
              borderBottom: `1px solid ${c.border}`,
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
            }}
          >
            <ClipboardCheck style={{ width: '18px', height: '18px', color: c.primary }} />
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>
              Operational Checklist
            </h3>
          </div>
          <div style={{ padding: isMobile ? '20px' : '28px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              {checklistItems.map((item, index) => (
                <div key={index} style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <CheckCircle2
                    style={{
                      width: '16px',
                      height: '16px',
                      color: item.checked ? c.success : c.textLight,
                    }}
                  />
                  <span
                    style={{
                      fontSize: '14px',
                      color: item.checked ? c.textPrimary : c.textMuted,
                    }}
                  >
                    {item.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Manifest Card */}
      <div
        style={{
          backgroundColor: c.cardBg,
          borderRadius: '16px',
          border: `1px solid ${c.border}`,
          overflow: 'hidden',
        }}
      >
        <div
          style={{
            padding: isMobile ? '16px 20px' : '20px 28px',
            borderBottom: `1px solid ${c.border}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <Users style={{ width: '18px', height: '18px', color: c.primary }} />
            <h3 style={{ fontSize: '16px', fontWeight: '600', color: c.textPrimary, margin: 0 }}>
              Trip Manifest ({trip.manifest?.length || 0} pilgrims)
            </h3>
          </div>
          {trip.manifest && trip.manifest.length > 0 && (
            <button
              onClick={handlePrintManifest}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
                padding: '8px 16px',
                backgroundColor: c.cardBg,
                color: c.textSecondary,
                border: `1px solid ${c.border}`,
                borderRadius: '12px',
                fontSize: '13px',
                fontWeight: '500',
                cursor: 'pointer',
              }}
            >
              <Printer style={{ width: '14px', height: '14px' }} />
              Print
            </button>
          )}
        </div>
        <div style={{ padding: isMobile ? '20px' : '28px' }}>
          {(!trip.manifest || trip.manifest.length === 0) ? (
            <p style={{ textAlign: 'center', fontSize: '14px', color: c.textMuted, padding: '16px 0' }}>
              No pilgrims added yet
            </p>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ borderBottom: `1px solid ${c.border}` }}>
                    <th style={thStyle}>Name</th>
                    <th style={thStyle}>Status</th>
                    <th style={thStyle}>Documents</th>
                    <th style={thStyle}>Room</th>
                  </tr>
                </thead>
                <tbody>
                  {trip.manifest.map((entry) => (
                    <tr key={entry.pilgrimId}>
                      <td style={{ ...tdStyle, color: c.textPrimary }}>{entry.pilgrimName}</td>
                      <td style={tdStyle}>
                        <StatusBadge status={entry.pilgrimStatus as PilgrimStatus} size="sm" />
                      </td>
                      <td style={{ ...tdStyle, color: c.textMuted }}>
                        {entry.documentsComplete}/{entry.documentsTotal}
                      </td>
                      <td style={{ ...tdStyle, color: c.textMuted }}>{entry.roomNumber || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
