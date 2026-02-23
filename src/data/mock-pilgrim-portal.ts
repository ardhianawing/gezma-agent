// Mock data for Pilgrim Portal

export interface PilgrimPortalData {
  pilgrim: {
    id: string;
    name: string;
    nik: string;
    phone: string;
    email: string;
    gender: string;
    birthDate: string;
    birthPlace: string;
    address: string;
    city: string;
    province: string;
    status: string;
    bookingCode: string;
    roomNumber: string | null;
    roomType: string | null;
    avatarUrl?: string;
  };
  trip: {
    id: string;
    name: string;
    packageName: string;
    departureDate: string;
    returnDate: string;
    airline: string;
    muthawwifName: string;
    muthawwifPhone: string;
    status: string;
    makkahHotel: string;
    makkahHotelRating: number;
    makkahHotelDistance: string;
    madinahHotel: string;
    madinahHotelRating: number;
    madinahHotelDistance: string;
    itinerary: Array<{
      day: number;
      title: string;
      activities: string[];
    }>;
  };
  agency: {
    name: string;
    phone: string;
    whatsapp: string;
    address: string;
    logoEmoji: string;
  };
  payments: Array<{
    id: string;
    type: string;
    amount: number;
    date: string;
    method: string;
  }>;
  documents: Array<{
    type: string;
    label: string;
    status: string;
    required: boolean;
  }>;
  totalPackagePrice: number;
  totalPaid: number;
  remainingBalance: number;
}

