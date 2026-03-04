/**
 * Main seed script: populate dev database with sample data.
 *
 * Usage:
 *   npm run db:seed
 *   npx tsx prisma/seed.ts
 *
 * Idempotent — safe to run multiple times via upsert.
 */

import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { hashSync } from 'bcryptjs';
import { seedSession17 } from './seed-session17';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// ============ Fixed UUIDs for deterministic re-runs ============

const IDS = {
  agency: '00000000-0000-4000-a000-000000000001',
  users: {
    owner: '00000000-0000-4000-a000-000000000010',
    admin: '00000000-0000-4000-a000-000000000011',
    staff: '00000000-0000-4000-a000-000000000012',
  },
  pilgrims: [
    '00000000-0000-4000-a000-000000000100',
    '00000000-0000-4000-a000-000000000101',
    '00000000-0000-4000-a000-000000000102',
    '00000000-0000-4000-a000-000000000103',
    '00000000-0000-4000-a000-000000000104',
    '00000000-0000-4000-a000-000000000105',
    '00000000-0000-4000-a000-000000000106',
    '00000000-0000-4000-a000-000000000107',
    '00000000-0000-4000-a000-000000000108',
    '00000000-0000-4000-a000-000000000109',
  ],
  packages: {
    reguler: '00000000-0000-4000-a000-000000000200',
    vip: '00000000-0000-4000-a000-000000000201',
    ramadhan: '00000000-0000-4000-a000-000000000202',
  },
  trips: {
    open: '00000000-0000-4000-a000-000000000300',
    preparing: '00000000-0000-4000-a000-000000000301',
  },
  payments: [
    '00000000-0000-4000-a000-000000000400',
    '00000000-0000-4000-a000-000000000401',
    '00000000-0000-4000-a000-000000000402',
    '00000000-0000-4000-a000-000000000403',
    '00000000-0000-4000-a000-000000000404',
  ],
  systemAdmin: '00000000-0000-4000-a000-000000000900',
  courses: {
    operasional: '00000000-0000-4000-a000-000000000500',
    manasik: '00000000-0000-4000-a000-000000000501',
  },
  lessons: [
    '00000000-0000-4000-a000-000000000600',
    '00000000-0000-4000-a000-000000000601',
    '00000000-0000-4000-a000-000000000602',
    '00000000-0000-4000-a000-000000000603',
  ],
};

const PASSWORD_HASH = hashSync('password123', 10);

// ============ Seed Functions ============

async function seedAgency() {
  console.log('Seeding agency...');
  await prisma.agency.upsert({
    where: { id: IDS.agency },
    update: {},
    create: {
      id: IDS.agency,
      name: 'PT Berkah Umrah Mandiri',
      legalName: 'PT Berkah Umrah Mandiri',
      tagline: 'Umrah Nyaman, Ibadah Khusyuk',
      description: 'Biro perjalanan umrah terpercaya sejak 2010',
      ppiuNumber: 'PPIU/2024/001234',
      ppiuStatus: 'active',
      ppiuIssueDate: new Date('2024-01-15'),
      ppiuExpiryDate: new Date('2027-01-15'),
      email: 'info@berkah-umrah.co.id',
      phone: '021-55512345',
      whatsapp: '6281234567890',
      website: 'https://berkah-umrah.co.id',
      address: 'Jl. Masjid Raya No. 123',
      city: 'Jakarta Selatan',
      province: 'DKI Jakarta',
      postalCode: '12345',
      primaryColor: '#1B5E20',
      secondaryColor: '#E8F5E9',
      appTitle: 'Berkah Umrah',
      slug: 'berkah-umrah',
      isVerified: true,
      totalPoints: 1250,
    },
  });
}

