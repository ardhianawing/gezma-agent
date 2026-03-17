'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTheme } from '@/lib/theme';
import { useResponsive } from '@/lib/hooks/use-responsive';
import { usePilgrim } from '@/lib/contexts/pilgrim-context';
import { useLanguage } from '@/lib/i18n';

const GREEN = '#059669';
const GREEN_LIGHT = '#ECFDF5';
const GREEN_DARK = '#047857';
const WA_GREEN = '#25D366';

function formatDate(date: string): string {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function formatShortDate(date: string): string {
  return new Date(date).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'short',
  });
}

function getDaysDiff(from: string, to: string): number {
  const a = new Date(from);
  const b = new Date(to);
  return Math.ceil((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24));
}

function getStarString(rating: number): string {
  return '\u2B50'.repeat(Math.min(rating, 5));
}

type StatusKey = 'open' | 'preparing' | 'confirmed' | 'ready' | 'departed' | 'completed';

// STATUS_CONFIG labels are set inside the component using t

export default function TripDetailPage() {
  const { c } = useTheme();
  const { isMobile } = useResponsive();
  const { data } = usePilgrim();
  const { t } = useLanguage();

  const STATUS_CONFIG: Record<StatusKey, { label: string; bg: string; color: string }> = {
    open: { label: t.pilgrimTrip.statusOpen, bg: '#DBEAFE', color: '#1D4ED8' },
    preparing: { label: t.pilgrimTrip.statusPreparing, bg: '#FEF3C7', color: '#D97706' },
    confirmed: { label: t.pilgrimTrip.statusConfirmed, bg: '#D1FAE5', color: '#059669' },
    ready: { label: t.pilgrimTrip.statusReady, bg: '#D1FAE5', color: '#059669' },
    departed: { label: t.pilgrimTrip.statusDeparted, bg: '#DBEAFE', color: '#2563EB' },
    completed: { label: t.pilgrimTrip.statusCompleted, bg: '#F3F4F6', color: '#6B7280' },
  };
  const [hoveredCard, setHoveredCard] = useState<string | null>(null);
  const [now, setNow] = useState(() => new Date());
  const [shareLoading, setShareLoading] = useState(false);
  const [shareMessage, setShareMessage] = useState('');

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const trip = data?.trip;

  const countdown = useMemo(() => {
    if (!trip) return null;
    const departure = new Date(trip.departureDate);
    const returnDate = new Date(trip.returnDate);
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const depDay = new Date(departure.getFullYear(), departure.getMonth(), departure.getDate());
    const retDay = new Date(returnDate.getFullYear(), returnDate.getMonth(), returnDate.getDate());

    if (today > retDay) {
      return { type: 'completed' as const, days: 0 };
    }
    if (today >= depDay && today <= retDay) {
      const dayNum = Math.floor((today.getTime() - depDay.getTime()) / (1000 * 60 * 60 * 24)) + 1;
      return { type: 'ongoing' as const, days: dayNum };
    }
    const diff = Math.ceil((depDay.getTime() - today.getTime()) / (1000 * 60 * 60 * 24));
    return { type: 'upcoming' as const, days: diff };
  }, [trip, now]);

  const handleShareItinerary = async () => {
    setShareLoading(true);
    setShareMessage('');
    try {
      const res = await fetch('/api/pilgrim-portal/share-itinerary', { method: 'POST' });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || t.common.error);
      await navigator.clipboard.writeText(json.shareUrl);
      setShareMessage(t.pilgrimTrip.shareSuccess);
      setTimeout(() => setShareMessage(''), 3000);
    } catch (err) {
      setShareMessage(err instanceof Error ? err.message : 'Gagal membagikan');
      setTimeout(() => setShareMessage(''), 3000);
    } finally {
      setShareLoading(false);
    }
  };

  if (!data) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        color: c.textMuted,
        fontSize: '16px',
      }}>
        {t.pilgrimTrip.loginRequired}
      </div>
    );
  }

  if (!trip) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '60vh',
        gap: '12px',
        color: c.textMuted,
      }}>
        <span style={{ fontSize: '48px' }}>&#9992;&#65039;</span>
        <p style={{ fontSize: '16px', margin: 0 }}>{t.pilgrimTrip.noTrip}</p>
      </div>
    );
  }

  const statusKey = (trip.status as StatusKey) || 'open';
  const statusCfg = STATUS_CONFIG[statusKey] || STATUS_CONFIG.open;
  const duration = getDaysDiff(trip.departureDate, trip.returnDate);

  const cardStyle = (id: string): React.CSSProperties => ({
    backgroundColor: c.cardBg,
    border: '1px solid ' + c.border,
    borderRadius: '16px',
    padding: '20px',
    transition: 'all 0.2s ease',
    transform: hoveredCard === id ? 'translateY(-2px)' : 'none',
    boxShadow: hoveredCard === id ? '0 8px 25px rgba(0,0,0,0.08)' : 'none',
  });

  const pilgrimData = data;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      gap: '20px',
      paddingBottom: '80px',
    }}>

      {/* 1. Trip Header */}
      <div
        style={cardStyle('header')}
        onMouseEnter={() => setHoveredCard('header')}
        onMouseLeave={() => setHoveredCard(null)}
      >
        <div style={{
          display: 'flex',
          alignItems: 'flex-start',
          justifyContent: 'space-between',
          gap: '12px',
          flexWrap: 'wrap',
        }}>
          <div style={{ flex: 1, minWidth: '200px' }}>
            <h1 style={{
              fontSize: isMobile ? '20px' : '24px',
              fontWeight: 700,
              color: c.textPrimary,
              margin: '0 0 8px 0',
              lineHeight: 1.3,
            }}>
              {trip.name}
            </h1>
            <p style={{
              fontSize: '14px',
              color: c.textMuted,
              margin: '0 0 4px 0',
            }}>
              {trip.packageName}
            </p>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              flexWrap: 'wrap',
              marginTop: '12px',
            }}>
              <span style={{
                fontSize: '13px',
                color: c.textSecondary,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                &#128197; {formatShortDate(trip.departureDate)} - {formatShortDate(trip.returnDate)} {new Date(trip.returnDate).getFullYear()}
              </span>
              <span style={{
                fontSize: '13px',
                color: c.textSecondary,
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}>
                &#9202; {duration} {t.pilgrimTrip.duration}
              </span>
            </div>
          </div>
          <span style={{
            display: 'inline-block',
            padding: '6px 14px',
            borderRadius: '20px',
            fontSize: '12px',
            fontWeight: 600,
            backgroundColor: statusCfg.bg,
            color: statusCfg.color,
            whiteSpace: 'nowrap',
          }}>
            {statusCfg.label}
          </span>
        </div>
      </div>

      {/* 2. Countdown Timer */}
      <div style={{
        background: `linear-gradient(135deg, ${GREEN}, ${GREEN_DARK})`,
        borderRadius: '16px',
        padding: '24px',
        textAlign: 'center',
        color: 'white',
      }}>
        {countdown?.type === 'completed' ? (
          <>
            <p style={{ fontSize: '14px', margin: '0 0 8px 0', opacity: 0.9 }}>{t.pilgrimTrip.countdownStatus}</p>
            <p style={{ fontSize: '28px', fontWeight: 700, margin: 0 }}>{t.pilgrimTrip.countdownCompleted}</p>
            <p style={{ fontSize: '13px', margin: '8px 0 0 0', opacity: 0.8 }}>
              {t.pilgrimTrip.countdownCompletedMsg}
            </p>
          </>
        ) : countdown?.type === 'ongoing' ? (
          <>
            <p style={{ fontSize: '14px', margin: '0 0 8px 0', opacity: 0.9 }}>{t.pilgrimTrip.countdownDay}</p>
            <p style={{ fontSize: '48px', fontWeight: 800, margin: 0, lineHeight: 1.1 }}>
              {countdown.days}
            </p>
            <p style={{ fontSize: '15px', margin: '8px 0 0 0', opacity: 0.9, fontWeight: 500 }}>
              {t.pilgrimTrip.countdownOngoing}
            </p>
          </>
        ) : (
          <>
            <p style={{ fontSize: '14px', margin: '0 0 8px 0', opacity: 0.9 }}>{t.pilgrimTrip.countdownUpcoming}</p>
            <p style={{ fontSize: '48px', fontWeight: 800, margin: 0, lineHeight: 1.1 }}>
              {countdown?.days ?? 0}
            </p>
            <p style={{ fontSize: '15px', margin: '8px 0 0 0', opacity: 0.9, fontWeight: 500 }}>
              {t.pilgrimTrip.countdownDays}
            </p>
            <p style={{ fontSize: '12px', margin: '4px 0 0 0', opacity: 0.7 }}>
              {formatDate(trip.departureDate)}
            </p>
          </>
        )}
      </div>

      {/* Share Itinerary Button */}
      <button
        onClick={handleShareItinerary}
        disabled={shareLoading}
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '8px',
          width: '100%',
          padding: '12px',
          minHeight: '44px',
          fontSize: '14px',
          fontWeight: 600,
          color: GREEN,
          backgroundColor: GREEN_LIGHT,
          border: '1px solid ' + GREEN,
          borderRadius: '10px',
          cursor: shareLoading ? 'not-allowed' : 'pointer',
          opacity: shareLoading ? 0.7 : 1,
          boxSizing: 'border-box',
        }}
      >
        {shareLoading ? t.pilgrimTrip.shareLoading : '\u{1F517} ' + t.pilgrimTrip.shareBtn}
      </button>
      {shareMessage && (
        <p style={{
          fontSize: '13px',
          fontWeight: 500,
          color: shareMessage === t.pilgrimTrip.shareSuccess ? GREEN : '#DC2626',
          textAlign: 'center',
          margin: '4px 0 0 0',
        }}>
          {shareMessage}
        </p>
      )}

      {/* 3. Flight Info Card */}
      <div
        style={cardStyle('flight')}
        onMouseEnter={() => setHoveredCard('flight')}
        onMouseLeave={() => setHoveredCard(null)}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '16px',
        }}>
          <span style={{ fontSize: '20px' }}>&#9992;&#65039;</span>
          <h2 style={{
            fontSize: '16px',
            fontWeight: 600,
            color: c.textPrimary,
            margin: 0,
          }}>
            {t.pilgrimTrip.flightTitle}
          </h2>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px',
        }}>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
          }}>
            <span style={{
              width: '36px',
              height: '36px',
              borderRadius: '10px',
              backgroundColor: GREEN_LIGHT,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              flexShrink: 0,
            }}>
              &#9992;&#65039;
            </span>
            <div>
              <p style={{ fontSize: '12px', color: c.textMuted, margin: '0 0 2px 0' }}>{t.pilgrimTrip.airline}</p>
              <p style={{ fontSize: '14px', fontWeight: 500, color: c.textPrimary, margin: 0 }}>
                {trip.airline}
              </p>
            </div>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
          }}>
            <div style={{
              padding: '12px',
              backgroundColor: GREEN_LIGHT,
              borderRadius: '10px',
            }}>
              <p style={{ fontSize: '11px', color: GREEN_DARK, margin: '0 0 4px 0', fontWeight: 500 }}>
                &#128205; {t.pilgrimTrip.departureLabel}
              </p>
              <p style={{ fontSize: '13px', fontWeight: 600, color: GREEN, margin: 0 }}>
                {formatDate(trip.departureDate)}
              </p>
            </div>
            <div style={{
              padding: '12px',
              backgroundColor: GREEN_LIGHT,
              borderRadius: '10px',
            }}>
              <p style={{ fontSize: '11px', color: GREEN_DARK, margin: '0 0 4px 0', fontWeight: 500 }}>
                &#128205; {t.pilgrimTrip.returnLabel}
              </p>
              <p style={{ fontSize: '13px', fontWeight: 600, color: GREEN, margin: 0 }}>
                {formatDate(trip.returnDate)}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* 4. Hotel Cards */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr',
        gap: '16px',
      }}>
        {/* Makkah Hotel */}
        <div
          style={cardStyle('hotel-makkah')}
          onMouseEnter={() => setHoveredCard('hotel-makkah')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '14px',
          }}>
            <span style={{ fontSize: '22px' }}>&#128331;</span>
            <h3 style={{
              fontSize: '15px',
              fontWeight: 600,
              color: c.textPrimary,
              margin: 0,
            }}>
              {t.pilgrimTrip.hotelMakkah}
            </h3>
          </div>
          <p style={{
            fontSize: '15px',
            fontWeight: 600,
            color: c.textPrimary,
            margin: '0 0 6px 0',
          }}>
            {trip.makkahHotel}
          </p>
          <p style={{
            fontSize: '14px',
            color: c.textMuted,
            margin: '0 0 6px 0',
          }}>
            {getStarString(trip.makkahHotelRating)} ({trip.makkahHotelRating} {t.pilgrimTrip.starUnit})
          </p>
          {trip.makkahHotelDistance && (
            <p style={{
              fontSize: '13px',
              color: GREEN,
              margin: 0,
              fontWeight: 500,
            }}>
              &#128205; {trip.makkahHotelDistance}
            </p>
          )}
        </div>

        {/* Madinah Hotel */}
        <div
          style={cardStyle('hotel-madinah')}
          onMouseEnter={() => setHoveredCard('hotel-madinah')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '14px',
          }}>
            <span style={{ fontSize: '22px' }}>&#128332;</span>
            <h3 style={{
              fontSize: '15px',
              fontWeight: 600,
              color: c.textPrimary,
              margin: 0,
            }}>
              {t.pilgrimTrip.hotelMadinah}
            </h3>
          </div>
          <p style={{
            fontSize: '15px',
            fontWeight: 600,
            color: c.textPrimary,
            margin: '0 0 6px 0',
          }}>
            {trip.madinahHotel}
          </p>
          <p style={{
            fontSize: '14px',
            color: c.textMuted,
            margin: '0 0 6px 0',
          }}>
            {getStarString(trip.madinahHotelRating)} ({trip.madinahHotelRating} {t.pilgrimTrip.starUnit})
          </p>
          {trip.madinahHotelDistance && (
            <p style={{
              fontSize: '13px',
              color: GREEN,
              margin: 0,
              fontWeight: 500,
            }}>
              &#128205; {trip.madinahHotelDistance}
            </p>
          )}
        </div>
      </div>

      {/* 5. Muthawwif (Guide) Card */}
      <div
        style={cardStyle('guide')}
        onMouseEnter={() => setHoveredCard('guide')}
        onMouseLeave={() => setHoveredCard(null)}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '16px',
        }}>
          <span style={{ fontSize: '20px' }}>&#128100;</span>
          <h2 style={{
            fontSize: '16px',
            fontWeight: 600,
            color: c.textPrimary,
            margin: 0,
          }}>
            {t.pilgrimTrip.guideTitle}
          </h2>
        </div>

        <div style={{
          display: 'flex',
          alignItems: isMobile ? 'flex-start' : 'center',
          justifyContent: 'space-between',
          flexDirection: isMobile ? 'column' : 'row',
          gap: '16px',
        }}>
          <div>
            <p style={{
              fontSize: '16px',
              fontWeight: 600,
              color: c.textPrimary,
              margin: '0 0 4px 0',
            }}>
              {trip.muthawwifName}
            </p>
            <p style={{
              fontSize: '14px',
              color: c.textMuted,
              margin: 0,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}>
              &#128222; {trip.muthawwifPhone}
            </p>
          </div>

          <div style={{
            display: 'flex',
            gap: '10px',
            width: isMobile ? '100%' : 'auto',
          }}>
            <a
              href={`tel:${trip.muthawwifPhone}`}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '12px 18px',
                minHeight: '44px',
                borderRadius: '10px',
                backgroundColor: GREEN,
                color: 'white',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: 600,
                transition: 'background-color 0.15s',
                flex: isMobile ? 1 : 'none',
                boxSizing: 'border-box',
              }}
            >
              &#128222; {t.pilgrimTrip.callBtn}
            </a>
            <a
              href={`https://wa.me/${trip.muthawwifPhone.replace(/[^0-9]/g, '')}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                padding: '12px 18px',
                minHeight: '44px',
                borderRadius: '10px',
                backgroundColor: WA_GREEN,
                color: 'white',
                textDecoration: 'none',
                fontSize: '13px',
                fontWeight: 600,
                transition: 'background-color 0.15s',
                flex: isMobile ? 1 : 'none',
                boxSizing: 'border-box',
              }}
            >
              &#128172; {t.pilgrimTrip.waBtn}
            </a>
          </div>
        </div>
      </div>

      {/* 6. Room Assignment Card */}
      {pilgrimData.pilgrim && (
        (() => {
          const roomNumber = pilgrimData.pilgrim.roomNumber;
          const roomType = pilgrimData.pilgrim.roomType;

          if (!roomNumber && !roomType) return null;

          const roomTypeLabel: Record<string, string> = {
            single: t.pilgrimTrip.roomSingle,
            double: t.pilgrimTrip.roomDouble,
            triple: t.pilgrimTrip.roomTriple,
            quad: t.pilgrimTrip.roomQuad,
          };

          return (
            <div
              style={cardStyle('room')}
              onMouseEnter={() => setHoveredCard('room')}
              onMouseLeave={() => setHoveredCard(null)}
            >
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                marginBottom: '16px',
              }}>
                <span style={{ fontSize: '20px' }}>&#127976;</span>
                <h2 style={{
                  fontSize: '16px',
                  fontWeight: 600,
                  color: c.textPrimary,
                  margin: 0,
                }}>
                  {t.pilgrimTrip.roomTitle}
                </h2>
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '12px',
              }}>
                {roomNumber && (
                  <div style={{
                    padding: '14px',
                    backgroundColor: GREEN_LIGHT,
                    borderRadius: '10px',
                  }}>
                    <p style={{ fontSize: '12px', color: GREEN_DARK, margin: '0 0 4px 0', fontWeight: 500 }}>
                      &#127976; {t.pilgrimTrip.roomNumber}
                    </p>
                    <p style={{ fontSize: '18px', fontWeight: 700, color: GREEN, margin: 0 }}>
                      {roomNumber}
                    </p>
                  </div>
                )}
                {roomType && (
                  <div style={{
                    padding: '14px',
                    backgroundColor: GREEN_LIGHT,
                    borderRadius: '10px',
                  }}>
                    <p style={{ fontSize: '12px', color: GREEN_DARK, margin: '0 0 4px 0', fontWeight: 500 }}>
                      &#128716;&#65039; {t.pilgrimTrip.roomType}
                    </p>
                    <p style={{ fontSize: '15px', fontWeight: 600, color: GREEN, margin: 0, textTransform: 'capitalize' }}>
                      {roomTypeLabel[roomType] || roomType}
                    </p>
                  </div>
                )}
              </div>
            </div>
          );
        })()
      )}

      {/* Emergency / SOS Card */}
      <div style={{
        backgroundColor: c.cardBg,
        border: '2px solid #DC2626',
        borderRadius: '16px',
        padding: '20px',
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '10px',
          marginBottom: '14px',
        }}>
          <span style={{ fontSize: '20px' }}>{'\u{1F4DE}'}</span>
          <h2 style={{
            fontSize: '16px',
            fontWeight: 700,
            color: '#DC2626',
            margin: 0,
          }}>
            {t.pilgrimTrip.sosTitle}
          </h2>
        </div>

        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '10px',
        }}>
          <a
            href="tel:997"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: isMobile ? '14px 16px' : '12px 16px',
              minHeight: '48px',
              borderRadius: '10px',
              backgroundColor: '#FEF2F2',
              textDecoration: 'none',
              transition: 'background-color 0.15s',
              boxSizing: 'border-box',
            }}
          >
            <span style={{ fontSize: '22px', flexShrink: 0 }}>{'\u{1F4DE}'}</span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <p style={{ fontSize: '15px', fontWeight: 600, color: '#DC2626', margin: '0 0 2px 0' }}>
                {t.pilgrimTrip.sosSaudi}
              </p>
              <p style={{ fontSize: '12px', color: '#991B1B', margin: 0 }}>
                {t.pilgrimTrip.sosTap}
              </p>
            </div>
          </a>

          {trip.muthawwifPhone && (
            <a
              href={'tel:' + trip.muthawwifPhone}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: isMobile ? '14px 16px' : '12px 16px',
                minHeight: '48px',
                borderRadius: '10px',
                backgroundColor: GREEN_LIGHT,
                textDecoration: 'none',
                transition: 'background-color 0.15s',
                boxSizing: 'border-box',
              }}
            >
              <span style={{ fontSize: '22px', flexShrink: 0 }}>{'\u{1F4DE}'}</span>
              <div style={{ flex: 1, minWidth: 0 }}>
                <p style={{ fontSize: '15px', fontWeight: 600, color: GREEN_DARK, margin: '0 0 2px 0' }}>
                  {t.pilgrimTrip.sosGuide}
                </p>
                <p style={{ fontSize: '12px', color: GREEN, margin: 0, wordBreak: 'break-word' as const }}>
                  {trip.muthawwifName} - {trip.muthawwifPhone}
                </p>
              </div>
            </a>
          )}
        </div>
      </div>

      {/* 7. Itinerary Section */}
      {trip.itinerary && trip.itinerary.length > 0 && (
        <div
          style={cardStyle('itinerary')}
          onMouseEnter={() => setHoveredCard('itinerary')}
          onMouseLeave={() => setHoveredCard(null)}
        >
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '20px',
          }}>
            <span style={{ fontSize: '20px' }}>&#128197;</span>
            <h2 style={{
              fontSize: '16px',
              fontWeight: 600,
              color: c.textPrimary,
              margin: 0,
            }}>
              {t.pilgrimTrip.itineraryTitle}
            </h2>
          </div>

          <div style={{
            display: 'flex',
            flexDirection: 'column',
            position: 'relative',
          }}>
            {trip.itinerary.map((item, index) => {
              const isLast = index === trip.itinerary.length - 1;
              const isActive = countdown?.type === 'ongoing' && countdown.days === item.day;
              const isPast = countdown?.type === 'ongoing'
                ? item.day < countdown.days
                : countdown?.type === 'completed';
              const isFuture = countdown?.type === 'upcoming'
                || (countdown?.type === 'ongoing' && item.day > countdown.days);

              return (
                <div
                  key={item.day}
                  style={{
                    display: 'flex',
                    gap: isMobile ? '12px' : '16px',
                    paddingBottom: isLast ? 0 : (isMobile ? '18px' : '24px'),
                    position: 'relative',
                  }}
                >
                  {/* Timeline line */}
                  {!isLast && (
                    <div style={{
                      position: 'absolute',
                      left: '19px',
                      top: '40px',
                      bottom: 0,
                      width: '2px',
                      backgroundColor: isPast ? GREEN : c.border,
                    }} />
                  )}

                  {/* Day circle */}
                  <div style={{
                    width: '40px',
                    height: '40px',
                    borderRadius: '50%',
                    backgroundColor: isActive ? GREEN : isPast ? GREEN : isFuture ? c.cardBg : c.cardBg,
                    border: isActive
                      ? `3px solid ${GREEN}`
                      : isPast
                        ? `2px solid ${GREEN}`
                        : `2px solid ${c.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0,
                    zIndex: 1,
                    boxShadow: isActive ? `0 0 0 4px ${GREEN_LIGHT}` : 'none',
                  }}>
                    <span style={{
                      fontSize: '11px',
                      fontWeight: 700,
                      color: (isActive || isPast) ? 'white' : c.textMuted,
                    }}>
                      H-{item.day}
                    </span>
                  </div>

                  {/* Content */}
                  <div style={{
                    flex: 1,
                    paddingTop: '2px',
                    minWidth: 0,
                  }}>
                    <h4 style={{
                      fontSize: '14px',
                      fontWeight: 600,
                      color: isActive ? GREEN : c.textPrimary,
                      margin: '0 0 8px 0',
                      lineHeight: 1.4,
                    }}>
                      {item.title}
                      {isActive && (
                        <span style={{
                          marginLeft: '8px',
                          fontSize: '11px',
                          fontWeight: 600,
                          color: 'white',
                          backgroundColor: GREEN,
                          padding: '2px 8px',
                          borderRadius: '10px',
                          verticalAlign: 'middle',
                        }}>
                          {t.pilgrimTrip.itineraryToday}
                        </span>
                      )}
                    </h4>
                    <ul style={{
                      margin: 0,
                      paddingLeft: '18px',
                      listStyleType: 'disc',
                    }}>
                      {item.activities.map((activity, actIdx) => (
                        <li
                          key={actIdx}
                          style={{
                            fontSize: '13px',
                            color: isPast ? c.textLight : c.textMuted,
                            lineHeight: 1.6,
                            textDecoration: isPast ? 'line-through' : 'none',
                          }}
                        >
                          {activity}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* SOS button handled by layout */}
    </div>
  );
}