const mockPilgrimData: PilgrimPortalData = {
  pilgrim: {
    id: 'plg-001',
    name: 'Ahmad Fauzi Rahman',
    nik: '3201012345678901',
    phone: '+6281234567890',
    email: 'ahmad.fauzi@email.com',
    gender: 'male',
    birthDate: '1988-05-23',
    birthPlace: 'Bekasi',
    address: 'Jl. Mawar No. 15, RT 03/RW 05, Kel. Jatiasih',
    city: 'Bekasi',
    province: 'Jawa Barat',
    status: 'dokumen',
    bookingCode: 'UMR-2026-0001',
    roomNumber: '512',
    roomType: 'double',
  },
  trip: {
    id: 'trip-001',
    name: 'Umrah Reguler Maret 2026',
    packageName: 'Paket Umrah Premium 12 Hari',
    departureDate: '2026-03-15',
    returnDate: '2026-03-26',
    airline: 'Saudi Airlines',
    muthawwifName: 'Ustadz Hasan Al-Farisi',
    muthawwifPhone: '+6281299887766',
    status: 'confirmed',
    makkahHotel: 'Hilton Suites Makkah',
    makkahHotelRating: 5,
    makkahHotelDistance: '200m dari Masjidil Haram',
    madinahHotel: 'Oberoi Madinah',
    madinahHotelRating: 5,
    madinahHotelDistance: '300m dari Masjid Nabawi',
    itinerary: [
      {
        day: 1,
        title: 'Keberangkatan Jakarta - Jeddah',
        activities: [
          'Berkumpul di Bandara Soekarno-Hatta Terminal 3',
          'Check-in dan pengarahan singkat',
          'Penerbangan Jakarta - Jeddah (10 jam)',
          'Tiba di Jeddah, transfer ke Makkah',
        ],
      },
      {
        day: 2,
        title: 'Umrah Pertama',
        activities: [
          'Mandi & memakai ihram di hotel',
          'Niat umrah dari Masjidil Haram',
          'Tawaf 7 putaran',
          'Sai antara Shafa & Marwah',
          'Tahallul (potong rambut)',
          'Istirahat di hotel',
        ],
      },
      {
        day: 3,
        title: 'Ziarah Makkah',
        activities: [
          'Sholat Subuh di Masjidil Haram',
          'Ziarah Jabal Rahmah',
          'Ziarah Padang Arafah',
          'Ziarah Muzdalifah & Mina',
          'Sholat berjamaah di Masjidil Haram',
        ],
      },
      {
        day: 4,
        title: 'Ibadah di Masjidil Haram',
        activities: [
          'Sholat 5 waktu berjamaah di Masjidil Haram',
          'Tawaf sunnah',
          'Membaca Al-Quran',
          'Dzikir & doa di Multazam',
        ],
      },
      {
        day: 5,
        title: 'Free Day Makkah',
        activities: [
          'Ibadah mandiri di Masjidil Haram',
          'Belanja oleh-oleh di sekitar hotel',
          'Umrah kedua (sunnah) dari Tan\'im',
        ],
      },
      {
        day: 6,
        title: 'Perjalanan Makkah - Madinah',
        activities: [
          'Check-out hotel Makkah',
          'Perjalanan bus Makkah - Madinah (5 jam)',
          'Check-in hotel Madinah',
          'Sholat Maghrib di Masjid Nabawi',
        ],
      },
      {
        day: 7,
        title: 'Ziarah Madinah',
        activities: [
          'Sholat Subuh di Masjid Nabawi',
          'Ziarah Raudhah (area surga)',
          'Ziarah makam Nabi Muhammad SAW',
          'Ziarah Masjid Quba',
          'Ziarah Jabal Uhud',
        ],
      },
      {
        day: 8,
        title: 'Ibadah di Masjid Nabawi',
        activities: [
          'Sholat 5 waktu di Masjid Nabawi',
          'I\'tikaf & membaca Al-Quran',
          'Sholat sunnah 40 waktu (arbain)',
        ],
      },
      {
        day: 9,
        title: 'Ziarah Madinah Lanjutan',
        activities: [
          'Ziarah Masjid Qiblatain',
          'Ziarah Kebun Kurma',
          'Ziarah pemakaman Baqi',
          'Belanja kurma & oleh-oleh',
        ],
      },
      {
        day: 10,
        title: 'Free Day Madinah',
        activities: [
          'Ibadah mandiri di Masjid Nabawi',
          'Waktu bebas untuk belanja atau istirahat',
          'Makan malam bersama group',
        ],
      },
      {
        day: 11,
        title: 'Perjalanan Madinah - Jeddah',
        activities: [
          'Check-out hotel Madinah',
          'Transfer ke Bandara King Abdulaziz Jeddah',
          'Penerbangan Jeddah - Jakarta',
        ],
      },
      {
        day: 12,
        title: 'Tiba di Jakarta',
        activities: [
          'Tiba di Bandara Soekarno-Hatta',
          'Penjemputan keluarga',
          'Selesai - Umrah Mabrur InsyaAllah',
        ],
      },
    ],
  },
  agency: {
    name: 'PT. Berkah Umrah Mandiri',
    phone: '+62215551234',
    whatsapp: '+6281300001111',
    address: 'Jl. Raya Pondok Gede No. 45, Bekasi, Jawa Barat 17411',
    logoEmoji: '🕌',
  },
  payments: [
    {
      id: 'pay-001',
      type: 'DP (Uang Muka)',
      amount: 10000000,
      date: '2025-12-01',
      method: 'Transfer Bank BCA',
    },
    {
      id: 'pay-002',
      type: 'Cicilan ke-1',
      amount: 8000000,
      date: '2026-01-05',
      method: 'Transfer Bank Mandiri',
    },
    {
      id: 'pay-003',
      type: 'Cicilan ke-2',
      amount: 8000000,
      date: '2026-02-01',
      method: 'Transfer Bank BCA',
    },
  ],
  documents: [
    { type: 'ktp', label: 'KTP', status: 'verified', required: true },
    { type: 'passport', label: 'Paspor', status: 'verified', required: true },
    { type: 'photo', label: 'Pas Foto 4x6', status: 'uploaded', required: true },
    { type: 'kk', label: 'Kartu Keluarga', status: 'verified', required: true },
    { type: 'vaccine', label: 'Sertifikat Vaksin Meningitis', status: 'missing', required: true },
    { type: 'akta', label: 'Akta Lahir / Ijazah', status: 'uploaded', required: true },
    { type: 'buku_nikah', label: 'Buku Nikah', status: 'missing', required: false },
    { type: 'surat_mahram', label: 'Surat Mahram', status: 'missing', required: false },
  ],
  totalPackagePrice: 35000000,
  totalPaid: 26000000,
  remainingBalance: 9000000,
};

const pilgrimDatabase: Record<string, PilgrimPortalData> = {
  'UMR-2026-0001': mockPilgrimData,
};

export function findByBookingCode(code: string): PilgrimPortalData | null {
  const normalized = code.trim().toUpperCase();
  return pilgrimDatabase[normalized] || null;
}

export { mockPilgrimData };