async function seedUsers() {
  console.log('Seeding users...');
  const users = [
    {
      id: IDS.users.owner,
      name: 'Ahmad Fauzi',
      email: 'owner@gezma.id',
      role: 'owner',
      position: 'Direktur Utama',
      isVerified: true,
      onboardingCompleted: true,
      totalPoints: 500,
      level: 3,
    },
    {
      id: IDS.users.admin,
      name: 'Siti Nurhaliza',
      email: 'admin@gezma.id',
      role: 'admin',
      position: 'Admin Operasional',
      isVerified: true,
      onboardingCompleted: true,
      totalPoints: 350,
      level: 2,
    },
    {
      id: IDS.users.staff,
      name: 'Budi Santoso',
      email: 'staff@gezma.id',
      role: 'staff',
      position: 'Staff Marketing',
      isVerified: true,
      onboardingCompleted: true,
      totalPoints: 150,
      level: 1,
    },
  ];

  for (const user of users) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {},
      create: {
        ...user,
        password: PASSWORD_HASH,
        agencyId: IDS.agency,
        isActive: true,
      },
    });
  }
}

async function seedPilgrims() {
  console.log('Seeding pilgrims...');
  const statuses = ['lead', 'dp', 'lunas', 'dokumen', 'visa', 'ready', 'departed', 'completed', 'lead', 'dp'];
  const names = [
    'Hasan Abdullah', 'Fatimah Zahra', 'Muhammad Rizki', 'Aisyah Putri',
    'Umar Ibrahim', 'Khadijah Sari', 'Ali Akbar', 'Zainab Maulida',
    'Yusuf Hakim', 'Maryam Qonitah',
  ];
  const genders = ['male', 'female', 'male', 'female', 'male', 'female', 'male', 'female', 'male', 'female'];

  for (let i = 0; i < 10; i++) {
    const nik = `32000000000000${(10 + i).toString()}`;
    await prisma.pilgrim.upsert({
      where: { nik_agencyId: { nik, agencyId: IDS.agency } },
      update: {},
      create: {
        id: IDS.pilgrims[i],
        nik,
        name: names[i],
        gender: genders[i],
        birthPlace: 'Jakarta',
        birthDate: `19${80 + i}-01-15`,
        address: `Jl. Contoh No. ${i + 1}`,
        city: 'Jakarta',
        province: 'DKI Jakarta',
        phone: `0812345678${(10 + i).toString()}`,
        email: `pilgrim${i + 1}@example.com`,
        emergencyContact: { name: 'Keluarga', phone: '081200000000', relation: 'Saudara' },
        status: statuses[i],
        tripId: i < 5 ? IDS.trips.open : i < 8 ? IDS.trips.preparing : null,
        totalPaid: statuses[i] === 'lead' ? 0 : statuses[i] === 'dp' ? 5000000 : 25000000,
        remainingBalance: statuses[i] === 'lead' ? 25000000 : statuses[i] === 'dp' ? 20000000 : 0,
        agencyId: IDS.agency,
        createdBy: IDS.users.admin,
      },
    });
  }
}

