'use client';

import { useState, useEffect, useMemo } from 'react';
import Link from 'next/link';
import { Plus, Plane, List, CalendarDays, ChevronLeft, ChevronRight, MapPin } from 'lucide-react';
import { EmptyState } from '@/components/shared/empty-state';
import { PageHeader } from '@/components/layout/page-header';
import { StatusBadge } from '@/components/shared/status-badge';
import type { TripStatus } from '@/types';
import { formatShortDate } from '@/lib/utils';
import { useTheme } from '@/lib/theme';
import { useLanguage } from '@/lib/i18n';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { usePermission, PERMISSIONS } from '@/lib/hooks/use-permissions';
import { CardSkeleton } from '@/components/shared/loading-skeleton';

interface TripData {
  id: string;
  name: string;
  departureDate: string | null;
  returnDate: string | null;
  capacity: number;
  registeredCount: number;
  confirmedCount: number;
  status: string;
  flightInfo: {
    departureAirline?: string;
    departureFlightNo?: string;
  } | null;
}

const DAY_NAMES = ['Sen', 'Sel', 'Rab', 'Kam', 'Jum', 'Sab', 'Min'];
const MONTH_NAMES = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni', 'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

function isSameDay(d1: Date, d2: Date) {
  return d1.getFullYear() === d2.getFullYear() && d1.getMonth() === d2.getMonth() && d1.getDate() === d2.getDate();
}

