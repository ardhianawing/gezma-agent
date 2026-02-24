'use client';

import { useState, useEffect, useMemo } from 'react';
import { useTheme } from '@/lib/theme';
import { getPrayerTimesForCity, getNextPrayer, type City, type PrayerTimes } from '@/lib/utils/prayer-times';

const GREEN = '#059669';
const GREEN_LIGHT = '#ECFDF5';
const GREEN_DARK = '#047857';

const PRAYER_LABELS: Record<keyof PrayerTimes, string> = {
  fajr: 'Subuh',
  sunrise: 'Syuruq',
  dhuhr: 'Dzuhur',
  asr: 'Ashar',
  maghrib: 'Maghrib',
  isha: 'Isya',
};

const PRAYER_ICONS: Record<keyof PrayerTimes, string> = {
  fajr: '\u{1F319}',
  sunrise: '\u{1F305}',
  dhuhr: '\u{2600}\u{FE0F}',
  asr: '\u{1F324}\u{FE0F}',
  maghrib: '\u{1F307}',
  isha: '\u{1F303}',
};

export function PrayerTimesWidget() {
  const { c } = useTheme();
  const [city, setCity] = useState<City>('makkah');
  const [now, setNow] = useState(() => new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 60000);
    return () => clearInterval(interval);
  }, []);

  const times = useMemo(() => getPrayerTimesForCity(city, now), [city, now]);
  const nextPrayer = useMemo(() => getNextPrayer(times, now), [times, now]);

  const prayerOrder: (keyof PrayerTimes)[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

  return (
    <div style={{
      backgroundColor: c.cardBg,
      border: '1px solid ' + c.border,
      borderRadius: '16px',
      padding: '20px',
      marginBottom: '16px',
    }}>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: '16px',
      }}>
        <h2 style={{
          fontSize: '15px',
          fontWeight: 600,
          color: c.textPrimary,
          margin: 0,
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
        }}>
          {'\u{1F54C}'} Waktu Sholat
        </h2>

        {/* City toggle */}
        <div style={{
          display: 'flex',
          backgroundColor: c.pageBg,
          borderRadius: '8px',
          border: '1px solid ' + c.borderLight,
          overflow: 'hidden',
        }}>
          {(['makkah', 'madinah'] as City[]).map((c2) => (
            <button
              key={c2}
              onClick={() => setCity(c2)}
              style={{
                padding: '5px 12px',
                fontSize: '12px',
                fontWeight: city === c2 ? 600 : 400,
                color: city === c2 ? '#FFFFFF' : c.textMuted,
                backgroundColor: city === c2 ? GREEN : 'transparent',
                border: 'none',
                cursor: 'pointer',
                transition: 'all 0.15s',
              }}
            >
              {c2 === 'makkah' ? 'Makkah' : 'Madinah'}
            </button>
          ))}
        </div>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(3, 1fr)',
        gap: '8px',
      }}>
        {prayerOrder.map((key) => {
          const isNext = key === nextPrayer;
          return (
            <div
              key={key}
              style={{
                padding: '10px 8px',
                borderRadius: '10px',
                backgroundColor: isNext ? GREEN : c.pageBg,
                border: isNext ? 'none' : '1px solid ' + c.borderLight,
                textAlign: 'center',
                transition: 'all 0.2s',
              }}
            >
              <span style={{ fontSize: '16px' }}>{PRAYER_ICONS[key]}</span>
              <p style={{
                fontSize: '11px',
                fontWeight: 500,
                color: isNext ? 'rgba(255,255,255,0.85)' : c.textMuted,
                margin: '4px 0 2px 0',
              }}>
                {PRAYER_LABELS[key]}
              </p>
              <p style={{
                fontSize: '14px',
                fontWeight: 700,
                color: isNext ? '#FFFFFF' : c.textPrimary,
                margin: 0,
              }}>
                {times[key]}
              </p>
              {isNext && (
                <span style={{
                  display: 'inline-block',
                  marginTop: '4px',
                  fontSize: '9px',
                  fontWeight: 600,
                  color: '#FFFFFF',
                  backgroundColor: 'rgba(255,255,255,0.25)',
                  padding: '1px 6px',
                  borderRadius: '4px',
                }}>
                  Berikutnya
                </span>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