async function seedPackages() {
  console.log('Seeding packages...');
  const packages = [
    {
      id: IDS.packages.reguler,
      name: 'Paket Reguler 9 Hari',
      slug: 'reguler-9-hari',
      category: 'regular',
      description: 'Paket umrah reguler 9 hari dengan hotel bintang 3',
      duration: 9,
      airline: 'Garuda Indonesia',
      makkahHotel: 'Grand Zamzam Hotel',
      makkahHotelRating: 3,
      makkahHotelDistance: '500m dari Masjidil Haram',
      madinahHotel: 'Dar Al Taqwa Hotel',
      madinahHotelRating: 3,
      madinahHotelDistance: '300m dari Masjid Nabawi',
      hpp: { visa: 2500000, tiket: 12000000, hotel_makkah: 3500000, hotel_madinah: 2500000, transport: 1500000, makan: 2000000 },
      totalHpp: 24000000,
      margin: 8,
      marginAmount: 1920000,
      publishedPrice: 25920000,
      inclusions: ['Tiket PP', 'Hotel', 'Makan 3x', 'Visa', 'Muthawwif', 'Bus AC'],
      exclusions: ['Koper', 'Tips', 'Laundry'],
      isActive: true,
    },
    {
      id: IDS.packages.vip,
      name: 'Paket VIP 12 Hari',
      slug: 'vip-12-hari',
      category: 'vip',
      description: 'Paket umrah VIP 12 hari dengan hotel bintang 5 dekat Haram',
      duration: 12,
      airline: 'Saudi Airlines',
      makkahHotel: 'Fairmont Makkah Clock Royal Tower',
      makkahHotelRating: 5,
      makkahHotelDistance: '50m dari Masjidil Haram',
      madinahHotel: 'The Oberoi Madina',
      madinahHotelRating: 5,
      madinahHotelDistance: '100m dari Masjid Nabawi',
      hpp: { visa: 2500000, tiket: 18000000, hotel_makkah: 8000000, hotel_madinah: 6000000, transport: 3000000, makan: 4000000 },
      totalHpp: 41500000,
      margin: 12,
      marginAmount: 4980000,
      publishedPrice: 46480000,
      inclusions: ['Tiket PP Business', 'Hotel Bintang 5', 'Makan 3x Premium', 'Visa', 'Muthawwif Pribadi', 'Limousine', 'Koper'],
      exclusions: ['Tips', 'Belanja pribadi'],
      isActive: true,
    },
    {
      id: IDS.packages.ramadhan,
      name: 'Paket Ramadhan 14 Hari',
      slug: 'ramadhan-14-hari',
      category: 'ramadhan',
      description: 'Paket umrah spesial Ramadhan 14 hari, termasuk itikaf 10 hari terakhir',
      duration: 14,
      airline: 'Garuda Indonesia',
      makkahHotel: 'Hilton Makkah Convention',
      makkahHotelRating: 4,
      makkahHotelDistance: '200m dari Masjidil Haram',
      madinahHotel: 'Pullman Madinah',
      madinahHotelRating: 4,
      madinahHotelDistance: '150m dari Masjid Nabawi',
      hpp: { visa: 2500000, tiket: 15000000, hotel_makkah: 7000000, hotel_madinah: 5000000, transport: 2000000, makan: 3500000 },
      totalHpp: 35000000,
      margin: 10,
      marginAmount: 3500000,
      publishedPrice: 38500000,
      inclusions: ['Tiket PP', 'Hotel Bintang 4', 'Makan 3x (Sahur & Iftar)', 'Visa', 'Muthawwif', 'Bus AC', 'Sahur Box'],
      exclusions: ['Koper', 'Tips', 'Laundry'],
      isActive: true,
      isPromo: true,
      promoPrice: 36000000,
      promoEndDate: new Date('2026-03-01'),
    },
  ];

  for (const pkg of packages) {
    await prisma.package.upsert({
      where: { slug_agencyId: { slug: pkg.slug, agencyId: IDS.agency } },
      update: {},
      create: { ...pkg, agencyId: IDS.agency },
    });
  }
}

async function seedTrips() {
  console.log('Seeding trips...');
  const trips = [
    {
      id: IDS.trips.open,
      name: 'Trip Reguler - Maret 2026',
      packageId: IDS.packages.reguler,
      departureDate: new Date('2026-03-15'),
      returnDate: new Date('2026-03-23'),
      registrationCloseDate: new Date('2026-03-01'),
      capacity: 45,
      registeredCount: 5,
      confirmedCount: 3,
      status: 'open',
      muthawwifName: 'Ustadz Hamdi',
      muthawwifPhone: '6281299887766',
    },
    {
      id: IDS.trips.preparing,
      name: 'Trip Ramadhan - April 2026',
      packageId: IDS.packages.ramadhan,
      departureDate: new Date('2026-04-01'),
      returnDate: new Date('2026-04-14'),
      registrationCloseDate: new Date('2026-03-15'),
      capacity: 30,
      registeredCount: 3,
      confirmedCount: 2,
      status: 'preparing',
      muthawwifName: 'Ustadzah Maryam',
      muthawwifPhone: '6281388776655',
    },
  ];

  for (const trip of trips) {
    // Trip doesn't have a natural unique key aside from id
    const existing = await prisma.trip.findUnique({ where: { id: trip.id } });
    if (!existing) {
      await prisma.trip.create({ data: { ...trip, agencyId: IDS.agency } });
    }
  }
}

