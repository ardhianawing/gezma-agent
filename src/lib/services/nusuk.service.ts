// Nusuk API Integration Service
// Provides hotel search, visa management, and inventory sync
// Currently returns mock data — will be replaced with real Nusuk API calls

export interface NusukHotel {
  id: string;
  name: string;
  city: 'makkah' | 'madinah';
  rating: number;
  distanceToHaram: string;
  pricePerNight: number;
  currency: string;
  available: boolean;
  thumbnail: string;
}

export interface NusukVisaStatus {
  pilgrimId: string;
  status: 'not_submitted' | 'submitted' | 'processing' | 'approved' | 'rejected';
  submittedAt: string | null;
  approvedAt: string | null;
  visaNumber: string | null;
  expiryDate: string | null;
  notes: string | null;
}

export interface NusukConfig {
  isEnabled: boolean;
  apiKey: string | null;
  baseUrl: string;
  lastSyncAt: string | null;
  syncStatus: 'idle' | 'syncing' | 'error' | 'success';
}

// In-memory store for mock config per agency
const configStore: Record<string, NusukConfig> = {};

export async function getNusukConfig(agencyId: string): Promise<NusukConfig> {
  // TODO: Replace with real Nusuk API call
  if (configStore[agencyId]) {
    return configStore[agencyId];
  }

  return {
    isEnabled: false,
    apiKey: null,
    baseUrl: 'https://api.nusuk.sa/v1',
    lastSyncAt: null,
    syncStatus: 'idle',
  };
}

export async function updateNusukConfig(
  agencyId: string,
  updates: Partial<Pick<NusukConfig, 'isEnabled' | 'apiKey' | 'baseUrl'>>
): Promise<NusukConfig> {
  // TODO: Replace with real Nusuk API call
  const current = await getNusukConfig(agencyId);

  const updated: NusukConfig = {
    ...current,
    ...updates,
  };

  configStore[agencyId] = updated;
  return updated;
}

const MOCK_HOTELS_MAKKAH: NusukHotel[] = [
  {
    id: 'htl-mk-001',
    name: 'Hilton Suites Makkah',
    city: 'makkah',
    rating: 5,
    distanceToHaram: '150m',
    pricePerNight: 450,
    currency: 'SAR',
    available: true,
    thumbnail: '\u{1f3e8}',
  },
  {
    id: 'htl-mk-002',
    name: 'Swissotel Al Maqam',
    city: 'makkah',
    rating: 5,
    distanceToHaram: '50m',
    pricePerNight: 800,
    currency: 'SAR',
    available: true,
    thumbnail: '\u{2b50}',
  },
  {
    id: 'htl-mk-003',
    name: 'Pullman ZamZam Makkah',
    city: 'makkah',
    rating: 5,
    distanceToHaram: '100m',
    pricePerNight: 650,
    currency: 'SAR',
    available: true,
    thumbnail: '\u{1f3e8}',
  },
  {
    id: 'htl-mk-004',
    name: 'Le Meridien Makkah',
    city: 'makkah',
    rating: 4,
    distanceToHaram: '500m',
    pricePerNight: 280,
    currency: 'SAR',
    available: true,
    thumbnail: '\u{1f3e2}',
  },
  {
    id: 'htl-mk-005',
    name: 'Al Shohada Hotel',
    city: 'makkah',
    rating: 3,
    distanceToHaram: '800m',
    pricePerNight: 150,
    currency: 'SAR',
    available: false,
    thumbnail: '\u{1f3e0}',
  },
];

