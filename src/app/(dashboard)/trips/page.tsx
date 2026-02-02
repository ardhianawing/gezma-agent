'use client';

import Link from 'next/link';
import { Plus, Plane } from 'lucide-react';
import { PageHeader } from '@/components/layout/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import { mockTrips } from '@/data/mock-trips';
import { formatShortDate } from '@/lib/utils';
import { useTheme } from '@/lib/theme';
import { useLanguage } from '@/lib/i18n';
import { useResponsive } from '@/lib/hooks/use-responsive';

export default function TripsPage() {
  const { c } = useTheme();
  const { t } = useLanguage();
  const { isMobile, isTablet } = useResponsive();

  // Responsive grid columns
  const gridColumns = isMobile ? '1fr' : isTablet ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '24px' }}>
      <PageHeader
        title={t.trips.title}
        description={t.trips.description}
        actions={
          <Link href="/trips/new" style={{ width: isMobile ? '100%' : 'auto', display: 'block' }}>
            <button
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                backgroundColor: c.primary,
                color: 'white',
                padding: '10px 16px',
                borderRadius: '8px',
                border: 'none',
                fontWeight: '500',
                cursor: 'pointer',
                transition: 'background-color 0.2s',
                width: isMobile ? '100%' : 'auto',
              }}
            >
              <Plus style={{ width: '20px', height: '20px' }} />
              <span>{t.trips.createTrip}</span>
            </button>
          </Link>
        }
      />

      <div
        style={{
          display: 'grid',
          gridTemplateColumns: gridColumns,
          gap: '16px',
        }}
      >
        {mockTrips.map((trip) => {
          const occupancy = (trip.registeredCount / trip.capacity) * 100;
          const occupancyColor = occupancy >= 100 ? c.success : occupancy >= 80 ? c.warning : c.primary;

          return (
            <Link key={trip.id} href={`/trips/${trip.id}`} style={{ textDecoration: 'none' }}>
              <div
                style={{
                  backgroundColor: c.cardBg,
                  borderRadius: '12px',
                  border: `1px solid ${c.border}`,
                  padding: isMobile ? '16px' : '20px',
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                {/* Card Header */}
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'space-between',
                    marginBottom: '16px',
                    flexWrap: 'wrap',
                    gap: '12px',
                  }}
                >
                  <div style={{ display: 'flex', gap: '12px', flex: 1, minWidth: 0 }}>
                    <div
                      style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '10px',
                        backgroundColor: c.primaryLight,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                      }}
                    >
                      <Plane style={{ width: '20px', height: '20px', color: c.primary }} />
                    </div>
                    <div style={{ minWidth: 0 }}>
                      <h3
                        style={{
                          fontWeight: '700',
                          fontSize: '14px',
                          color: c.textPrimary,
                          margin: 0,
                        }}
                      >
                        {trip.name}
                      </h3>
                      <p
                        style={{
                          fontSize: '12px',
                          color: c.textSecondary,
                          marginTop: '4px',
                          fontWeight: '500',
                        }}
                      >
                        {formatShortDate(trip.departureDate)} - {formatShortDate(trip.returnDate)}
                      </p>
                    </div>
                  </div>
                  <StatusBadge status={trip.status} size="sm" />
                </div>

                {/* Flight Info Ticket Stub */}
                <div
                  style={{
                    backgroundColor: c.cardBgHover,
                    borderRadius: '8px',
                    padding: '12px',
                    marginBottom: '16px',
                    fontSize: '12px',
                    border: `1px dashed ${c.border}`,
                  }}
                >
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      marginBottom: '4px',
                    }}
                  >
                    <span style={{ color: c.textSecondary }}>{t.trips.departure}</span>
                    <span style={{ fontFamily: 'monospace', fontWeight: '500', color: c.textPrimary }}>
                      {trip.flightInfo.departureFlightNo}
                    </span>
                  </div>
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      color: c.textPrimary,
                      fontWeight: '500',
                    }}
                  >
                    <span>{trip.flightInfo.departureAirline}</span>
                    <span>CGK → JED</span>
                  </div>
                </div>

                {/* Seat Availability - pushed to bottom */}
                <div style={{ marginTop: 'auto' }}>
                  {/* Progress Bar Label */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      fontSize: '12px',
                      marginBottom: '6px',
                    }}
                  >
                    <span style={{ color: c.textSecondary }}>{t.trips.seatAvailability}</span>
                    <span style={{ fontWeight: '700', color: c.textPrimary }}>
                      {trip.registeredCount}{' '}
                      <span style={{ color: c.textLight, fontWeight: '400' }}>/ {trip.capacity}</span>
                    </span>
                  </div>

                  {/* Progress Bar */}
                  <div
                    style={{
                      height: '8px',
                      width: '100%',
                      backgroundColor: c.border,
                      borderRadius: '9999px',
                      overflow: 'hidden',
                    }}
                  >
                    <div
                      style={{
                        height: '100%',
                        width: `${occupancy}%`,
                        backgroundColor: occupancyColor,
                        borderRadius: '9999px',
                        transition: 'all 0.5s',
                      }}
                    />
                  </div>

                  {/* Bottom Stats */}
                  <div
                    style={{
                      display: 'flex',
                      justifyContent: 'space-between',
                      marginTop: '12px',
                      fontSize: '12px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <div
                        style={{
                          width: '6px',
                          height: '6px',
                          borderRadius: '50%',
                          backgroundColor: c.success,
                        }}
                      />
                      <span style={{ color: c.textSecondary }}>
                        {t.trips.confirmed}:{' '}
                        <span style={{ fontWeight: '500', color: c.textPrimary }}>{trip.confirmedCount}</span>
                      </span>
                    </div>
                    <span style={{ color: c.success, fontWeight: '500' }}>
                      {trip.capacity - trip.registeredCount} {t.trips.left}
                    </span>
                  </div>
                </div>
              </div>
            </Link>
          );
        })}
      </div>
    </div>
  );
}