async function seedPayments() {
  console.log('Seeding payments...');
  const payments = [
    { id: IDS.payments[0], pilgrimId: IDS.pilgrims[1], amount: 5000000, type: 'dp', method: 'transfer', date: new Date('2026-01-10'), notes: 'DP 20%' },
    { id: IDS.payments[1], pilgrimId: IDS.pilgrims[2], amount: 25920000, type: 'full', method: 'transfer', date: new Date('2026-01-15'), notes: 'Pembayaran lunas' },
    { id: IDS.payments[2], pilgrimId: IDS.pilgrims[3], amount: 5000000, type: 'dp', method: 'cash', date: new Date('2026-01-20'), notes: 'DP cash' },
    { id: IDS.payments[3], pilgrimId: IDS.pilgrims[3], amount: 10000000, type: 'installment', method: 'transfer', date: new Date('2026-02-01'), notes: 'Cicilan 1' },
    { id: IDS.payments[4], pilgrimId: IDS.pilgrims[4], amount: 25920000, type: 'full', method: 'card', date: new Date('2026-02-10'), notes: 'Lunas via kartu kredit' },
  ];

  for (const payment of payments) {
    const existing = await prisma.paymentRecord.findUnique({ where: { id: payment.id } });
    if (!existing) {
      await prisma.paymentRecord.create({ data: payment });
    }
  }
}

async function seedActivityLogs() {
  console.log('Seeding activity logs...');
  const logs = [
    { type: 'pilgrim', action: 'created', title: 'Jamaah baru ditambahkan', description: 'Hasan Abdullah didaftarkan sebagai jamaah baru' },
    { type: 'package', action: 'created', title: 'Paket baru dibuat', description: 'Paket Reguler 9 Hari berhasil dibuat' },
    { type: 'trip', action: 'created', title: 'Trip baru dibuat', description: 'Trip Reguler - Maret 2026 dibuat' },
    { type: 'payment', action: 'paid', title: 'Pembayaran diterima', description: 'DP Rp 5.000.000 dari Fatimah Zahra' },
    { type: 'document', action: 'uploaded', title: 'Dokumen diupload', description: 'Paspor Muhammad Rizki diupload' },
  ];

  const count = await prisma.activityLog.count({ where: { agencyId: IDS.agency } });
  if (count === 0) {
    await prisma.activityLog.createMany({
      data: logs.map((log) => ({
        ...log,
        userId: IDS.users.admin,
        agencyId: IDS.agency,
      })),
    });
  }
}

async function seedGamification() {
  console.log('Seeding gamification...');
  const pointEvents = [
    { type: 'pilgrim', action: 'created', points: 10, description: 'Menambahkan jamaah baru', userId: IDS.users.admin },
    { type: 'package', action: 'created', points: 20, description: 'Membuat paket umrah baru', userId: IDS.users.owner },
    { type: 'trip', action: 'created', points: 15, description: 'Membuat trip baru', userId: IDS.users.admin },
    { type: 'payment', action: 'paid', points: 25, description: 'Menerima pembayaran jamaah', userId: IDS.users.staff },
  ];

  const count = await prisma.pointEvent.count({ where: { agencyId: IDS.agency } });
  if (count === 0) {
    await prisma.pointEvent.createMany({
      data: pointEvents.map((pe) => ({ ...pe, agencyId: IDS.agency })),
    });
  }

  // Badges
  const badges = [
    { badgeKey: 'first_pilgrim', userId: IDS.users.admin },
    { badgeKey: 'first_package', userId: IDS.users.owner },
    { badgeKey: 'first_trip', userId: IDS.users.admin },
  ];

  for (const badge of badges) {
    const existing = await prisma.userBadge.findUnique({
      where: { userId_badgeKey: { userId: badge.userId, badgeKey: badge.badgeKey } },
    });
    if (!existing) {
      await prisma.userBadge.create({ data: badge });
    }
  }
}

