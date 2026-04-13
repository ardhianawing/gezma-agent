import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

const mockPackages = [
  {
    id: 'pkg-001',
    name: 'Paket Umrah Reguler',
    slug: 'paket-umrah-reguler',
    category: 'reguler',
    description: 'Paket umrah reguler dengan fasilitas lengkap dan harga terjangkau. Cocok untuk jemaah yang ingin ibadah umrah dengan nyaman.',
    duration: 12,
    airline: 'Saudi Airlines',
    publishedPrice: 28000000,
    totalHpp: 23000000,
    margin: 22,
    marginAmount: 5000000,
    makkahHotel: 'Hilton Suites Makkah',
    makkahHotelRating: 4,
    makkahHotelDistance: '500m dari Masjidil Haram',
    madinahHotel: 'Oberoi Madinah',
    madinahHotelRating: 4,
    madinahHotelDistance: '300m dari Masjid Nabawi',
    inclusions: [
      'Tiket pesawat PP',
      'Hotel Makkah 5 malam',
      'Hotel Madinah 4 malam',
      'Transportasi AC',
      'Muthawwif berpengalaman',
      'Visa umrah',
      'Makan 3x sehari (catering)',
      'Ziarah kota Makkah & Madinah',
      'Air zamzam 5 liter',
      'Asuransi perjalanan',
    ],
    exclusions: [
      'Paspor (biaya pembuatan sendiri)',
      'Kelebihan bagasi',
      'Pengeluaran pribadi',
      'Tips guide lokal',
    ],
    features: [
      'Hotel bintang 4',
      'Makan 3x sehari',
      'Ziarah lengkap',
      'Muthawwif berpengalaman',
      'Asuransi perjalanan',
    ],
    isActive: true,
    createdAt: '2025-01-01',
    _source: 'mock' as const,
  },
  {
    id: 'pkg-002',
    name: 'Paket Umrah VIP',
    slug: 'paket-umrah-vip',
    category: 'vip',
    description: 'Paket umrah VIP dengan hotel bintang 5, kamar lebih luas, dan pelayanan eksklusif. Pengalaman ibadah yang premium.',
    duration: 12,
    airline: 'Garuda Indonesia',
    publishedPrice: 45000000,
    totalHpp: 36000000,
    margin: 25,
    marginAmount: 9000000,
    makkahHotel: 'Raffles Makkah Palace',
    makkahHotelRating: 5,
    makkahHotelDistance: '200m dari Masjidil Haram',
    madinahHotel: 'The Ritz-Carlton Madinah',
    madinahHotelRating: 5,
    madinahHotelDistance: '150m dari Masjid Nabawi',
    inclusions: [
      'Tiket pesawat PP (Garuda Indonesia)',
      'Hotel bintang 5 Makkah 5 malam',
      'Hotel bintang 5 Madinah 4 malam',
      'Transportasi VIP',
      'Muthawwif senior',
      'Visa umrah',
      'Makan 3x sehari (buffet hotel)',
      'Ziarah eksklusif Makkah & Madinah',
      'Air zamzam 10 liter',
      'Asuransi premium',
      'Handling bandara VIP',
      'Koper umrah eksklusif',
    ],
    exclusions: [
      'Paspor (biaya pembuatan sendiri)',
      'Kelebihan bagasi',
      'Pengeluaran pribadi',
    ],
    features: [
      'Hotel bintang 5 dekat Haram',
      'Garuda Indonesia direct flight',
      'Makan buffet hotel',
      'VIP handling bandara',
      'Muthawwif senior bersertifikat',
      'Koper eksklusif',
    ],
    isActive: true,
    createdAt: '2025-01-01',
    _source: 'mock' as const,
  },
  {
    id: 'pkg-003',
    name: 'Paket Umrah Ekonomi',
    slug: 'paket-umrah-ekonomi',
    category: 'ekonomi',
    description: 'Paket umrah hemat dengan fasilitas standar namun tetap nyaman. Pilihan tepat untuk jemaah dengan budget terbatas.',
    duration: 9,
    airline: 'Lion Air',
    publishedPrice: 22000000,
    totalHpp: 18000000,
    margin: 22,
    marginAmount: 4000000,
    makkahHotel: 'Al Marwa Rayhaan Makkah',
    makkahHotelRating: 3,
    makkahHotelDistance: '800m dari Masjidil Haram',
    madinahHotel: 'Dallah Taibah Madinah',
    madinahHotelRating: 3,
    madinahHotelDistance: '600m dari Masjid Nabawi',
    inclusions: [
      'Tiket pesawat PP',
      'Hotel Makkah 4 malam',
      'Hotel Madinah 3 malam',
      'Transportasi AC',
      'Muthawwif',
      'Visa umrah',
      'Makan 3x sehari (catering)',
      'Ziarah standar',
      'Air zamzam 5 liter',
    ],
    exclusions: [
      'Paspor (biaya pembuatan sendiri)',
      'Kelebihan bagasi',
      'Pengeluaran pribadi',
      'Asuransi perjalanan',
      'Tips guide lokal',
    ],
    features: [
      'Hotel bintang 3',
      'Harga paling terjangkau',
      'Durasi 9 hari',
      'Makan 3x sehari',
      'Cocok untuk budget terbatas',
    ],
    isActive: true,
    createdAt: '2025-01-01',
    _source: 'mock' as const,
  },
  {
    id: 'pkg-004',
    name: 'Paket Umrah Ramadhan',
    slug: 'paket-umrah-ramadhan',
    category: 'seasonal',
    description: 'Paket umrah spesial di bulan Ramadhan. Rasakan kekhusyukan ibadah di Tanah Suci saat bulan penuh berkah.',
    duration: 14,
    airline: 'Saudi Airlines',
    publishedPrice: 35000000,
    totalHpp: 28000000,
    margin: 25,
    marginAmount: 7000000,
    makkahHotel: 'Swissotel Al Maqam Makkah',
    makkahHotelRating: 5,
    makkahHotelDistance: '100m dari Masjidil Haram',
    madinahHotel: 'Pullman Zamzam Madinah',
    madinahHotelRating: 5,
    madinahHotelDistance: '200m dari Masjid Nabawi',
    inclusions: [
      'Tiket pesawat PP',
      'Hotel bintang 5 Makkah 7 malam',
      'Hotel bintang 5 Madinah 5 malam',
      'Transportasi AC',
      'Muthawwif berpengalaman',
      'Visa umrah',
      'Makan sahur & buka puasa',
      'Ziarah lengkap Makkah & Madinah',
      'Air zamzam 10 liter',
      'Asuransi perjalanan',
      'Perlengkapan umrah Ramadhan',
    ],
    exclusions: [
      'Paspor (biaya pembuatan sendiri)',
      'Kelebihan bagasi',
      'Pengeluaran pribadi',
    ],
    features: [
      'Hotel bintang 5 sangat dekat Haram',
      'Durasi 14 hari di bulan Ramadhan',
      'Menu sahur & buka puasa',
      'I\'tikaf di Masjidil Haram',
      'Pengalaman Ramadhan di Tanah Suci',
    ],
    isActive: true,
    createdAt: '2025-01-01',
    _source: 'mock' as const,
  },
  {
    id: 'pkg-005',
    name: 'Paket Umrah Plus Turki',
    slug: 'paket-umrah-plus-turki',
    category: 'plus',
    description: 'Paket umrah dengan tambahan wisata ke Turki (Istanbul). Kombinasi ibadah dan wisata sejarah Islam di dua negara.',
    duration: 15,
    airline: 'Turkish Airlines',
    publishedPrice: 55000000,
    totalHpp: 44000000,
    margin: 25,
    marginAmount: 11000000,
    makkahHotel: 'Hilton Suites Makkah',
    makkahHotelRating: 4,
    makkahHotelDistance: '500m dari Masjidil Haram',
    madinahHotel: 'Oberoi Madinah',
    madinahHotelRating: 4,
    madinahHotelDistance: '300m dari Masjid Nabawi',
    inclusions: [
      'Tiket pesawat PP via Istanbul (Turkish Airlines)',
      'Hotel Makkah 4 malam',
      'Hotel Madinah 3 malam',
      'Hotel Istanbul 3 malam (bintang 4)',
      'Transportasi AC',
      'Muthawwif & guide lokal Turki',
      'Visa umrah & visa Turki',
      'Makan 3x sehari',
      'City tour Istanbul (Hagia Sophia, Blue Mosque, Grand Bazaar, Topkapi Palace)',
      'Bosphorus cruise',
      'Air zamzam 5 liter',
      'Asuransi perjalanan internasional',
    ],
    exclusions: [
      'Paspor (biaya pembuatan sendiri)',
      'Kelebihan bagasi',
      'Pengeluaran pribadi',
      'Tiket masuk atraksi tambahan di Istanbul',
    ],
    features: [
      'Turkish Airlines transit Istanbul',
      'City tour Istanbul 3 hari',
      'Hagia Sophia & Blue Mosque',
      'Bosphorus cruise',
      'Dua negara dalam satu perjalanan',
      'Durasi 15 hari',
    ],
    isActive: true,
    createdAt: '2025-01-01',
    _source: 'mock' as const,
  },
];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const category = searchParams.get('category') || '';
  const isActive = searchParams.get('isActive');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let filtered: any[] = [...mockPackages];

  // Hybrid: try DB first, merge with mock
  try {
    const dbPackages = await prisma.package.findMany({
      where: { deletedAt: null, isActive: true },
      orderBy: { createdAt: 'desc' },
    });
    const dbMapped = dbPackages.map(p => ({ ...p, _source: 'db' as const }));
    filtered = [...dbMapped, ...mockPackages];
  } catch {
    // DB unavailable, use mock only
    filtered = [...mockPackages];
  }

  if (category) {
    filtered = filtered.filter((p) => p.category === category);
  }

  if (isActive !== null && isActive !== '') {
    filtered = filtered.filter((p) => p.isActive === (isActive === 'true'));
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }

  return NextResponse.json({ data: filtered });
}

