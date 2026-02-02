import { Agency } from '@/types/agency';

export const mockAgencies: Agency[] = [
  {
    id: 'agency_001',
    name: 'Barokah Travel',
    legalName: 'PT. Barokah Perjalanan Wisata',
    tagline: 'Perjalanan Berkah, Ibadah Sempurna',
    description: 'Travel umrah terpercaya sejak 2010 dengan ribuan jemaah yang telah kami layani',

    ppiuNumber: 'PPIU/123/2023',
    ppiuIssueDate: '2023-01-15',
    ppiuExpiryDate: '2026-01-15',
    ppiuStatus: 'active',

    email: 'info@barokahtravel.co.id',
    phone: '021-5551234',
    whatsapp: '6281234567890',
    website: 'https://barokahtravel.co.id',

    address: 'Jl. Gatot Subroto No. 123, Lantai 5',
    city: 'Jakarta Selatan',
    province: 'DKI Jakarta',
    postalCode: '12930',

    bankAccounts: [
      {
        id: 'bank_001',
        bankName: 'Bank Central Asia',
        bankCode: '014',
        accountNumber: '1234567890',
        accountName: 'PT Barokah Perjalanan Wisata',
        isPrimary: true,
      },
      {
        id: 'bank_002',
        bankName: 'Bank Syariah Indonesia',
        bankCode: '451',
        accountNumber: '7654321098',
        accountName: 'PT Barokah Perjalanan Wisata',
        isPrimary: false,
      },
    ],

    contactPersons: [
      {
        id: 'cp_001',
        name: 'Haji Ahmad Hidayat',
        position: 'Direktur Utama',
        phone: '081234567890',
        email: 'ahmad@barokahtravel.co.id',
        isPrimary: true,
      },
      {
        id: 'cp_002',
        name: 'Siti Fatimah',
        position: 'Manager Operasional',
        phone: '081234567891',
        email: 'fatimah@barokahtravel.co.id',
        isPrimary: false,
      },
    ],

    documents: [
      {
        id: 'doc_001',
        type: 'ppiu_license',
        name: 'Izin PPIU',
        number: 'PPIU/123/2023',
        issueDate: '2023-01-15',
        expiryDate: '2026-01-15',
        status: 'valid',
      },
      {
        id: 'doc_002',
        type: 'siup',
        name: 'SIUP',
        number: 'SIUP/456/2023',
        issueDate: '2023-01-10',
        status: 'valid',
      },
    ],

    branding: {
      primaryColor: '#F60000',
      logoUrl: '/images/logo.svg',
      logoIconUrl: '/images/logo-icon.svg',
      logoWhiteUrl: '/images/logo-white.svg',
    },

    verificationCode: 'BRK2023XYZ',
    verificationUrl: 'https://gezma.id/verify/BRK2023XYZ',
    isVerified: true,

    settings: {
      currency: 'IDR',
      timezone: 'Asia/Jakarta',
      dateFormat: 'DD/MM/YYYY',
      language: 'id',
    },

    createdAt: '2023-01-01T00:00:00Z',
    updatedAt: '2024-01-15T00:00:00Z',
  },
];

// Default agency for demo
export const DEFAULT_AGENCY = mockAgencies[0];
