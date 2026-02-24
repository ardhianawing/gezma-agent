import { describe, it, expect } from 'vitest';
import { calculatePrayerTimes, getPrayerTimesForCity, getNextPrayer } from '@/lib/utils/prayer-times';

describe('Prayer Times', () => {
  describe('calculatePrayerTimes', () => {
    it('returns all 6 prayer times for Makkah coordinates', () => {
      const times = calculatePrayerTimes(21.3891, 39.8579, new Date(2026, 0, 15));
      expect(times).toHaveProperty('fajr');
      expect(times).toHaveProperty('sunrise');
      expect(times).toHaveProperty('dhuhr');
      expect(times).toHaveProperty('asr');
      expect(times).toHaveProperty('maghrib');
      expect(times).toHaveProperty('isha');
    });

    it('returns times in HH:MM format', () => {
      const times = calculatePrayerTimes(21.3891, 39.8579, new Date(2026, 5, 15));
      const timeRegex = /^\d{2}:\d{2}$/;
      expect(times.fajr).toMatch(timeRegex);
      expect(times.sunrise).toMatch(timeRegex);
      expect(times.dhuhr).toMatch(timeRegex);
      expect(times.asr).toMatch(timeRegex);
      expect(times.maghrib).toMatch(timeRegex);
      expect(times.isha).toMatch(timeRegex);
    });

    it('returns times in chronological order', () => {
      const times = calculatePrayerTimes(21.3891, 39.8579, new Date(2026, 3, 15));
      const toMin = (t: string) => {
        const [h, m] = t.split(':').map(Number);
        return h * 60 + m;
      };
      expect(toMin(times.fajr)).toBeLessThan(toMin(times.sunrise));
      expect(toMin(times.sunrise)).toBeLessThan(toMin(times.dhuhr));
      expect(toMin(times.dhuhr)).toBeLessThan(toMin(times.asr));
      expect(toMin(times.asr)).toBeLessThan(toMin(times.maghrib));
      expect(toMin(times.maghrib)).toBeLessThan(toMin(times.isha));
    });
  });

  describe('getPrayerTimesForCity', () => {
    it('returns prayer times for Makkah', () => {
      const times = getPrayerTimesForCity('makkah', new Date(2026, 0, 15));
      expect(times).toHaveProperty('fajr');
      expect(times).toHaveProperty('isha');
    });

    it('returns prayer times for Madinah', () => {
      const times = getPrayerTimesForCity('madinah', new Date(2026, 0, 15));
      expect(times).toHaveProperty('fajr');
      expect(times).toHaveProperty('isha');
    });

    it('Makkah and Madinah times differ', () => {
      const date = new Date(2026, 3, 15);
      const makkah = getPrayerTimesForCity('makkah', date);
      const madinah = getPrayerTimesForCity('madinah', date);
      // At least some times should differ
      const hasDifference = Object.keys(makkah).some(
        (key) => makkah[key as keyof typeof makkah] !== madinah[key as keyof typeof madinah]
      );
      expect(hasDifference).toBe(true);
    });
  });

  describe('getNextPrayer', () => {
    it('returns a valid prayer name', () => {
      const times = getPrayerTimesForCity('makkah', new Date());
      const next = getNextPrayer(times, new Date());
      expect(next).toBeTruthy();
      expect(['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha']).toContain(next);
    });

    it('returns fajr when called after isha', () => {
      const times = getPrayerTimesForCity('makkah', new Date());
      const lateNight = new Date(2026, 0, 15, 23, 0); // 23:00
      const next = getNextPrayer(times, lateNight);
      expect(next).toBe('fajr');
    });
  });
});