export async function POST(req: NextRequest) {
  const auth = getAuthPayload(req); if (!auth) return unauthorizedResponse();
  try {
    const body = await req.json();

    // Validate required fields
    if (!body.name || !body.category || !body.duration || !body.publishedPrice) {
      return NextResponse.json(
        { error: 'Field name, category, duration, dan publishedPrice wajib diisi' },
        { status: 400 }
      );
    }

    const slug = (body.name || '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');

    // Hybrid: try DB first, mock fallback
    try {
      const dbPackage = await prisma.package.create({
        data: {
          name: body.name,
          slug,
          category: body.category,
          description: body.description || '',
          duration: body.duration,
          airline: body.airline || '',
          publishedPrice: body.publishedPrice,
          totalHpp: body.totalHpp || 0,
          margin: body.margin || 0,
          marginAmount: body.marginAmount || 0,
          makkahHotel: body.makkahHotel || '',
          makkahHotelRating: body.makkahHotelRating || 0,
          makkahHotelDistance: body.makkahHotelDistance || '',
          madinahHotel: body.madinahHotel || '',
          madinahHotelRating: body.madinahHotelRating || 0,
          madinahHotelDistance: body.madinahHotelDistance || '',
          inclusions: body.inclusions || [],
          exclusions: body.exclusions || [],
          hpp: body.hpp || {},
          isActive: body.isActive ?? true,
          agencyId: auth.agencyId,
        },
      });

      return NextResponse.json({ ...dbPackage, _source: 'db' }, { status: 201 });
    } catch (dbError) {
      // DB failed, fallback to mock response
      console.error('[packages POST] DB error, falling back to mock:', dbError);
      const newPackage = {
        id: `pkg-${Date.now()}`,
        name: body.name || '',
        slug,
        category: body.category || 'reguler',
        description: body.description || '',
        duration: body.duration || 12,
        airline: body.airline || '',
        publishedPrice: body.publishedPrice || 0,
        totalHpp: body.totalHpp || 0,
        margin: body.margin || 0,
        marginAmount: body.marginAmount || 0,
        makkahHotel: body.makkahHotel || '',
        makkahHotelRating: body.makkahHotelRating || 0,
        makkahHotelDistance: body.makkahHotelDistance || '',
        madinahHotel: body.madinahHotel || '',
        madinahHotelRating: body.madinahHotelRating || 0,
        madinahHotelDistance: body.madinahHotelDistance || '',
        inclusions: body.inclusions || [],
        exclusions: body.exclusions || [],
        features: body.features || [],
        isActive: body.isActive ?? true,
        createdAt: new Date().toISOString().split('T')[0],
        _source: 'mock' as const,
      };

      return NextResponse.json(newPackage, { status: 201 });
    }
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
