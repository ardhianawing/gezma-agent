export interface MockTrip {
  id: string;
  name: string;
  departureDate: string;
  returnDate: string;
  capacity: number;
  registeredCount: number;
  confirmedCount: number;
  status: 'open' | 'preparing' | 'ready' | 'completed' | 'cancelled';
  hotel: string;
  airline: string;
  muthawwifName: string;
  muthawwifPhone: string;
  flightInfo: { departure: string; arrival: string; flightNo: string };
  packageId: string;
  registrationCloseDate: string | null;
  checklist: Record<string, boolean>;
  createdAt: string;
}

export const mockTrips: MockTrip[] = [
  {
    id: 'trip-001',
    name: 'Umrah Reguler Maret 2026',
    departureDate: '2026-03-15',
    returnDate: '2026-03-28',
    capacity: 45,
    registeredCount: 4,
    confirmedCount: 2,
    status: 'preparing',
    hotel: 'Hilton Suites Makkah / Oberoi Madinah',
    airline: 'Saudi Airlines',
    muthawwifName: 'Ustadz Abdurrahman',
    muthawwifPhone: '+966501234567',
    flightInfo: {
      departure: 'CGK 22:00 → JED 04:00+1 (SV817)',
      arrival: 'JED 10:00 → CGK 23:00 (SV816)',
      flightNo: 'SV817',
    },
    packageId: 'pkg-001',
    registrationCloseDate: '2026-02-28',
    checklist: {
      allPilgrimsConfirmed: false,
      manifestComplete: false,
      roomingListFinalized: true,
      flightTicketsIssued: true,
      hotelConfirmed: true,
      guideAssigned: true,
      insuranceProcessed: false,
      departureBriefingDone: false,
    },
    createdAt: '2025-09-01',
  },
  {
    id: 'trip-002',
    name: 'Umrah VIP April 2026',
    departureDate: '2026-04-10',
    returnDate: '2026-04-22',
    capacity: 20,
    registeredCount: 3,
    confirmedCount: 1,
    status: 'open',
    hotel: 'Raffles Makkah Palace / The Ritz-Carlton Madinah',
    airline: 'Garuda Indonesia',
    muthawwifName: 'Ustadz Dr. Mahmud Al-Farisi',
    muthawwifPhone: '+966509876543',
    flightInfo: {
      departure: 'CGK 10:00 → JED 16:00 (GA990)',
      arrival: 'JED 18:00 → CGK 07:00+1 (GA991)',
      flightNo: 'GA990',
    },
    packageId: 'pkg-002',
    registrationCloseDate: '2026-03-25',
    checklist: {
      allPilgrimsConfirmed: false,
      manifestComplete: false,
      roomingListFinalized: false,
      flightTicketsIssued: false,
      hotelConfirmed: true,
      guideAssigned: true,
      insuranceProcessed: false,
      departureBriefingDone: false,
    },
    createdAt: '2025-10-15',
  },
  {
    id: 'trip-003',
    name: 'Umrah Ramadhan 2026',
    departureDate: '2026-03-01',
    returnDate: '2026-03-15',
    capacity: 40,
    registeredCount: 3,
    confirmedCount: 1,
    status: 'preparing',
    hotel: 'Swissotel Al Maqam Makkah / Pullman Zamzam Madinah',
    airline: 'Saudi Airlines',
    muthawwifName: 'Ustadz Hasan Basri',
    muthawwifPhone: '+966505551234',
    flightInfo: {
      departure: 'CGK 20:00 → JED 02:00+1 (SV821)',
      arrival: 'JED 08:00 → CGK 21:00 (SV820)',
      flightNo: 'SV821',
    },
    packageId: 'pkg-004',
    registrationCloseDate: '2026-02-15',
    checklist: {
      allPilgrimsConfirmed: false,
      manifestComplete: false,
      roomingListFinalized: false,
      flightTicketsIssued: true,
      hotelConfirmed: true,
      guideAssigned: true,
      insuranceProcessed: true,
      departureBriefingDone: false,
    },
    createdAt: '2025-09-20',
  },
  {
    id: 'trip-004',
    name: 'Umrah Ekonomi Mei 2026',
    departureDate: '2026-05-05',
    returnDate: '2026-05-14',
    capacity: 50,
    registeredCount: 3,
    confirmedCount: 1,
    status: 'open',
    hotel: 'Al Marwa Rayhaan Makkah / Dallah Taibah Madinah',
    airline: 'Lion Air',
    muthawwifName: 'Ustadz Farid Maulana',
    muthawwifPhone: '+966507778899',
    flightInfo: {
      departure: 'CGK 23:30 → JED 05:30+1 (JT1880)',
      arrival: 'JED 12:00 → CGK 01:00+1 (JT1881)',
      flightNo: 'JT1880',
    },
    packageId: 'pkg-003',
    registrationCloseDate: '2026-04-20',
    checklist: {
      allPilgrimsConfirmed: false,
      manifestComplete: false,
      roomingListFinalized: false,
      flightTicketsIssued: false,
      hotelConfirmed: false,
      guideAssigned: true,
      insuranceProcessed: false,
      departureBriefingDone: false,
    },
    createdAt: '2025-11-01',
  },
  {
    id: 'trip-005',
    name: 'Umrah Reguler Juni 2026',
    departureDate: '2025-06-10',
    returnDate: '2025-06-23',
    capacity: 45,
    registeredCount: 3,
    confirmedCount: 3,
    status: 'completed',
    hotel: 'Hilton Suites Makkah / Oberoi Madinah',
    airline: 'Saudi Airlines',
    muthawwifName: 'Ustadz Abdurrahman',
    muthawwifPhone: '+966501234567',
    flightInfo: {
      departure: 'CGK 22:00 → JED 04:00+1 (SV817)',
      arrival: 'JED 10:00 → CGK 23:00 (SV816)',
      flightNo: 'SV817',
    },
    packageId: 'pkg-001',
    registrationCloseDate: '2025-05-25',
    checklist: {
      allPilgrimsConfirmed: true,
      manifestComplete: true,
      roomingListFinalized: true,
      flightTicketsIssued: true,
      hotelConfirmed: true,
      guideAssigned: true,
      insuranceProcessed: true,
      departureBriefingDone: true,
    },
    createdAt: '2025-01-15',
  },
];
