import { Trip } from '@/types/trip';

export const mockTrips: Trip[] = [
  {
    id: 'trip_001',
    name: 'Umrah Reguler - Maret 2026',
    packageId: 'pkg_001',
    packageName: 'Umrah Reguler 9 Hari',

    departureDate: '2026-03-15',
    returnDate: '2026-03-23',
    registrationCloseDate: '2026-03-01',

    capacity: 45,
    registeredCount: 32,
    confirmedCount: 28,

    status: 'preparing',

    flightInfo: {
      departureAirline: 'Saudi Arabian Airlines',
      departureFlightNo: 'SV 817',
      departureDate: '2026-03-15',
      departureTime: '23:00',
      departureAirport: 'CGK - Soekarno Hatta',
      departureTerminal: 'Terminal 3',

      returnAirline: 'Saudi Arabian Airlines',
      returnFlightNo: 'SV 816',
      returnDate: '2026-03-23',
      returnTime: '10:00',
      returnAirport: 'JED - King Abdulaziz',
    },

    manifest: [
      {
        pilgrimId: 'plg_001',
        pilgrimName: 'Ahmad Fauzi',
        pilgrimStatus: 'dp',
        documentsComplete: 1,
        documentsTotal: 4,
        roomNumber: '101',
        roomType: 'double',
        addedAt: '2024-01-12T00:00:00Z',
      },
      {
        pilgrimId: 'plg_002',
        pilgrimName: 'Siti Aminah',
        pilgrimStatus: 'lunas',
        documentsComplete: 4,
        documentsTotal: 4,
        roomNumber: '102',
        roomType: 'double',
        addedAt: '2024-01-05T00:00:00Z',
      },
      {
        pilgrimId: 'plg_004',
        pilgrimName: 'Fatimah Azzahra',
        pilgrimStatus: 'dokumen',
        documentsComplete: 3,
        documentsTotal: 4,
        roomNumber: '101',
        roomType: 'double',
        addedAt: '2024-01-12T00:00:00Z',
      },
      {
        pilgrimId: 'plg_005',
        pilgrimName: 'Hasan Ibrahim',
        pilgrimStatus: 'visa',
        documentsComplete: 4,
        documentsTotal: 4,
        roomNumber: '103',
        roomType: 'double',
        addedAt: '2024-01-08T00:00:00Z',
      },
      {
        pilgrimId: 'plg_010',
        pilgrimName: 'Nurhasanah',
        pilgrimStatus: 'visa',
        documentsComplete: 4,
        documentsTotal: 4,
        roomNumber: '103',
        roomType: 'double',
        addedAt: '2024-01-08T00:00:00Z',
      },
    ],

    roomAssignments: [
      {
        roomNumber: '101',
        roomType: 'double',
        hotel: 'makkah',
        pilgrims: [
          { pilgrimId: 'plg_001', pilgrimName: 'Ahmad Fauzi' },
          { pilgrimId: 'plg_004', pilgrimName: 'Fatimah Azzahra' },
        ],
      },
      {
        roomNumber: '102',
        roomType: 'double',
        hotel: 'makkah',
        pilgrims: [{ pilgrimId: 'plg_002', pilgrimName: 'Siti Aminah' }],
      },
      {
        roomNumber: '103',
        roomType: 'double',
        hotel: 'makkah',
        pilgrims: [
          { pilgrimId: 'plg_005', pilgrimName: 'Hasan Ibrahim' },
          { pilgrimId: 'plg_010', pilgrimName: 'Nurhasanah' },
        ],
      },
    ],

    checklist: {
      allPilgrimsConfirmed: false,
      manifestComplete: false,
      roomingListFinalized: false,
      flightTicketsIssued: true,
      hotelConfirmed: true,
      guideAssigned: true,
      guideName: 'Ustadz Hamzah Al-Madani',
      guidePhone: '+966501234567',
      insuranceProcessed: true,
      departureBriefingDone: false,
    },

    pricePerPerson: 25000000,

    notes: 'Trip untuk periode Maret 2026. Masih ada 13 seat tersedia.',

    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-28T00:00:00Z',
  },
  {
    id: 'trip_002',
    name: 'Umrah Reguler - April 2026',
    packageId: 'pkg_001',
    packageName: 'Umrah Reguler 9 Hari',

    departureDate: '2026-04-20',
    returnDate: '2026-04-28',
    registrationCloseDate: '2026-04-05',

    capacity: 45,
    registeredCount: 15,
    confirmedCount: 12,

    status: 'open',

    flightInfo: {
      departureAirline: 'Saudi Arabian Airlines',
      departureFlightNo: 'SV 817',
      departureDate: '2026-04-20',
      departureTime: '23:00',
      departureAirport: 'CGK - Soekarno Hatta',
      departureTerminal: 'Terminal 3',

      returnAirline: 'Saudi Arabian Airlines',
      returnFlightNo: 'SV 816',
      returnDate: '2026-04-28',
      returnTime: '10:00',
      returnAirport: 'JED - King Abdulaziz',
    },

    manifest: [
      {
        pilgrimId: 'plg_006',
        pilgrimName: 'Dewi Kartika',
        pilgrimStatus: 'ready',
        documentsComplete: 4,
        documentsTotal: 4,
        roomNumber: '201',
        addedAt: '2024-01-03T00:00:00Z',
      },
      {
        pilgrimId: 'plg_009',
        pilgrimName: 'Abdul Malik',
        pilgrimStatus: 'lunas',
        documentsComplete: 3,
        documentsTotal: 4,
        roomNumber: '202',
        addedAt: '2024-01-06T00:00:00Z',
      },
      {
        pilgrimId: 'plg_014',
        pilgrimName: 'Zahra Amalia',
        pilgrimStatus: 'ready',
        documentsComplete: 4,
        documentsTotal: 4,
        roomNumber: '201',
        addedAt: '2024-01-04T00:00:00Z',
      },
      {
        pilgrimId: 'plg_020',
        pilgrimName: 'Rahmawati',
        pilgrimStatus: 'ready',
        documentsComplete: 4,
        documentsTotal: 4,
        roomNumber: '203',
        addedAt: '2024-01-02T00:00:00Z',
      },
    ],

    roomAssignments: [
      {
        roomNumber: '201',
        roomType: 'double',
        hotel: 'makkah',
        pilgrims: [
          { pilgrimId: 'plg_006', pilgrimName: 'Dewi Kartika' },
          { pilgrimId: 'plg_014', pilgrimName: 'Zahra Amalia' },
        ],
      },
      {
        roomNumber: '202',
        roomType: 'single',
        hotel: 'makkah',
        pilgrims: [{ pilgrimId: 'plg_009', pilgrimName: 'Abdul Malik' }],
      },
      {
        roomNumber: '203',
        roomType: 'single',
        hotel: 'makkah',
        pilgrims: [{ pilgrimId: 'plg_020', pilgrimName: 'Rahmawati' }],
      },
    ],

    checklist: {
      allPilgrimsConfirmed: false,
      manifestComplete: false,
      roomingListFinalized: false,
      flightTicketsIssued: true,
      hotelConfirmed: true,
      guideAssigned: false,
      insuranceProcessed: false,
      departureBriefingDone: false,
    },

    pricePerPerson: 25000000,

    notes: 'Pendaftaran masih dibuka. Tersisa 30 seat.',

    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-25T00:00:00Z',
  },
  {
    id: 'trip_003',
    name: 'Umrah Reguler - Mei 2026',
    packageId: 'pkg_001',
    packageName: 'Umrah Reguler 9 Hari',

    departureDate: '2026-05-10',
    returnDate: '2026-05-18',
    registrationCloseDate: '2026-04-25',

    capacity: 45,
    registeredCount: 8,
    confirmedCount: 5,

    status: 'open',

    flightInfo: {
      departureAirline: 'Saudi Arabian Airlines',
      departureFlightNo: 'SV 817',
      departureDate: '2026-05-10',
      departureTime: '23:00',
      departureAirport: 'CGK - Soekarno Hatta',
      departureTerminal: 'Terminal 3',

      returnAirline: 'Saudi Arabian Airlines',
      returnFlightNo: 'SV 816',
      returnDate: '2026-05-18',
      returnTime: '10:00',
      returnAirport: 'JED - King Abdulaziz',
    },

    manifest: [
      {
        pilgrimId: 'plg_017',
        pilgrimName: 'Karim Abdullah',
        pilgrimStatus: 'lunas',
        documentsComplete: 3,
        documentsTotal: 4,
        addedAt: '2024-01-07T00:00:00Z',
      },
      {
        pilgrimId: 'plg_018',
        pilgrimName: 'Latifah Husna',
        pilgrimStatus: 'dokumen',
        documentsComplete: 3,
        documentsTotal: 4,
        addedAt: '2024-01-13T00:00:00Z',
      },
      {
        pilgrimId: 'plg_019',
        pilgrimName: 'Nasir Udin',
        pilgrimStatus: 'visa',
        documentsComplete: 4,
        documentsTotal: 4,
        addedAt: '2024-01-09T00:00:00Z',
      },
    ],

    roomAssignments: [],

    checklist: {
      allPilgrimsConfirmed: false,
      manifestComplete: false,
      roomingListFinalized: false,
      flightTicketsIssued: false,
      hotelConfirmed: true,
      guideAssigned: false,
      insuranceProcessed: false,
      departureBriefingDone: false,
    },

    pricePerPerson: 25000000,

    notes: 'Pendaftaran baru dibuka. Masih banyak seat tersedia.',

    createdAt: '2024-01-01T00:00:00Z',
    updatedAt: '2024-01-20T00:00:00Z',
  },
  {
    id: 'trip_004',
    name: 'Umrah Ramadhan - Februari 2026',
    packageId: 'pkg_003',
    packageName: 'Umrah Ramadhan 14 Hari',

    departureDate: '2026-02-25',
    returnDate: '2026-03-10',
    registrationCloseDate: '2026-02-10',

    capacity: 40,
    registeredCount: 38,
    confirmedCount: 35,

    status: 'ready',

    flightInfo: {
      departureAirline: 'Saudia',
      departureFlightNo: 'SV 819',
      departureDate: '2026-02-25',
      departureTime: '22:00',
      departureAirport: 'CGK - Soekarno Hatta',
      departureTerminal: 'Terminal 3',

      returnAirline: 'Saudia',
      returnFlightNo: 'SV 818',
      returnDate: '2026-03-10',
      returnTime: '11:00',
      returnAirport: 'JED - King Abdulaziz',
    },

    manifest: [],

    roomAssignments: [],

    checklist: {
      allPilgrimsConfirmed: true,
      manifestComplete: true,
      roomingListFinalized: true,
      flightTicketsIssued: true,
      hotelConfirmed: true,
      guideAssigned: true,
      guideName: 'Ustadz Wahyu Ramadhan',
      guidePhone: '+966507654321',
      insuranceProcessed: true,
      departureBriefingDone: true,
      departureBriefingDate: '2026-02-20',
    },

    pricePerPerson: 36500000,

    notes: 'Trip Ramadhan - Semua persiapan sudah complete. Ready to depart.',

    createdAt: '2023-12-01T00:00:00Z',
    updatedAt: '2024-02-01T00:00:00Z',
  },
  {
    id: 'trip_005',
    name: 'Umrah VIP - Januari 2026',
    packageId: 'pkg_004',
    packageName: 'Umrah VIP Executive 9 Hari',

    departureDate: '2026-01-10',
    returnDate: '2026-01-18',
    registrationCloseDate: '2025-12-25',

    capacity: 20,
    registeredCount: 20,
    confirmedCount: 20,

    status: 'completed',

    flightInfo: {
      departureAirline: 'Emirates',
      departureFlightNo: 'EK 358',
      departureDate: '2026-01-10',
      departureTime: '20:00',
      departureAirport: 'CGK - Soekarno Hatta',
      departureTerminal: 'Terminal 3',

      returnAirline: 'Emirates',
      returnFlightNo: 'EK 357',
      returnDate: '2026-01-18',
      returnTime: '08:00',
      returnAirport: 'JED - King Abdulaziz',
    },

    manifest: [],

    roomAssignments: [],

    checklist: {
      allPilgrimsConfirmed: true,
      manifestComplete: true,
      roomingListFinalized: true,
      flightTicketsIssued: true,
      hotelConfirmed: true,
      guideAssigned: true,
      guideName: 'Ustadz Ali bin Umar',
      guidePhone: '+966509876543',
      insuranceProcessed: true,
      departureBriefingDone: true,
      departureBriefingDate: '2026-01-05',
    },

    pricePerPerson: 37500000,

    notes: 'Trip sudah selesai. Semua jamaah telah kembali dengan selamat. Alhamdulillah.',

    createdAt: '2023-11-01T00:00:00Z',
    updatedAt: '2026-01-19T00:00:00Z',
  },
];