async function seedSystemAdmin() {
  console.log('Seeding system admin...');
  await prisma.systemAdmin.upsert({
    where: { email: 'superadmin@gezma.id' },
    update: {},
    create: {
      id: IDS.systemAdmin,
      name: 'Super Admin',
      email: 'superadmin@gezma.id',
      password: PASSWORD_HASH,
      role: 'super_admin',
      isActive: true,
    },
  });
}

async function seedAcademy() {
  console.log('Seeding academy...');

  const courses = [
    {
      id: IDS.courses.operasional,
      title: 'Manajemen Operasional Travel Umrah',
      description: 'Pelajari cara mengelola operasional biro umrah dari A sampai Z',
      category: 'operasional',
      level: 'pemula',
      duration: '6 jam',
      instructorName: 'Dr. Ahmad Fauzi',
      totalLessons: 2,
      order: 1,
    },
    {
      id: IDS.courses.manasik,
      title: 'Panduan Manasik Umrah Lengkap',
      description: 'Materi manasik umrah lengkap untuk pembimbing jamaah',
      category: 'manasik',
      level: 'menengah',
      duration: '4 jam',
      instructorName: 'Ustadz Hamdi',
      totalLessons: 2,
      order: 2,
    },
  ];

  for (const course of courses) {
    const existing = await prisma.academyCourse.findUnique({ where: { id: course.id } });
    if (!existing) {
      await prisma.academyCourse.create({ data: course });
    }
  }

  const lessons = [
    {
      id: IDS.lessons[0],
      courseId: IDS.courses.operasional,
      title: 'Pengantar Bisnis Travel Umrah',
      content: '## Pengantar\n\nIndustri travel umrah di Indonesia terus berkembang...',
      order: 1,
      duration: '45 menit',
    },
    {
      id: IDS.lessons[1],
      courseId: IDS.courses.operasional,
      title: 'Manajemen Jamaah dan CRM',
      content: '## CRM untuk Travel Umrah\n\nPengelolaan data jamaah yang baik adalah kunci...',
      order: 2,
      duration: '60 menit',
    },
    {
      id: IDS.lessons[2],
      courseId: IDS.courses.manasik,
      title: 'Rukun dan Wajib Umrah',
      content: '## Rukun Umrah\n\n1. Ihram dari miqat\n2. Tawaf\n3. Sai\n4. Tahallul...',
      order: 1,
      duration: '30 menit',
    },
    {
      id: IDS.lessons[3],
      courseId: IDS.courses.manasik,
      title: 'Teknik Membimbing Jamaah di Tanah Suci',
      content: '## Tips Membimbing\n\nSebagai pembimbing, Anda harus memastikan jamaah...',
      order: 2,
      duration: '45 menit',
    },
  ];

  for (const lesson of lessons) {
    const existing = await prisma.academyLesson.findUnique({ where: { id: lesson.id } });
    if (!existing) {
      await prisma.academyLesson.create({ data: lesson });
    }
  }
}

// ============ Main ============

async function main() {
  console.log('=== Gezma Agent Seed Script ===\n');

  await seedAgency();
  await seedUsers();
  await seedPilgrims();
  await seedPackages();
  await seedTrips();
  await seedPayments();
  await seedActivityLogs();
  await seedGamification();
  await seedSystemAdmin();
  await seedAcademy();
  await seedSession17(prisma);

  console.log('\n=== Seed Complete! ===\n');
  console.log('Demo Credentials:');
  console.log('─────────────────────────────────────────');
  console.log('Agent Portal:');
  console.log('  Owner:  owner@gezma.id / password123');
  console.log('  Admin:  admin@gezma.id / password123');
  console.log('  Staff:  staff@gezma.id / password123');
  console.log('');
  console.log('Command Center:');
  console.log('  Admin:  superadmin@gezma.id / password123');
  console.log('─────────────────────────────────────────');
}

main()
  .catch((err) => {
    console.error('Seed failed:', err);
    process.exit(1);
  })
  .finally(() => {
    pool.end();
  });
