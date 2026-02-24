'use client';

import { useState, useEffect, use } from 'react';

const GREEN = '#059669';
const GREEN_LIGHT = '#ECFDF5';
const GREEN_DARK = '#047857';
const BG = '#F9FAFB';
const CARD_BG = '#FFFFFF';
const BORDER = '#E5E7EB';
const TEXT_PRIMARY = '#111827';
const TEXT_MUTED = '#6B7280';

interface ItineraryDay {
  day: number;
  title: string;
  activities: string[];
}

interface SharedTrip {
  tripName: string;
  departureDate: string | null;
  returnDate: string | null;
  status: string;
  agencyName: string;
  packageName: string;
  airline: string;
  makkahHotel: string;
  madinahHotel: string;
  itinerary: ItineraryDay[];
}

function formatDate(dateStr: string): string {
  return new Date(dateStr).toLocaleDateString('id-ID', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

export default function SharedItineraryPage({ params }: { params: Promise<{ code: string }> }) {
  const { code } = use(params);
  const [data, setData] = useState<SharedTrip | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/share/itinerary/' + code)
      .then((r) => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then(setData)
      .catch(() => setError('Itinerary tidak ditemukan atau link sudah tidak berlaku.'))
      .finally(() => setLoading(false));
  }, [code]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: BG,
        color: TEXT_MUTED,
        fontSize: '16px',
      }}>
        Memuat...
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        backgroundColor: BG,
        gap: '12px',
        padding: '20px',
      }}>
        <span style={{ fontSize: '48px' }}>{'\u{1F50D}'}</span>
        <p style={{ fontSize: '16px', color: TEXT_MUTED, margin: 0, textAlign: 'center' }}>
          {error || 'Itinerary tidak ditemukan'}
        </p>
      </div>
    );
  }

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: BG,
      padding: '20px',
    }}>
      <div style={{
        maxWidth: '700px',
        margin: '0 auto',
      }}>
        {/* Header */}
        <div style={{
          background: `linear-gradient(135deg, ${GREEN}, ${GREEN_DARK})`,
          borderRadius: '16px',
          padding: '28px 24px',
          color: 'white',
          marginBottom: '16px',
          textAlign: 'center',
        }}>
          <span style={{ fontSize: '28px' }}>{'\u{1F54B}'}</span>
          <h1 style={{
            fontSize: '22px',
            fontWeight: 700,
            margin: '8px 0 4px 0',
          }}>
            {data.tripName}
          </h1>
          {data.packageName && (
            <p style={{ fontSize: '14px', opacity: 0.9, margin: '0 0 8px 0' }}>
              {data.packageName}
            </p>
          )}
          <p style={{ fontSize: '12px', opacity: 0.8, margin: 0 }}>
            Dibagikan oleh {data.agencyName}
          </p>
        </div>

        {/* Trip info */}
        <div style={{
          backgroundColor: CARD_BG,
          border: '1px solid ' + BORDER,
          borderRadius: '16px',
          padding: '20px',
          marginBottom: '16px',
        }}>
          <div style={{
            display: 'grid',
            gridTemplateColumns: '1fr 1fr',
            gap: '12px',
          }}>
            {data.departureDate && (
              <div style={{
                padding: '12px',
                backgroundColor: GREEN_LIGHT,
                borderRadius: '10px',
              }}>
                <p style={{ fontSize: '11px', color: GREEN_DARK, margin: '0 0 4px 0', fontWeight: 500 }}>
                  Keberangkatan
                </p>
                <p style={{ fontSize: '13px', fontWeight: 600, color: GREEN, margin: 0 }}>
                  {formatDate(data.departureDate)}
                </p>
              </div>
            )}
            {data.returnDate && (
              <div style={{
                padding: '12px',
                backgroundColor: GREEN_LIGHT,
                borderRadius: '10px',
              }}>
                <p style={{ fontSize: '11px', color: GREEN_DARK, margin: '0 0 4px 0', fontWeight: 500 }}>
                  Kepulangan
                </p>
                <p style={{ fontSize: '13px', fontWeight: 600, color: GREEN, margin: 0 }}>
                  {formatDate(data.returnDate)}
                </p>
              </div>
            )}
          </div>

          {(data.airline || data.makkahHotel || data.madinahHotel) && (
            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              marginTop: '12px',
            }}>
              {data.airline && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px' }}>{'\u{2708}\u{FE0F}'}</span>
                  <span style={{ fontSize: '13px', color: TEXT_PRIMARY, fontWeight: 500 }}>
                    {data.airline}
                  </span>
                </div>
              )}
              {data.makkahHotel && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px' }}>{'\u{1F54B}'}</span>
                  <span style={{ fontSize: '13px', color: TEXT_PRIMARY, fontWeight: 500 }}>
                    Makkah: {data.makkahHotel}
                  </span>
                </div>
              )}
              {data.madinahHotel && (
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '14px' }}>{'\u{1F54C}'}</span>
                  <span style={{ fontSize: '13px', color: TEXT_PRIMARY, fontWeight: 500 }}>
                    Madinah: {data.madinahHotel}
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Itinerary */}
        {data.itinerary && data.itinerary.length > 0 && (
          <div style={{
            backgroundColor: CARD_BG,
            border: '1px solid ' + BORDER,
            borderRadius: '16px',
            padding: '20px',
            marginBottom: '16px',
          }}>
            <h2 style={{
              fontSize: '16px',
              fontWeight: 600,
              color: TEXT_PRIMARY,
              margin: '0 0 16px 0',
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
            }}>
              {'\u{1F4C5}'} Jadwal Perjalanan
            </h2>

            <div style={{ display: 'flex', flexDirection: 'column', position: 'relative' }}>
              {data.itinerary.map((day, index) => {
                const isLast = index === data.itinerary.length - 1;
                return (
                  <div key={day.day} style={{
                    display: 'flex',
                    gap: '16px',
                    paddingBottom: isLast ? 0 : '20px',
                    position: 'relative',
                  }}>
                    {!isLast && (
                      <div style={{
                        position: 'absolute',
                        left: '19px',
                        top: '40px',
                        bottom: 0,
                        width: '2px',
                        backgroundColor: BORDER,
                      }} />
                    )}
                    <div style={{
                      width: '40px',
                      height: '40px',
                      borderRadius: '50%',
                      backgroundColor: GREEN,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      flexShrink: 0,
                      zIndex: 1,
                    }}>
                      <span style={{
                        fontSize: '11px',
                        fontWeight: 700,
                        color: 'white',
                      }}>
                        H-{day.day}
                      </span>
                    </div>
                    <div style={{ flex: 1, paddingTop: '2px' }}>
                      <h4 style={{
                        fontSize: '14px',
                        fontWeight: 600,
                        color: TEXT_PRIMARY,
                        margin: '0 0 6px 0',
                      }}>
                        {day.title}
                      </h4>
                      <ul style={{
                        margin: 0,
                        paddingLeft: '18px',
                        listStyleType: 'disc',
                      }}>
                        {day.activities.map((activity, i) => (
                          <li key={i} style={{
                            fontSize: '13px',
                            color: TEXT_MUTED,
                            lineHeight: 1.6,
                          }}>
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

        {/* Footer */}
        <p style={{
          textAlign: 'center',
          fontSize: '11px',
          color: TEXT_MUTED,
          margin: '16px 0',
        }}>
          Dibagikan melalui GEZMA Pilgrim
        </p>
      </div>
    </div>
  );
}
