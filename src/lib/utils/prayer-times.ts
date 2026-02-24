export type City = 'makkah' | 'madinah';

export interface PrayerTimes {
  fajr: string;
  sunrise: string;
  dhuhr: string;
  asr: string;
  maghrib: string;
  isha: string;
}

interface CityCoords {
  lat: number;
  lng: number;
}

const CITY_COORDS: Record<City, CityCoords> = {
  makkah: { lat: 21.3891, lng: 39.8579 },
  madinah: { lat: 24.4686, lng: 39.6142 },
};

// Base times (approximate annual average)
const BASE_TIMES: Record<City, PrayerTimes> = {
  makkah: {
    fajr: '04:45',
    sunrise: '06:10',
    dhuhr: '12:15',
    asr: '15:30',
    maghrib: '18:20',
    isha: '19:50',
  },
  madinah: {
    fajr: '04:30',
    sunrise: '05:55',
    dhuhr: '12:10',
    asr: '15:25',
    maghrib: '18:15',
    isha: '19:45',
  },
};

// Seasonal offset in minutes based on month (0 = January)
// Positive = later, Negative = earlier
// Simplified sinusoidal approximation peaking in June (summer)
function getSeasonalOffset(month: number): number {
  // month 0-11
  // June (5) = max offset +15, December (11) = min offset -15
  const angle = ((month - 5) / 12) * 2 * Math.PI;
  return Math.round(-15 * Math.cos(angle));
}

function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const totalMinutes = h * 60 + m + minutes;
  const newH = Math.floor(((totalMinutes % 1440) + 1440) % 1440 / 60);
  const newM = ((totalMinutes % 1440) + 1440) % 1440 % 60;
  return String(newH).padStart(2, '0') + ':' + String(newM).padStart(2, '0');
}

export function calculatePrayerTimes(lat: number, lng: number, date: Date): PrayerTimes {
  // Determine closest city
  const makkahDist = Math.abs(lat - CITY_COORDS.makkah.lat) + Math.abs(lng - CITY_COORDS.makkah.lng);
  const madinahDist = Math.abs(lat - CITY_COORDS.madinah.lat) + Math.abs(lng - CITY_COORDS.madinah.lng);
  const city: City = makkahDist <= madinahDist ? 'makkah' : 'madinah';

  return getPrayerTimesForCity(city, date);
}

export function getPrayerTimesForCity(city: City, date: Date): PrayerTimes {
  const month = date.getMonth();
  const offset = getSeasonalOffset(month);
  const base = BASE_TIMES[city];

  // Fajr and sunrise shift opposite to Maghrib/Isha
  // In summer: fajr earlier, maghrib later
  // In winter: fajr later, maghrib earlier
  return {
    fajr: addMinutesToTime(base.fajr, -offset),
    sunrise: addMinutesToTime(base.sunrise, -offset),
    dhuhr: addMinutesToTime(base.dhuhr, 0), // Dhuhr is relatively stable
    asr: addMinutesToTime(base.asr, Math.round(offset * 0.5)),
    maghrib: addMinutesToTime(base.maghrib, offset),
    isha: addMinutesToTime(base.isha, offset),
  };
}

export function getNextPrayer(times: PrayerTimes, now: Date): keyof PrayerTimes | null {
  const currentTime = String(now.getHours()).padStart(2, '0') + ':' + String(now.getMinutes()).padStart(2, '0');

  const order: (keyof PrayerTimes)[] = ['fajr', 'sunrise', 'dhuhr', 'asr', 'maghrib', 'isha'];

  for (const prayer of order) {
    if (times[prayer] > currentTime) {
      return prayer;
    }
  }

  // After isha, next prayer is fajr (tomorrow)
  return 'fajr';
}