const MOCK_HOTELS_MADINAH: NusukHotel[] = [
  {
    id: 'htl-md-001',
    name: 'The Oberoi Madinah',
    city: 'madinah',
    rating: 5,
    distanceToHaram: '200m',
    pricePerNight: 520,
    currency: 'SAR',
    available: true,
    thumbnail: '\u{2b50}',
  },
  {
    id: 'htl-md-002',
    name: 'Crowne Plaza Madinah',
    city: 'madinah',
    rating: 4,
    distanceToHaram: '350m',
    pricePerNight: 320,
    currency: 'SAR',
    available: true,
    thumbnail: '\u{1f3e8}',
  },
  {
    id: 'htl-md-003',
    name: 'Shaza Al Madina',
    city: 'madinah',
    rating: 5,
    distanceToHaram: '100m',
    pricePerNight: 600,
    currency: 'SAR',
    available: true,
    thumbnail: '\u{1f3e8}',
  },
  {
    id: 'htl-md-004',
    name: 'Dar Al Taqwa Hotel',
    city: 'madinah',
    rating: 4,
    distanceToHaram: '50m',
    pricePerNight: 380,
    currency: 'SAR',
    available: true,
    thumbnail: '\u{1f3e2}',
  },
  {
    id: 'htl-md-005',
    name: 'Al Eiman Royal Hotel',
    city: 'madinah',
    rating: 3,
    distanceToHaram: '1.2km',
    pricePerNight: 120,
    currency: 'SAR',
    available: false,
    thumbnail: '\u{1f3e0}',
  },
];

export async function searchHotels(params: {
  city: string;
  checkIn: string;
  checkOut: string;
  agencyId: string;
}): Promise<NusukHotel[]> {
  // TODO: Replace with real Nusuk API call
  // params.checkIn and params.checkOut would be used for availability filtering
  // params.agencyId would be used for agency-specific pricing/contracts

  const { city } = params;

  if (city === 'madinah') {
    return MOCK_HOTELS_MADINAH;
  }

  return MOCK_HOTELS_MAKKAH;
}

export async function getVisaStatus(pilgrimId: string, agencyId: string): Promise<NusukVisaStatus> {
  // TODO: Replace with real Nusuk API call
  // agencyId would be used for multi-tenant access control
  void agencyId;

  // Return a mock status based on pilgrimId hash for consistent results
  const hash = pilgrimId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  const statuses: NusukVisaStatus['status'][] = ['not_submitted', 'submitted', 'processing', 'approved', 'rejected'];
  const statusIndex = hash % statuses.length;
  const status = statuses[statusIndex];

  const baseResult: NusukVisaStatus = {
    pilgrimId,
    status,
    submittedAt: null,
    approvedAt: null,
    visaNumber: null,
    expiryDate: null,
    notes: null,
  };

  if (status === 'submitted' || status === 'processing') {
    baseResult.submittedAt = '2026-02-15T10:30:00Z';
  }

  if (status === 'approved') {
    baseResult.submittedAt = '2026-02-10T08:00:00Z';
    baseResult.approvedAt = '2026-02-18T14:22:00Z';
    baseResult.visaNumber = `VSA-${pilgrimId.slice(0, 8).toUpperCase()}`;
    baseResult.expiryDate = '2026-06-15';
  }

  if (status === 'rejected') {
    baseResult.submittedAt = '2026-02-12T09:15:00Z';
    baseResult.notes = 'Dokumen tidak lengkap. Silakan lengkapi paspor dan foto terbaru.';
  }

  return baseResult;
}

export async function submitVisa(pilgrimId: string, agencyId: string): Promise<NusukVisaStatus> {
  // TODO: Replace with real Nusuk API call
  void agencyId;

  return {
    pilgrimId,
    status: 'submitted',
    submittedAt: new Date().toISOString(),
    approvedAt: null,
    visaNumber: null,
    expiryDate: null,
    notes: 'Permohonan visa telah dikirim ke sistem Nusuk.',
  };
}

export async function syncInventory(agencyId: string): Promise<{ synced: number; errors: number }> {
  // TODO: Replace with real Nusuk API call
  void agencyId;

  // Simulate a sync delay
  await new Promise((resolve) => setTimeout(resolve, 500));

  return {
    synced: 42,
    errors: 0,
  };
}