export default function TripsPage() {
  const { c } = useTheme();
  const { t } = useLanguage();
  const { isMobile, isTablet } = useResponsive();
  const { can } = usePermission();
  const [trips, setTrips] = useState<TripData[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'list' | 'calendar'>('list');

  // Calendar state
  const now = new Date();
  const [calYear, setCalYear] = useState(now.getFullYear());
  const [calMonth, setCalMonth] = useState(now.getMonth());
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);

  useEffect(() => {
    fetch('/api/trips')
      .then((res) => res.json())
      .then((json) => setTrips(json.data || []))
      .catch(() => setTrips([]))
      .finally(() => setLoading(false));
  }, []);

  // Calendar helpers
  const calendarDays = useMemo(() => {
    const firstDay = new Date(calYear, calMonth, 1);
    const lastDay = new Date(calYear, calMonth + 1, 0);
    const startDayOfWeek = (firstDay.getDay() + 6) % 7; // Mon=0
    const days: Array<{ date: Date; inMonth: boolean }> = [];

    // Previous month padding
    for (let i = startDayOfWeek - 1; i >= 0; i--) {
      const d = new Date(calYear, calMonth, -i);
      days.push({ date: d, inMonth: false });
    }
    // Current month
    for (let d = 1; d <= lastDay.getDate(); d++) {
      days.push({ date: new Date(calYear, calMonth, d), inMonth: true });
    }
    // Next month padding to fill 6 rows
    while (days.length < 42) {
      const d = new Date(calYear, calMonth + 1, days.length - startDayOfWeek - lastDay.getDate() + 1);
      days.push({ date: d, inMonth: false });
    }
    return days;
  }, [calYear, calMonth]);

  // Map trips to dates
  const tripsByDate = useMemo(() => {
    const map = new Map<string, Array<{ trip: TripData; type: 'departure' | 'return' }>>();
    trips.forEach((trip) => {
      if (trip.departureDate) {
        const d = new Date(trip.departureDate);
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push({ trip, type: 'departure' });
      }
      if (trip.returnDate) {
        const d = new Date(trip.returnDate);
        const key = `${d.getFullYear()}-${d.getMonth()}-${d.getDate()}`;
        if (!map.has(key)) map.set(key, []);
        map.get(key)!.push({ trip, type: 'return' });
      }
    });
    return map;
  }, [trips]);

  const selectedDayTrips = useMemo(() => {
    if (!selectedDate) return [];
    const key = `${selectedDate.getFullYear()}-${selectedDate.getMonth()}-${selectedDate.getDate()}`;
    return tripsByDate.get(key) || [];
  }, [selectedDate, tripsByDate]);

  function prevMonth() {
    if (calMonth === 0) { setCalMonth(11); setCalYear((y) => y - 1); }
    else setCalMonth((m) => m - 1);
  }
  function nextMonth() {
    if (calMonth === 11) { setCalMonth(0); setCalYear((y) => y + 1); }
    else setCalMonth((m) => m + 1);
  }

  // Responsive grid columns - use auto-fill for better tablet support
  const gridColumns = isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))';

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: isMobile ? '16px' : '24px' }}>
      <PageHeader
        title={t.trips.title}
        description={t.trips.description}
        actions={
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', width: isMobile ? '100%' : 'auto', flexDirection: isMobile ? 'column' : 'row' }}>
            {/* View mode toggle */}
            <div style={{ display: 'flex', gap: '4px', backgroundColor: c.cardBg, border: `1px solid ${c.border}`, borderRadius: '8px', padding: '4px' }}>
              <button
                onClick={() => setViewMode('list')}
                title="Tampilan Daftar"
                style={{
                  padding: '8px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: viewMode === 'list' ? c.primary : 'transparent',
                  color: viewMode === 'list' ? 'white' : c.textMuted,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <List style={{ width: '18px', height: '18px' }} />
              </button>
              <button
                onClick={() => setViewMode('calendar')}
                title="Tampilan Kalender"
                style={{
                  padding: '8px',
                  borderRadius: '6px',
                  border: 'none',
                  backgroundColor: viewMode === 'calendar' ? c.primary : 'transparent',
                  color: viewMode === 'calendar' ? 'white' : c.textMuted,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <CalendarDays style={{ width: '18px', height: '18px' }} />
              </button>
            </div>
            {can(PERMISSIONS.TRIPS_CREATE) && (
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
            )}
          </div>
        }
      />

      {/* Calendar View */}
      {viewMode === 'calendar' && (
        <div style={{ backgroundColor: c.cardBg, borderRadius: '12px', border: `1px solid ${c.border}`, padding: isMobile ? '16px' : '24px' }}>
          {/* Month navigation */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '20px' }}>
            <button
              onClick={prevMonth}
              style={{
                padding: '8px', borderRadius: '8px', border: `1px solid ${c.border}`,
                backgroundColor: c.cardBg, cursor: 'pointer', display: 'flex', color: c.textPrimary,
              }}
            >
              <ChevronLeft style={{ width: '20px', height: '20px' }} />
            </button>
            <h3 style={{ fontSize: '18px', fontWeight: '700', color: c.textPrimary, margin: 0 }}>
              {MONTH_NAMES[calMonth]} {calYear}
            </h3>
            <button
              onClick={nextMonth}
              style={{
                padding: '8px', borderRadius: '8px', border: `1px solid ${c.border}`,
                backgroundColor: c.cardBg, cursor: 'pointer', display: 'flex', color: c.textPrimary,
              }}
            >
              <ChevronRight style={{ width: '20px', height: '20px' }} />
            </button>
          </div>

          {/* Day headers */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px', marginBottom: '4px' }}>
            {DAY_NAMES.map((d) => (
              <div key={d} style={{ textAlign: 'center', fontSize: '12px', fontWeight: '600', color: c.textMuted, padding: '8px 0' }}>
                {d}
              </div>
            ))}
          </div>

          {/* Calendar grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: '2px' }}>
            {calendarDays.map((day, i) => {
              const key = `${day.date.getFullYear()}-${day.date.getMonth()}-${day.date.getDate()}`;
              const dayTrips = tripsByDate.get(key) || [];
              const isToday = isSameDay(day.date, now);
              const isSelected = selectedDate ? isSameDay(day.date, selectedDate) : false;
              const hasDeparture = dayTrips.some((dt) => dt.type === 'departure');
              const hasReturn = dayTrips.some((dt) => dt.type === 'return');

              return (
                <div
                  key={i}
                  onClick={() => setSelectedDate(day.date)}
                  style={{
                    minHeight: isMobile ? '44px' : '60px',
                    padding: '4px',
                    borderRadius: '8px',
                    cursor: 'pointer',
                    backgroundColor: isSelected ? (c.primaryLight || '#EFF6FF') : 'transparent',
                    border: isToday ? `2px solid ${c.primary}` : '2px solid transparent',
                    opacity: day.inMonth ? 1 : 0.3,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px',
                    transition: 'background-color 0.15s',
                  }}
                >
                  <span style={{
                    fontSize: '13px',
                    fontWeight: isToday ? '700' : '400',
                    color: isToday ? c.primary : c.textPrimary,
                  }}>
                    {day.date.getDate()}
                  </span>
                  <div style={{ display: 'flex', gap: '3px' }}>
                    {hasDeparture && (
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#3B82F6' }} />
                    )}
                    {hasReturn && (
                      <div style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10B981' }} />
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Legend */}
          <div style={{ display: 'flex', gap: '16px', marginTop: '12px', fontSize: '12px', color: c.textMuted }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#3B82F6' }} />
              Berangkat
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
              <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: '#10B981' }} />
              Pulang
            </div>
          </div>

          {/* Selected day trips panel */}
          {selectedDate && (
            <div style={{ marginTop: '20px', borderTop: `1px solid ${c.border}`, paddingTop: '16px' }}>
              <h4 style={{ fontSize: '14px', fontWeight: '600', color: c.textPrimary, margin: '0 0 12px' }}>
                Trip pada {selectedDate.getDate()} {MONTH_NAMES[selectedDate.getMonth()]} {selectedDate.getFullYear()}
              </h4>
              {selectedDayTrips.length === 0 ? (
                <p style={{ fontSize: '13px', color: c.textMuted, margin: 0 }}>Tidak ada trip pada tanggal ini.</p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {selectedDayTrips.map(({ trip, type }) => (
                    <Link key={`${trip.id}-${type}`} href={`/trips/${trip.id}`} style={{ textDecoration: 'none' }}>
                      <div style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '12px',
                        padding: '12px',
                        borderRadius: '10px',
                        border: `1px solid ${c.border}`,
                        backgroundColor: c.cardBg,
                        cursor: 'pointer',
                      }}>
                        <div style={{
                          width: '8px', height: '8px', borderRadius: '50%', flexShrink: 0,
                          backgroundColor: type === 'departure' ? '#3B82F6' : '#10B981',
                        }} />
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: '14px', fontWeight: '500', color: c.textPrimary }}>{trip.name}</div>
                          <div style={{ fontSize: '12px', color: c.textMuted }}>
                            {type === 'departure' ? 'Keberangkatan' : 'Kepulangan'} &bull; {trip.registeredCount}/{trip.capacity} terdaftar
                          </div>
                        </div>
                        <StatusBadge status={trip.status as TripStatus} size="sm" />
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* List View */}
      {viewMode === 'list' && (
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: gridColumns,
            gap: '16px',
          }}
        >
          {loading && (
            <div style={{ gridColumn: '1 / -1', display: 'grid', gridTemplateColumns: gridColumns, gap: '16px' }}>
              {Array.from({ length: 4 }).map((_, i) => <CardSkeleton key={i} />)}
            </div>
          )}
          {!loading && trips.length === 0 && (
            <div style={{ gridColumn: '1 / -1' }}>
              <EmptyState icon={MapPin} title="Belum ada trip" description="Buat trip pertama Anda." />
            </div>
          )}
          {trips.map((trip) => {
            const occupancy = trip.capacity > 0 ? (trip.registeredCount / trip.capacity) * 100 : 0;
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
                          {trip.departureDate ? formatShortDate(trip.departureDate) : '-'} - {trip.returnDate ? formatShortDate(trip.returnDate) : '-'}
                        </p>
                      </div>
                    </div>
                    <StatusBadge status={trip.status as TripStatus} size="sm" />
                  </div>

                  {/* Flight Info Ticket Stub */}
                  {(trip.flightInfo?.departureFlightNo || trip.flightInfo?.departureAirline) && (
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
                        {trip.flightInfo?.departureFlightNo}
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
                      <span>{trip.flightInfo?.departureAirline}</span>
                      <span>CGK &rarr; JED</span>
                    </div>
                  </div>
                  )}

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
      )}
    </div>
  );
}
