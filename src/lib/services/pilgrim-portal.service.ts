import { prisma } from '@/lib/prisma';
import type { PilgrimPortalData } from '@/data/mock-pilgrim-portal';

// Document type → label mapping
const DOCUMENT_LABELS: Record<string, string> = {
  ktp: 'KTP',
  passport: 'Paspor',
  photo: 'Pas Foto 4x6',
  visa: 'Visa',
  health_cert: 'Sertifikat Kesehatan',
  book_nikah: 'Buku Nikah',
  kk: 'Kartu Keluarga',
  vaccine: 'Sertifikat Vaksin Meningitis',
  akta: 'Akta Lahir / Ijazah',
  surat_mahram: 'Surat Mahram',
};

// Required document types
const REQUIRED_DOCS = ['ktp', 'passport', 'photo', 'kk', 'vaccine', 'akta'];

// All expected document types for a pilgrim
const ALL_DOC_TYPES = ['ktp', 'passport', 'photo', 'kk', 'vaccine', 'akta', 'book_nikah', 'surat_mahram'];

export async function getPilgrimPortalData(pilgrimId: string): Promise<PilgrimPortalData | null> {
  const pilgrim = await prisma.pilgrim.findUnique({
    where: { id: pilgrimId },
    include: {
      documents: true,
      payments: { orderBy: { date: 'asc' } },
      agency: true,
    },
  });

  if (!pilgrim) return null;

  // Fetch trip + package if assigned
  let trip = null;
  let pkg = null;
  if (pilgrim.tripId) {
    trip = await prisma.trip.findUnique({ where: { id: pilgrim.tripId } });
    if (trip?.packageId) {
      pkg = await prisma.package.findUnique({ where: { id: trip.packageId } });
    }
  }

  return transformToPilgrimPortalData(pilgrim, trip, pkg);
}

function transformToPilgrimPortalData(
  pilgrim: Awaited<ReturnType<typeof fetchPilgrimFull>>,
  trip: TripRow | null,
  pkg: PackageRow | null,
): PilgrimPortalData {
  const agency = pilgrim.agency;
  const totalPackagePrice = pkg?.publishedPrice ?? 0;
  const totalPaid = pilgrim.totalPaid;
  const remainingBalance = pilgrim.remainingBalance;

  // Build itinerary from package JSON
  const itinerary = Array.isArray(pkg?.itinerary) ? (pkg.itinerary as ItineraryDay[]) : [];

  // Build documents list — merge existing docs with expected types
  const existingDocs = new Map(pilgrim.documents.map(d => [d.type, d]));
  const documents = ALL_DOC_TYPES.map(type => {
    const doc = existingDocs.get(type);
    return {
      type,
      label: DOCUMENT_LABELS[type] || type,
      status: doc?.status ?? 'missing',
      required: REQUIRED_DOCS.includes(type),
      fileUrl: doc?.fileUrl ?? undefined,
      fileName: doc?.fileName ?? undefined,
    };
  });

  return {
    pilgrim: {
      id: pilgrim.id,
      name: pilgrim.name,
      nik: pilgrim.nik,
      phone: pilgrim.phone,
      email: pilgrim.email,
      gender: pilgrim.gender,
      birthDate: pilgrim.birthDate,
      birthPlace: pilgrim.birthPlace,
      address: pilgrim.address,
      city: pilgrim.city,
      province: pilgrim.province,
      status: pilgrim.status,
      bookingCode: pilgrim.bookingCode ?? '',
      roomNumber: pilgrim.roomNumber,
      roomType: pilgrim.roomType,
    },
    trip: {
      id: trip?.id ?? '',
      name: trip?.name ?? 'Belum ditentukan',
      packageName: pkg?.name ?? 'Belum ditentukan',
      departureDate: trip?.departureDate?.toISOString().split('T')[0] ?? '',
      returnDate: trip?.returnDate?.toISOString().split('T')[0] ?? '',
      airline: pkg?.airline ?? '',
      muthawwifName: trip?.muthawwifName ?? '',
      muthawwifPhone: trip?.muthawwifPhone ?? '',
      status: trip?.status ?? 'pending',
      makkahHotel: pkg?.makkahHotel ?? '',
      makkahHotelRating: pkg?.makkahHotelRating ?? 0,
      makkahHotelDistance: pkg?.makkahHotelDistance ?? '',
      madinahHotel: pkg?.madinahHotel ?? '',
      madinahHotelRating: pkg?.madinahHotelRating ?? 0,
      madinahHotelDistance: pkg?.madinahHotelDistance ?? '',
      itinerary,
    },
    agency: {
      name: agency.name,
      phone: agency.phone,
      whatsapp: agency.whatsapp ?? agency.phone,
      address: agency.address ?? '',
      logoEmoji: '\u{1F54B}',
    },
    payments: pilgrim.payments.map(p => ({
      id: p.id,
      type: p.type,
      amount: p.amount,
      date: p.date.toISOString().split('T')[0],
      method: p.method,
    })),
    documents,
    totalPackagePrice,
    totalPaid,
    remainingBalance,
  };
}

// Helper types for internal use
type TripRow = NonNullable<Awaited<ReturnType<typeof prisma.trip.findUnique>>>;
type PackageRow = NonNullable<Awaited<ReturnType<typeof prisma.package.findUnique>>>;
type ItineraryDay = { day: number; title: string; activities: string[] };

// This is only used for type inference, not called directly
async function fetchPilgrimFull() {
  return prisma.pilgrim.findUniqueOrThrow({
    where: { id: '' },
    include: { documents: true, payments: { orderBy: { date: 'asc' } }, agency: true },
  });
}
type PilgrimFull = Awaited<ReturnType<typeof fetchPilgrimFull>>;

export async function findPilgrimByBookingCode(bookingCode: string) {
  const normalized = bookingCode.trim().toUpperCase();

  // Search across all agencies for this booking code
  const pilgrim = await prisma.pilgrim.findFirst({
    where: { bookingCode: normalized },
    include: {
      documents: true,
      payments: { orderBy: { date: 'asc' } },
      agency: true,
    },
  });

  if (!pilgrim) return null;

  // Fetch trip + package
  let trip = null;
  let pkg = null;
  if (pilgrim.tripId) {
    trip = await prisma.trip.findUnique({ where: { id: pilgrim.tripId } });
    if (trip?.packageId) {
      pkg = await prisma.package.findUnique({ where: { id: trip.packageId } });
    }
  }

  return {
    pilgrimId: pilgrim.id,
    agencyId: pilgrim.agencyId,
    data: transformToPilgrimPortalData(pilgrim as PilgrimFull, trip, pkg),
  };
}
