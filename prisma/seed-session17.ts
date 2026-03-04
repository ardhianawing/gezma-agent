/**
 * Session 17 Seed: Marketplace, Forum, News, Trade Centre
 *
 * Seeds global data (no agencyId) for marketplace items, forum threads,
 * news articles, and trade products.
 */

import type { PrismaClient } from '../src/generated/prisma/client';

// Fixed UUIDs for deterministic re-runs
const S17_IDS = {
  marketplace: [
    '00000000-0000-4000-a000-100000000001',
    '00000000-0000-4000-a000-100000000002',
    '00000000-0000-4000-a000-100000000003',
    '00000000-0000-4000-a000-100000000004',
    '00000000-0000-4000-a000-100000000005',
    '00000000-0000-4000-a000-100000000006',
    '00000000-0000-4000-a000-100000000007',
    '00000000-0000-4000-a000-100000000008',
    '00000000-0000-4000-a000-100000000009',
    '00000000-0000-4000-a000-100000000010',
    '00000000-0000-4000-a000-100000000011',
    '00000000-0000-4000-a000-100000000012',
    '00000000-0000-4000-a000-100000000013',
    '00000000-0000-4000-a000-100000000014',
    '00000000-0000-4000-a000-100000000015',
    '00000000-0000-4000-a000-100000000016',
    '00000000-0000-4000-a000-100000000017',
    '00000000-0000-4000-a000-100000000018',
    '00000000-0000-4000-a000-100000000019',
    '00000000-0000-4000-a000-100000000020',
    '00000000-0000-4000-a000-100000000021',
    '00000000-0000-4000-a000-100000000022',
    '00000000-0000-4000-a000-100000000023',
    '00000000-0000-4000-a000-100000000024',
    '00000000-0000-4000-a000-100000000025',
    '00000000-0000-4000-a000-100000000026',
    '00000000-0000-4000-a000-100000000027',
    '00000000-0000-4000-a000-100000000028',
    '00000000-0000-4000-a000-100000000029',
    '00000000-0000-4000-a000-100000000030',
  ],
  forum: [
    '00000000-0000-4000-a000-200000000001',
    '00000000-0000-4000-a000-200000000002',
    '00000000-0000-4000-a000-200000000003',
    '00000000-0000-4000-a000-200000000004',
    '00000000-0000-4000-a000-200000000005',
    '00000000-0000-4000-a000-200000000006',
    '00000000-0000-4000-a000-200000000007',
    '00000000-0000-4000-a000-200000000008',
    '00000000-0000-4000-a000-200000000009',
    '00000000-0000-4000-a000-200000000010',
    '00000000-0000-4000-a000-200000000011',
    '00000000-0000-4000-a000-200000000012',
  ],
  news: [
    '00000000-0000-4000-a000-300000000001',
    '00000000-0000-4000-a000-300000000002',
    '00000000-0000-4000-a000-300000000003',
    '00000000-0000-4000-a000-300000000004',
    '00000000-0000-4000-a000-300000000005',
    '00000000-0000-4000-a000-300000000006',
    '00000000-0000-4000-a000-300000000007',
    '00000000-0000-4000-a000-300000000008',
    '00000000-0000-4000-a000-300000000009',
    '00000000-0000-4000-a000-300000000010',
  ],
  trade: [
    '00000000-0000-4000-a000-400000000001',
    '00000000-0000-4000-a000-400000000002',
    '00000000-0000-4000-a000-400000000003',
    '00000000-0000-4000-a000-400000000004',
    '00000000-0000-4000-a000-400000000005',
    '00000000-0000-4000-a000-400000000006',
    '00000000-0000-4000-a000-400000000007',
    '00000000-0000-4000-a000-400000000008',
    '00000000-0000-4000-a000-400000000009',
    '00000000-0000-4000-a000-400000000010',
    '00000000-0000-4000-a000-400000000011',
    '00000000-0000-4000-a000-400000000012',
    '00000000-0000-4000-a000-400000000013',
    '00000000-0000-4000-a000-400000000014',
    '00000000-0000-4000-a000-400000000015',
    '00000000-0000-4000-a000-400000000016',
    '00000000-0000-4000-a000-400000000017',
    '00000000-0000-4000-a000-400000000018',
    '00000000-0000-4000-a000-400000000019',
    '00000000-0000-4000-a000-400000000020',
  ],
};

const AGENCY_ID = '00000000-0000-4000-a000-000000000001';
const OWNER_ID = '00000000-0000-4000-a000-000000000010';
const ADMIN_ID = '00000000-0000-4000-a000-000000000011';
const SYSTEM_ADMIN_ID = '00000000-0000-4000-a000-000000000900';

function parsePrice(priceStr: string): number {
  const num = priceStr.replace(/[^0-9.]/g, '');
  return parseFloat(num) || 0;
}

export async function seedMarketplace(prisma: PrismaClient) {
  console.log('Seeding marketplace items...');

  const items = [
    { name: 'Pullman Zamzam Makkah', vendor: 'Al Haram Hotels Group', category: 'hotel', description: 'Hotel bintang 5 tepat di depan Masjidil Haram dengan akses langsung ke area tawaf.', emoji: '🏨', badge: 'Best Seller', rating: 4.8, reviewCount: 324, tags: ['Bintang 5', 'View Haram', 'Breakfast'], details: { Bintang: '⭐⭐⭐⭐⭐', 'Jarak ke Haram': '50 meter', 'Tipe Kamar': 'Quad / Triple' }, price: 'Rp 3.200.000', priceAmount: 3200000, priceUnit: '/malam', city: 'Makkah' },
    { name: 'Swissotel Al Maqam Makkah', vendor: 'Al Haram Hotels Group', category: 'hotel', description: "Hotel mewah di kompleks Abraj Al-Bait dengan pemandangan langsung Ka'bah.", emoji: '🏨', badge: 'Premium', rating: 4.9, reviewCount: 198, tags: ['Bintang 5', 'Abraj Al-Bait', 'VIP'], details: { Bintang: '⭐⭐⭐⭐⭐', 'Jarak ke Haram': '20 meter', 'Tipe Kamar': 'Twin / Double' }, price: 'Rp 4.500.000', priceAmount: 4500000, priceUnit: '/malam', city: 'Makkah' },
    { name: 'Elaf Ajyad Hotel', vendor: 'Elaf Group', category: 'hotel', description: 'Hotel bintang 4 dengan lokasi strategis dekat pintu masuk King Fahd.', emoji: '🏨', badge: 'Popular', rating: 4.3, reviewCount: 412, tags: ['Bintang 4', 'Dekat Haram', 'Ekonomis'], details: { Bintang: '⭐⭐⭐⭐', 'Jarak ke Haram': '200 meter', 'Tipe Kamar': 'Quad' }, price: 'Rp 1.800.000', priceAmount: 1800000, priceUnit: '/malam', city: 'Makkah' },
    { name: 'Al Marwa Rayhaan by Rotana', vendor: 'Rotana Hotels', category: 'hotel', description: 'Hotel bintang 5 di area Ajyad, cocok untuk rombongan besar.', emoji: '🏨', rating: 4.5, reviewCount: 267, tags: ['Bintang 5', 'Rombongan', 'Shuttle'], details: { Bintang: '⭐⭐⭐⭐⭐', 'Jarak ke Haram': '350 meter', 'Tipe Kamar': 'Quad / Triple' }, price: 'Rp 2.400.000', priceAmount: 2400000, priceUnit: '/malam', city: 'Makkah' },
    { name: 'Voco Makkah', vendor: 'IHG Hotels', category: 'hotel', description: 'Hotel modern bintang 4 di kawasan Aziziyah dengan shuttle gratis ke Haram.', emoji: '🏨', badge: 'New', rating: 4.2, reviewCount: 89, tags: ['Bintang 4', 'Shuttle', 'Modern'], details: { Bintang: '⭐⭐⭐⭐', 'Jarak ke Haram': '3 km', 'Tipe Kamar': 'Quad' }, price: 'Rp 950.000', priceAmount: 950000, priceUnit: '/malam', city: 'Makkah' },
    { name: 'The Oberoi Madinah', vendor: 'Oberoi Hotels', category: 'hotel', description: 'Hotel bintang 5 ultra-premium dengan view langsung Masjid Nabawi.', emoji: '🏨', badge: 'Premium', rating: 4.9, reviewCount: 156, tags: ['Bintang 5', 'View Nabawi', 'Luxury'], details: { Bintang: '⭐⭐⭐⭐⭐', 'Jarak ke Nabawi': '100 meter', 'Tipe Kamar': 'Twin / Suite' }, price: 'Rp 3.800.000', priceAmount: 3800000, priceUnit: '/malam', city: 'Madinah' },
    { name: 'Shaza Al Madina', vendor: 'Shaza Hotels', category: 'hotel', description: 'Hotel boutique bintang 5 dengan nuansa Arab klasik di pusat Madinah.', emoji: '🏨', badge: 'Best Seller', rating: 4.7, reviewCount: 289, tags: ['Bintang 5', 'Dekat Nabawi', 'Breakfast'], details: { Bintang: '⭐⭐⭐⭐⭐', 'Jarak ke Nabawi': '150 meter', 'Tipe Kamar': 'Quad / Triple' }, price: 'Rp 2.600.000', priceAmount: 2600000, priceUnit: '/malam', city: 'Madinah' },
    { name: 'Dallah Taibah Hotel', vendor: 'Dallah Group', category: 'hotel', description: 'Hotel bintang 4 terpercaya dengan lokasi strategis di sebelah selatan Masjid Nabawi.', emoji: '🏨', badge: 'Popular', rating: 4.4, reviewCount: 378, tags: ['Bintang 4', 'Terpercaya', 'Ekonomis'], details: { Bintang: '⭐⭐⭐⭐', 'Jarak ke Nabawi': '300 meter', 'Tipe Kamar': 'Quad' }, price: 'Rp 1.500.000', priceAmount: 1500000, priceUnit: '/malam', city: 'Madinah' },
    { name: 'Millennium Al Aqeeq Madinah', vendor: 'Millennium Hotels', category: 'hotel', description: 'Hotel bintang 4 di area pusat Madinah dengan fasilitas lengkap untuk jamaah.', emoji: '🏨', rating: 4.1, reviewCount: 201, tags: ['Bintang 4', 'Fasilitas Lengkap', 'Rombongan'], details: { Bintang: '⭐⭐⭐⭐', 'Jarak ke Nabawi': '500 meter', 'Tipe Kamar': 'Quad / Triple' }, price: 'Rp 1.200.000', priceAmount: 1200000, priceUnit: '/malam', city: 'Madinah' },
    { name: 'Al Eiman Royal Hotel', vendor: 'Al Eiman Hotels', category: 'hotel', description: 'Hotel bintang 3 budget-friendly dengan jarak jalan kaki ke Masjid Nabawi.', emoji: '🏨', badge: 'New', rating: 3.8, reviewCount: 134, tags: ['Bintang 3', 'Budget', 'Walking Distance'], details: { Bintang: '⭐⭐⭐', 'Jarak ke Nabawi': '400 meter', 'Tipe Kamar': 'Quad' }, price: 'Rp 750.000', priceAmount: 750000, priceUnit: '/malam', city: 'Madinah' },
    // Visa
    { name: 'Visa Umrah Regular', vendor: 'Gezma Visa Service', category: 'visa', description: 'Pengurusan visa umrah reguler dengan proses 5-7 hari kerja.', emoji: '📄', badge: 'Best Seller', rating: 4.6, reviewCount: 892, tags: ['Reguler', '5-7 Hari', 'Terjamin'], details: { Proses: '5-7 hari kerja', Validitas: '90 hari', Tipe: 'Single Entry' }, price: 'Rp 550.000', priceAmount: 550000, priceUnit: '/pax' },
    { name: 'Visa Umrah Express', vendor: 'Gezma Visa Service', category: 'visa', description: 'Pengurusan visa umrah express dengan proses 2-3 hari kerja.', emoji: '📄', badge: 'Popular', rating: 4.7, reviewCount: 445, tags: ['Express', '2-3 Hari', 'Prioritas'], details: { Proses: '2-3 hari kerja', Validitas: '90 hari', Tipe: 'Single Entry' }, price: 'Rp 850.000', priceAmount: 850000, priceUnit: '/pax' },
    { name: 'Visa Umrah + Asuransi Bundle', vendor: 'Nusantara Visa', category: 'visa', description: 'Paket visa umrah termasuk asuransi perjalanan basic.', emoji: '📄', rating: 4.4, reviewCount: 267, tags: ['Bundle', 'Termasuk Asuransi', 'Hemat'], details: { Proses: '5-7 hari kerja', Validitas: '90 hari', Bonus: 'Asuransi Basic' }, price: 'Rp 700.000', priceAmount: 700000, priceUnit: '/pax' },
    { name: 'Visa Umrah VIP', vendor: 'Al Safar Visa', category: 'visa', description: 'Layanan visa VIP dengan personal assistant dan proses 1-2 hari.', emoji: '📄', badge: 'Premium', rating: 4.9, reviewCount: 98, tags: ['VIP', '1-2 Hari', 'Personal Assistant'], details: { Proses: '1-2 hari kerja', Validitas: '90 hari', Layanan: 'Personal Assistant' }, price: 'Rp 1.500.000', priceAmount: 1500000, priceUnit: '/pax' },
    { name: 'Visa Umrah Group', vendor: 'Nusantara Visa', category: 'visa', description: 'Pengurusan visa umrah untuk rombongan minimal 20 pax dengan harga spesial.', emoji: '📄', badge: 'New', rating: 4.3, reviewCount: 56, tags: ['Group', 'Min 20 Pax', 'Diskon'], details: { Proses: '7-10 hari kerja', 'Min. Pax': '20 orang', Diskon: 'Hingga 15%' }, price: 'Rp 450.000', priceAmount: 450000, priceUnit: '/pax' },
    // Transport
    { name: 'Bus Shalawat VIP 50 Seat', vendor: 'Saudi Transport Co.', category: 'transport', description: 'Bus AC VIP 50 kursi untuk transfer Jeddah-Makkah-Madinah.', emoji: '🚌', badge: 'Best Seller', rating: 4.5, reviewCount: 534, tags: ['VIP', '50 Seat', 'AC'], details: { Kapasitas: '50 kursi', Rute: 'Jeddah-Makkah-Madinah', Fasilitas: 'AC, WiFi, Charger' }, price: 'Rp 45.000.000', priceAmount: 45000000, priceUnit: '/bus' },
    { name: 'Bus Ekonomi 45 Seat', vendor: 'Haramain Bus', category: 'transport', description: 'Bus ekonomi AC 45 kursi untuk rombongan jamaah.', emoji: '🚌', rating: 4.1, reviewCount: 312, tags: ['Ekonomi', '45 Seat', 'Budget'], details: { Kapasitas: '45 kursi', Rute: 'Jeddah-Makkah-Madinah', Fasilitas: 'AC' }, price: 'Rp 30.000.000', priceAmount: 30000000, priceUnit: '/bus' },
    { name: 'Handling Bandara Jeddah', vendor: 'Saudi Ground Service', category: 'transport', description: 'Layanan penjemputan dan handling di bandara King Abdulaziz Jeddah.', emoji: '🚌', badge: 'Popular', rating: 4.6, reviewCount: 423, tags: ['Handling', 'Bandara Jeddah', 'Meet & Greet'], details: { Layanan: 'Meet & Greet', Lokasi: 'Bandara Jeddah', Include: 'Porter + Trolley' }, price: 'Rp 150.000', priceAmount: 150000, priceUnit: '/pax' },
    // Asuransi
    { name: 'Asuransi Perjalanan Basic', vendor: 'Takaful Insurance', category: 'asuransi', description: 'Asuransi perjalanan umrah basic dengan coverage kesehatan dan kecelakaan.', emoji: '🛡️', badge: 'Best Seller', rating: 4.4, reviewCount: 678, tags: ['Basic', 'Kesehatan', 'Kecelakaan'], details: { Coverage: 'USD 50.000', 'Masa Berlaku': '30 hari', Klaim: '24 Jam' }, price: 'Rp 185.000', priceAmount: 185000, priceUnit: '/pax' },
    { name: 'Asuransi Perjalanan Premium', vendor: 'Takaful Insurance', category: 'asuransi', description: 'Asuransi premium dengan coverage lengkap termasuk bagasi dan delay.', emoji: '🛡️', badge: 'Popular', rating: 4.7, reviewCount: 312, tags: ['Premium', 'Bagasi', 'Flight Delay'], details: { Coverage: 'USD 100.000', 'Masa Berlaku': '45 hari', Bonus: 'Bagasi + Delay' }, price: 'Rp 350.000', priceAmount: 350000, priceUnit: '/pax' },
    // Mutawwif
    { name: 'Mutawwif Berbahasa Indonesia', vendor: 'Makkah Guide Service', category: 'mutawwif', description: 'Pemandu ibadah umrah berpengalaman berbahasa Indonesia untuk rombongan.', emoji: '👤', badge: 'Best Seller', rating: 4.8, reviewCount: 567, tags: ['Bahasa Indonesia', 'Berpengalaman', 'Rombongan'], details: { Bahasa: 'Indonesia + Arab', Pengalaman: '10+ tahun', 'Max Jamaah': '45 orang' }, price: 'Rp 5.000.000', priceAmount: 5000000, priceUnit: '/group' },
    { name: 'Mutawwif VIP Personal', vendor: 'Al Haramain Guide', category: 'mutawwif', description: 'Mutawwif personal VIP untuk keluarga atau kelompok kecil.', emoji: '👤', badge: 'Premium', rating: 4.9, reviewCount: 134, tags: ['VIP', 'Personal', 'Fleksibel'], details: { Bahasa: 'Indonesia + Arab + English', Tipe: 'Personal', 'Max Jamaah': '10 orang' }, price: 'Rp 3.500.000', priceAmount: 3500000, priceUnit: '/hari' },
    { name: 'City Tour Guide Makkah', vendor: 'Makkah Guide Service', category: 'mutawwif', description: 'Guide khusus ziarah tempat-tempat bersejarah di Makkah.', emoji: '👤', badge: 'Popular', rating: 4.5, reviewCount: 234, tags: ['Ziarah', 'Sejarah', 'Full Day'], details: { Durasi: 'Full day (8 jam)', Destinasi: '8 lokasi', Include: 'Transport' }, price: 'Rp 1.500.000', priceAmount: 1500000, priceUnit: '/group' },
    // Tiket
    { name: 'Tiket GA Direct CGK-JED', vendor: 'Garuda Indonesia', category: 'tiket', description: 'Tiket pesawat Garuda Indonesia direct flight Jakarta ke Jeddah.', emoji: '✈️', badge: 'Best Seller', rating: 4.6, reviewCount: 1023, tags: ['Direct', 'Garuda', 'Full Service'], details: { Maskapai: 'Garuda Indonesia', Rute: 'CGK → JED', Durasi: '10 jam (direct)' }, price: 'Rp 12.500.000', priceAmount: 12500000, priceUnit: '/pax (PP)' },
    { name: 'Tiket Saudi Airlines CGK-JED', vendor: 'Saudi Arabian Airlines', category: 'tiket', description: 'Tiket pesawat Saudia direct flight Jakarta ke Jeddah.', emoji: '✈️', badge: 'Popular', rating: 4.3, reviewCount: 789, tags: ['Direct', 'Saudia', 'Ekonomis'], details: { Maskapai: 'Saudi Arabian Airlines', Rute: 'CGK → JED', Durasi: '10 jam (direct)' }, price: 'Rp 10.800.000', priceAmount: 10800000, priceUnit: '/pax (PP)' },
    { name: 'Tiket Transit via KUL/DOH', vendor: 'Multi Airlines', category: 'tiket', description: 'Tiket pesawat transit via Kuala Lumpur atau Doha, harga lebih hemat.', emoji: '✈️', rating: 4.0, reviewCount: 456, tags: ['Transit', 'Budget', 'Multi Airlines'], details: { Maskapai: 'Malaysia/Qatar Airways', Rute: 'CGK → KUL/DOH → JED', Durasi: '14-16 jam' }, price: 'Rp 8.500.000', priceAmount: 8500000, priceUnit: '/pax (PP)' },
    // Extra transport/asuransi/mutawwif to reach ~30
    { name: 'Private Car Makkah', vendor: 'Al Haramain Limo', category: 'transport', description: 'Mobil private dengan driver untuk ziarah dan keperluan di Makkah.', emoji: '🚌', badge: 'Premium', rating: 4.8, reviewCount: 167, tags: ['Private', 'Driver', 'Fleksibel'], details: { Kapasitas: '4-6 orang', Durasi: '12 jam/hari', Include: 'Driver + BBM' }, price: 'Rp 2.500.000', priceAmount: 2500000, priceUnit: '/hari' },
    { name: 'Paket Ziarah Makkah-Madinah', vendor: 'Haramain Bus', category: 'transport', description: 'Paket bus ziarah lengkap tempat-tempat bersejarah di Makkah dan Madinah.', emoji: '🚌', badge: 'New', rating: 4.3, reviewCount: 78, tags: ['Ziarah', 'Full Day', 'Guide'], details: { Durasi: '2 hari', Destinasi: '12 lokasi', Include: 'Bus + Guide + Makan' }, price: 'Rp 350.000', priceAmount: 350000, priceUnit: '/pax' },
    { name: 'Asuransi Syariah Keluarga', vendor: 'Amanah Syariah Insurance', category: 'asuransi', description: 'Asuransi syariah khusus keluarga dengan coverage hingga 6 anggota.', emoji: '🛡️', badge: 'New', rating: 4.2, reviewCount: 89, tags: ['Syariah', 'Keluarga', 'Max 6 Pax'], details: { Coverage: 'USD 75.000', Anggota: 'Max 6 orang', Akad: 'Tabarru' }, price: 'Rp 900.000', priceAmount: 900000, priceUnit: '/keluarga' },
    { name: 'City Tour Guide Madinah', vendor: 'Madinah Tours', category: 'mutawwif', description: 'Guide khusus ziarah tempat-tempat bersejarah di Madinah.', emoji: '👤', rating: 4.4, reviewCount: 189, tags: ['Ziarah', 'Madinah', 'Full Day'], details: { Durasi: 'Full day (8 jam)', Destinasi: '10 lokasi', Include: 'Transport' }, price: 'Rp 1.200.000', priceAmount: 1200000, priceUnit: '/group' },
  ];

  const count = await prisma.marketplaceItem.count();
  if (count > 0) {
    console.log(`  Skipping marketplace (${count} items already exist)`);
    return;
  }

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    await prisma.marketplaceItem.create({
      data: {
        id: S17_IDS.marketplace[i],
        ...item,
        details: JSON.parse(JSON.stringify(item.details)),
        createdBy: SYSTEM_ADMIN_ID,
      },
    });
  }
  console.log(`  Created ${items.length} marketplace items`);
}

export async function seedForum(prisma: PrismaClient) {
  console.log('Seeding forum threads...');

  const threads = [
    { title: '[WAJIB BACA] Aturan Forum & Panduan Posting', content: 'Silakan baca aturan forum sebelum posting. Pelanggaran akan dikenakan sanksi ban permanen.', excerpt: 'Silakan baca aturan forum sebelum posting. Pelanggaran akan dikenakan sanksi ban permanen.', category: 'regulasi', tags: ['rules', 'panduan'], authorId: ADMIN_ID, authorName: 'AdminGezma', authorAvatar: 'AG', authorBadge: 'Admin', replyCount: 156, viewCount: 8420, isPinned: true, lastReplyBy: 'NewbiePKB', lastReplyAt: new Date('2026-02-23T08:30:00Z') },
    { title: '[INFO] Update Regulasi OJK Februari 2026 - Wajib Dibaca Semua Agen', content: 'OJK mengeluarkan peraturan baru terkait batas plafon pinjaman dan ketentuan agen.', excerpt: 'OJK mengeluarkan peraturan baru terkait batas plafon pinjaman dan ketentuan agen. Simak lengkapnya di sini.', category: 'regulasi', tags: ['ojk', 'update', 'februari-2026'], authorId: ADMIN_ID, authorName: 'ModRina', authorAvatar: 'MR', authorBadge: 'Moderator', replyCount: 89, viewCount: 5230, isPinned: true, lastReplyBy: 'AgenBandung', lastReplyAt: new Date('2026-02-23T07:15:00Z') },
    { title: 'Review Jujur: Pengalaman 6 Bulan Jadi Agen di Platform X', content: 'Sharing pengalaman saya selama 6 bulan jadi agen. Ada plus minusnya, fee lumayan tapi support kurang responsif.', excerpt: 'Sharing pengalaman saya selama 6 bulan jadi agen. Ada plus minusnya, fee lumayan tapi support kurang responsif.', category: 'review', tags: ['platform-x', 'pengalaman', 'honest-review'], authorId: OWNER_ID, authorName: 'RizkyAgent', authorAvatar: 'RA', authorBadge: 'Verified', replyCount: 47, viewCount: 3150, isHot: true, lastReplyBy: 'SuryaFintech', lastReplyAt: new Date('2026-02-22T19:45:00Z') },
    { title: 'HATI-HATI! Modus Penipuan Berkedok "Upgrade Agen Premium"', content: 'Ada oknum yang menghubungi via WA mengaku CS platform, minta transfer untuk upgrade. INI PENIPUAN!', excerpt: 'Ada oknum yang menghubungi via WA mengaku CS platform, minta transfer untuk upgrade. INI PENIPUAN! Jangan pernah transfer ke rekening pribadi.', category: 'scam', tags: ['penipuan', 'modus-baru', 'waspada'], authorId: OWNER_ID, authorName: 'WatchdogID', authorAvatar: 'WI', authorBadge: 'Top Contributor', replyCount: 63, viewCount: 4870, isHot: true, lastReplyBy: 'AgenSolo', lastReplyAt: new Date('2026-02-23T06:00:00Z') },
    { title: 'Cara Mengatasi Error "Transaksi Gagal" Saat Pencairan Dana', content: 'Buat yang sering kena error saat cairkan dana, coba langkah-langkah berikut ini.', excerpt: 'Buat yang sering kena error saat cairkan dana, coba langkah-langkah berikut ini. Sudah tested dan works.', category: 'operasional', tags: ['error', 'pencairan', 'troubleshoot'], authorId: OWNER_ID, authorName: 'TeknisiPKB', authorAvatar: 'TP', authorBadge: 'Verified', replyCount: 32, viewCount: 2180, isSolved: true, lastReplyBy: 'AgentBali', lastReplyAt: new Date('2026-02-22T16:20:00Z') },
    { title: 'Tips: Cara Dapat 50+ Nasabah per Bulan dari Media Sosial', content: 'Saya share strategi yang sudah saya pakai 3 bulan terakhir. Pakai kombinasi Reels + WhatsApp broadcast + TikTok.', excerpt: 'Saya share strategi yang sudah saya pakai 3 bulan terakhir. Pakai kombinasi Reels + WhatsApp broadcast + TikTok.', category: 'sharing', tags: ['tips', 'marketing', 'sosmed', 'nasabah'], authorId: OWNER_ID, authorName: 'DigiMarketer', authorAvatar: 'DM', authorBadge: 'Top Contributor', replyCount: 28, viewCount: 1950, lastReplyBy: 'AgenJaksel', lastReplyAt: new Date('2026-02-22T14:00:00Z') },
    { title: 'Bagaimana Cara Hitung Komisi Berjenjang? Bingung Nih', content: 'Ada yang bisa jelasin cara hitung komisi berjenjang? Dari level 1 sampai level 3.', excerpt: 'Ada yang bisa jelasin cara hitung komisi berjenjang? Dari level 1 sampai level 3, saya masih bingung cara ngitungnya.', category: 'tanya', tags: ['komisi', 'perhitungan', 'newbie'], authorId: OWNER_ID, authorName: 'NewbieAgen', authorAvatar: 'NA', replyCount: 15, viewCount: 890, isSolved: true, lastReplyBy: 'ModRina', lastReplyAt: new Date('2026-02-22T11:30:00Z') },
    { title: 'Review Platform Y: Fee Tertinggi tapi Ribet Prosesnya', content: 'Platform Y memang fee-nya paling gede, tapi proses verifikasi nasabahnya paling ribet.', excerpt: 'Platform Y memang fee-nya paling gede, tapi proses verifikasi nasabahnya paling ribet. Worth it gak sih?', category: 'review', tags: ['platform-y', 'fee', 'proses'], authorId: OWNER_ID, authorName: 'AgenSurabaya', authorAvatar: 'AS', authorBadge: 'Verified', replyCount: 21, viewCount: 1640, lastReplyBy: 'RizkyAgent', lastReplyAt: new Date('2026-02-21T20:00:00Z') },
    { title: 'SOP Lengkap: Onboarding Nasabah Baru dari Awal sampai Cair', content: 'Step by step dari approach nasabah, kumpulkan dokumen, input data, sampai dana cair.', excerpt: 'Step by step dari approach nasabah, kumpulkan dokumen, input data, sampai dana cair. Cocok untuk agen pemula.', category: 'operasional', tags: ['sop', 'onboarding', 'panduan-lengkap'], authorId: OWNER_ID, authorName: 'ProAgent99', authorAvatar: 'PA', authorBadge: 'Top Contributor', replyCount: 44, viewCount: 3680, lastReplyBy: 'NewbieAgen', lastReplyAt: new Date('2026-02-22T22:10:00Z') },
    { title: 'Waspada Link Phishing WhatsApp Mengatasnamakan Fintech', content: 'Beredar link phishing di grup WA yang mengarah ke halaman login palsu.', excerpt: 'Beredar link phishing di grup WA yang mengarah ke halaman login palsu. Jangan klik link dari sumber tidak resmi!', category: 'scam', tags: ['phishing', 'whatsapp', 'waspada'], authorId: OWNER_ID, authorName: 'CyberAware', authorAvatar: 'CA', replyCount: 18, viewCount: 2340, lastReplyBy: 'WatchdogID', lastReplyAt: new Date('2026-02-21T15:45:00Z') },
    { title: 'Sharing Pendapatan Bulan Januari 2026 - Yuk Saling Motivasi!', content: 'Bulan Januari kemarin alhamdulillah tembus 15 juta.', excerpt: 'Bulan Januari kemarin alhamdulillah tembus 15 juta. Yuk share pengalaman masing-masing biar saling semangat!', category: 'sharing', tags: ['pendapatan', 'januari', 'motivasi'], authorId: OWNER_ID, authorName: 'MotivatorAgen', authorAvatar: 'MA', replyCount: 36, viewCount: 2780, lastReplyBy: 'AgenMedan', lastReplyAt: new Date('2026-02-20T18:30:00Z') },
    { title: 'Apakah Agen Wajib Punya NPWP? Gimana Pajaknya?', content: 'Mau tanya dong, sebagai agen apakah wajib punya NPWP?', excerpt: 'Mau tanya dong, sebagai agen apakah wajib punya NPWP? Kalau iya, gimana cara lapor pajaknya? Ada yang sudah pengalaman?', category: 'tanya', tags: ['pajak', 'npwp', 'regulasi'], authorId: OWNER_ID, authorName: 'TaxNewbie', authorAvatar: 'TN', replyCount: 12, viewCount: 760, lastReplyBy: 'ProAgent99', lastReplyAt: new Date('2026-02-22T09:00:00Z') },
  ];

  const count = await prisma.forumThread.count();
  if (count > 0) {
    console.log(`  Skipping forum (${count} threads already exist)`);
    return;
  }

  for (let i = 0; i < threads.length; i++) {
    await prisma.forumThread.create({
      data: { id: S17_IDS.forum[i], ...threads[i], createdAt: new Date(`2026-0${i < 9 ? 1 : 2}-${(10 + i).toString().padStart(2, '0')}T08:00:00Z`) },
    });
  }
  console.log(`  Created ${threads.length} forum threads`);
}

export async function seedNews(prisma: PrismaClient) {
  console.log('Seeding news articles...');

  const articles = [
    { title: 'Saudi Arabia Terapkan Sistem Nusuk Baru untuk Visa Umrah 2026', excerpt: 'Kementerian Haji Arab Saudi resmi mengumumkan pembaruan sistem Nusuk yang akan berlaku mulai April 2026.', content: 'Kementerian Haji Arab Saudi resmi mengumumkan pembaruan sistem Nusuk yang akan berlaku mulai April 2026. Semua PPIU wajib terintegrasi dengan sistem baru ini untuk memproses visa umrah.', category: 'regulasi', emoji: '🕌', tags: ['Nusuk', 'Visa', 'Saudi Arabia'], author: 'Tim Redaksi GEZMA', authorRole: 'Editor', readTime: 5, isBreaking: true, isOfficial: true, isFeatured: true, isPublished: true, publishedAt: new Date('2026-02-23T08:00:00Z') },
    { title: 'Kemenag RI: Kuota Umrah 2026 Naik 15% dari Tahun Sebelumnya', excerpt: 'Kementerian Agama mengumumkan peningkatan kuota umrah untuk tahun 2026.', content: 'Kementerian Agama mengumumkan peningkatan kuota umrah untuk tahun 2026. Total kuota mencapai 1,2 juta jemaah, naik dari 1,04 juta di 2025.', category: 'regulasi', emoji: '📊', tags: ['Kuota', 'Kemenag', 'Umrah 2026'], author: 'Ahmad Fauzan', authorRole: 'Journalist', readTime: 4, isPublished: true, isFeatured: true, publishedAt: new Date('2026-02-22T14:30:00Z') },
    { title: 'GEZMA Platform v2.0 Resmi Diluncurkan dengan Fitur AI Assistant', excerpt: 'GEZMA meluncurkan versi 2.0 dengan fitur AI Assistant.', content: 'GEZMA meluncurkan versi 2.0 dengan fitur AI Assistant berbasis Gemini yang bisa membantu travel agent mengelola operasional umrah secara lebih efisien.', category: 'pengumuman', emoji: '🚀', tags: ['GEZMA', 'AI', 'Update'], author: 'Tim GEZMA', authorRole: 'Official', readTime: 3, isOfficial: true, isPublished: true, publishedAt: new Date('2026-02-21T10:00:00Z') },
    { title: 'Webinar Gratis: Strategi Digital Marketing untuk Travel Umrah di Era AI', excerpt: 'Bergabunglah dalam webinar eksklusif bersama praktisi digital marketing.', content: 'Bergabunglah dalam webinar eksklusif bersama praktisi digital marketing dan pelajari cara memanfaatkan AI untuk meningkatkan penjualan paket umrah.', category: 'event', emoji: '🎓', tags: ['Webinar', 'Marketing', 'AI'], author: 'Divisi Event GEZMA', authorRole: 'Organizer', readTime: 2, isOfficial: true, isPublished: true, publishedAt: new Date('2026-02-20T09:00:00Z') },
    { title: '7 Tips Mengelola Keuangan Travel Umrah Agar Tetap Profitable', excerpt: 'Pelajari strategi pengelolaan keuangan yang efektif untuk bisnis travel umrah.', content: 'Pelajari strategi pengelolaan keuangan yang efektif untuk bisnis travel umrah, mulai dari HPP yang tepat hingga manajemen cashflow yang sehat.', category: 'tips', emoji: '💰', tags: ['Keuangan', 'Tips', 'HPP'], author: 'Ir. Bambang Sutrisno', authorRole: 'Financial Consultant', readTime: 8, isPublished: true, publishedAt: new Date('2026-02-19T11:00:00Z') },
    { title: 'WASPADA: Modus Penipuan Berkedok "Travel Umrah Murah" di Media Sosial', excerpt: 'Beberapa kasus penipuan travel umrah kembali marak di media sosial.', content: 'Beberapa kasus penipuan travel umrah kembali marak di media sosial. Kenali ciri-ciri dan cara melindungi calon jemaah Anda dari modus baru ini.', category: 'peringatan', emoji: '🚨', tags: ['Scam', 'Penipuan', 'Keamanan'], author: 'Tim Keamanan GEZMA', authorRole: 'Security', readTime: 6, isBreaking: true, isOfficial: true, isPublished: true, publishedAt: new Date('2026-02-18T15:00:00Z') },
    { title: 'Gathering PPIU Se-Jabodetabek: Networking & Sharing Session', excerpt: 'Acara gathering bulanan untuk para pemilik dan staf travel umrah.', content: 'Acara gathering bulanan untuk para pemilik dan staf travel umrah se-Jabodetabek. Kesempatan untuk networking dan berbagi pengalaman.', category: 'event', emoji: '🤝', tags: ['Gathering', 'Networking', 'PPIU'], author: 'Komunitas GEZMA', authorRole: 'Community', readTime: 2, isOfficial: true, isPublished: true, publishedAt: new Date('2026-02-17T08:30:00Z') },
    { title: 'Panduan Lengkap: Cara Mengurus Izin PPIU Baru di 2026', excerpt: 'Step-by-step guide mengurus izin PPIU sesuai regulasi terbaru.', content: 'Step-by-step guide mengurus izin Penyelenggara Perjalanan Ibadah Umrah (PPIU) sesuai regulasi terbaru Kemenag dan Siskopatuh.', category: 'tips', emoji: '📋', tags: ['PPIU', 'Izin', 'Siskopatuh'], author: 'Dra. Siti Aminah', authorRole: 'Legal Consultant', readTime: 12, isPublished: true, publishedAt: new Date('2026-02-16T13:00:00Z') },
    { title: 'Update Harga Tiket Pesawat Jeddah & Madinah Musim Ramadhan 2026', excerpt: 'Informasi terkini harga tiket pesawat ke Jeddah dan Madinah.', content: 'Informasi terkini harga tiket pesawat ke Jeddah dan Madinah untuk musim Ramadhan 2026. Beberapa maskapai sudah membuka booking.', category: 'regulasi', emoji: '✈️', tags: ['Tiket', 'Ramadhan', 'Maskapai'], author: 'Redaksi Travel', authorRole: 'Editor', readTime: 4, isPublished: true, publishedAt: new Date('2026-02-15T10:00:00Z') },
    { title: 'PERINGATAN: Perubahan Aturan Bagasi untuk Penerbangan ke Saudi Arabia', excerpt: 'Beberapa maskapai mengubah kebijakan bagasi untuk penerbangan ke Arab Saudi.', content: 'Beberapa maskapai mengubah kebijakan bagasi untuk penerbangan ke Arab Saudi. Pastikan jemaah Anda mengetahui aturan baru ini sebelum keberangkatan.', category: 'peringatan', emoji: '🧳', tags: ['Bagasi', 'Maskapai', 'Aturan'], author: 'Tim Operasional', authorRole: 'Operations', readTime: 3, isPublished: true, publishedAt: new Date('2026-02-14T09:00:00Z') },
  ];

  const count = await prisma.newsArticle.count();
  if (count > 0) {
    console.log(`  Skipping news (${count} articles already exist)`);
    return;
  }

  for (let i = 0; i < articles.length; i++) {
    await prisma.newsArticle.create({
      data: { id: S17_IDS.news[i], ...articles[i], createdBy: SYSTEM_ADMIN_ID },
    });
  }
  console.log(`  Created ${articles.length} news articles`);
}

export async function seedTrade(prisma: PrismaClient) {
  console.log('Seeding trade products...');

  const products = [
    { name: 'Rendang Padang Premium', producer: 'CV Minang Jaya', origin: 'Padang, Sumatera Barat', category: 'makanan', description: 'Rendang sapi premium dengan rempah pilihan, dikemas vakum tahan 12 bulan.', emoji: '🍖', certifications: ['Halal MUI', 'BPOM', 'ISO 22000'], rating: 4.9, inquiryCount: 245, moq: '500 pcs', targetMarkets: ['Malaysia', 'Singapura', 'Brunei'], price: 'USD 3.50/pcs', status: 'active' },
    { name: 'Kopi Luwak Arabika', producer: 'PT Kopi Nusantara', origin: 'Gayo, Aceh', category: 'makanan', description: 'Kopi luwak arabika grade A dari dataran tinggi Gayo.', emoji: '☕', certifications: ['Halal MUI', 'Organic', 'Fair Trade'], rating: 4.8, inquiryCount: 189, moq: '100 kg', targetMarkets: ['Jepang', 'Korea Selatan', 'UEA'], price: 'USD 85/kg', status: 'active' },
    { name: 'Sambal Matah Bali', producer: 'UD Bali Rasa', origin: 'Denpasar, Bali', category: 'makanan', description: 'Sambal matah otentik Bali dalam jar kaca premium.', emoji: '🌶️', certifications: ['Halal MUI', 'BPOM'], rating: 4.6, inquiryCount: 132, moq: '300 jar', targetMarkets: ['Australia', 'Singapura'], price: 'USD 2.80/jar', status: 'active' },
    { name: 'Teh Herbal Jawa', producer: 'CV Herba Sehat', origin: 'Solo, Jawa Tengah', category: 'makanan', description: 'Teh herbal blend jahe, temulawak, dan sereh.', emoji: '🍵', certifications: ['Halal MUI', 'BPOM', 'Organic'], rating: 4.5, inquiryCount: 98, moq: '1000 box', targetMarkets: ['Malaysia', 'Brunei', 'UEA'], price: 'USD 1.20/box', status: 'active' },
    { name: 'Manggis Super Grade A', producer: 'PT Tropis Indonesia', origin: 'Tasikmalaya, Jawa Barat', category: 'buah', description: 'Manggis segar grade A dengan ukuran seragam.', emoji: '🟣', certifications: ['GAP', 'Phytosanitary'], rating: 4.7, inquiryCount: 167, moq: '1 ton', targetMarkets: ['Tiongkok', 'Hongkong', 'Jepang'], price: 'USD 4.50/kg', status: 'active' },
    { name: 'Salak Pondoh Sleman', producer: 'Koperasi Tani Maju', origin: 'Sleman, Yogyakarta', category: 'buah', description: 'Salak pondoh manis tanpa sepat dari lereng Merapi.', emoji: '🥥', certifications: ['GAP', 'Organic'], rating: 4.4, inquiryCount: 78, moq: '500 kg', targetMarkets: ['Singapura', 'Malaysia'], price: 'USD 3.00/kg', status: 'active' },
    { name: 'Pisang Cavendish Premium', producer: 'PT Lampung Agri', origin: 'Lampung, Sumatera', category: 'buah', description: 'Pisang cavendish kualitas ekspor dengan standar internasional.', emoji: '🍌', certifications: ['GlobalGAP', 'Phytosanitary'], rating: 4.6, inquiryCount: 203, moq: '5 ton', targetMarkets: ['Jepang', 'Korea Selatan', 'Tiongkok'], price: 'USD 0.80/kg', status: 'active' },
    { name: 'Hijab Voal Premium', producer: 'CV Hijab Nusantara', origin: 'Bandung, Jawa Barat', category: 'fashion', description: 'Hijab voal printing premium dengan motif eksklusif batik kontemporer.', emoji: '🧕', certifications: ['SNI Tekstil'], rating: 4.8, inquiryCount: 312, moq: '200 pcs', targetMarkets: ['Malaysia', 'Brunei', 'Turki'], price: 'USD 5.50/pcs', status: 'active' },
    { name: 'Gamis Batik Modern', producer: 'Rumah Batik Pekalongan', origin: 'Pekalongan, Jawa Tengah', category: 'fashion', description: 'Gamis batik tulis modern dengan cutting kontemporer.', emoji: '👗', certifications: ['Batikmark', 'SNI Tekstil'], rating: 4.7, inquiryCount: 156, moq: '50 pcs', targetMarkets: ['UEA', 'Arab Saudi', 'Turki'], price: 'USD 25/pcs', status: 'active' },
    { name: 'Mukena Bordir Tasik', producer: 'UD Bordir Indah', origin: 'Tasikmalaya, Jawa Barat', category: 'fashion', description: 'Mukena dengan bordir tangan khas Tasikmalaya.', emoji: '🤍', certifications: ['SNI Tekstil'], rating: 4.5, inquiryCount: 89, moq: '100 pcs', targetMarkets: ['Malaysia', 'Singapura'], price: 'USD 12/pcs', status: 'active' },
    { name: 'Skincare Set Halal', producer: 'PT Cantik Alami', origin: 'Jakarta', category: 'kosmetik', description: 'Set skincare halal 4-in-1: cleanser, toner, serum, moisturizer.', emoji: '✨', certifications: ['Halal MUI', 'BPOM', 'Cruelty Free'], rating: 4.6, inquiryCount: 278, moq: '200 set', targetMarkets: ['Malaysia', 'UEA', 'Turki'], price: 'USD 15/set', status: 'active' },
    { name: 'Lip Matte Halal Series', producer: 'CV Beauty Halal', origin: 'Surabaya, Jawa Timur', category: 'kosmetik', description: 'Lipstik matte halal dengan 12 pilihan warna.', emoji: '💄', certifications: ['Halal MUI', 'BPOM'], rating: 4.4, inquiryCount: 145, moq: '500 pcs', targetMarkets: ['Malaysia', 'Brunei'], price: 'USD 4/pcs', status: 'active' },
    { name: 'Body Lotion Susu Kambing', producer: 'PT Herba Kosmetik', origin: 'Bogor, Jawa Barat', category: 'kosmetik', description: 'Body lotion premium dengan kandungan susu kambing etawa dan madu.', emoji: '🧴', certifications: ['Halal MUI', 'BPOM', 'Dermatologist Tested'], rating: 4.3, inquiryCount: 67, moq: '300 botol', targetMarkets: ['Singapura', 'Malaysia'], price: 'USD 3.50/botol', status: 'pending' },
    { name: 'Wayang Kulit Handmade', producer: 'Sanggar Seni Jawa', origin: 'Surakarta, Jawa Tengah', category: 'kerajinan', description: 'Wayang kulit handmade oleh pengrajin bersertifikat.', emoji: '🎭', certifications: ['Handicraft Mark', 'UNESCO Heritage'], rating: 4.9, inquiryCount: 112, moq: '20 pcs', targetMarkets: ['Jepang', 'Belanda', 'Australia'], price: 'USD 45/pcs', status: 'active' },
    { name: 'Tas Rotan Lombok', producer: 'Koperasi Anyaman Lombok', origin: 'Lombok, NTB', category: 'kerajinan', description: 'Tas rotan anyaman tangan khas Lombok.', emoji: '👜', certifications: ['Fair Trade', 'Eco Friendly'], rating: 4.7, inquiryCount: 234, moq: '50 pcs', targetMarkets: ['Australia', 'Jepang', 'Eropa'], price: 'USD 18/pcs', status: 'active' },
    { name: 'Ukiran Kayu Jepara', producer: 'CV Jepara Carving', origin: 'Jepara, Jawa Tengah', category: 'kerajinan', description: 'Ukiran kayu jati premium karya pengrajin Jepara.', emoji: '🪵', certifications: ['SVLK', 'Handicraft Mark'], rating: 4.8, inquiryCount: 76, moq: '10 pcs', targetMarkets: ['UEA', 'Arab Saudi', 'Turki'], price: 'USD 120/pcs', status: 'active' },
    { name: 'Sajadah Tenun Premium', producer: 'CV Tenun Berkah', origin: 'Majalaya, Jawa Barat', category: 'ibadah', description: 'Sajadah tenun premium dengan motif masjid Al-Aqsa.', emoji: '🕌', certifications: ['SNI Tekstil', 'Halal MUI'], rating: 4.6, inquiryCount: 198, moq: '200 pcs', targetMarkets: ['Arab Saudi', 'UEA', 'Malaysia'], price: 'USD 8/pcs', status: 'active' },
    { name: 'Tasbih Kayu Kokka', producer: 'UD Berkah Makmur', origin: 'Kalimantan Selatan', category: 'ibadah', description: 'Tasbih 99 butir dari kayu kokka asli Kalimantan.', emoji: '📿', certifications: ['Handicraft Mark'], rating: 4.5, inquiryCount: 87, moq: '100 pcs', targetMarkets: ['Arab Saudi', 'Turki'], price: 'USD 15/pcs', status: 'active' },
    { name: 'Al-Quran Custom Cover', producer: 'PT Syaamil Quran', origin: 'Bandung, Jawa Barat', category: 'ibadah', description: 'Al-Quran dengan cover custom dan nama pemesan.', emoji: '📖', certifications: ['Kemenag RI', 'Halal MUI'], rating: 4.9, inquiryCount: 321, moq: '100 pcs', targetMarkets: ['Malaysia', 'Brunei', 'Singapura', 'UEA'], price: 'USD 6/pcs', status: 'rejected' },
    { name: 'Peci Songkok Nasional', producer: 'CV Songkok Gresik', origin: 'Gresik, Jawa Timur', category: 'ibadah', description: 'Songkok hitam nasional grade premium.', emoji: '🎩', certifications: ['SNI Tekstil'], rating: 4.4, inquiryCount: 156, moq: '200 pcs', targetMarkets: ['Malaysia', 'Brunei'], price: 'USD 3.50/pcs', status: 'active' },
  ];

  const count = await prisma.tradeProduct.count();
  if (count > 0) {
    console.log(`  Skipping trade (${count} products already exist)`);
    return;
  }

  for (let i = 0; i < products.length; i++) {
    await prisma.tradeProduct.create({
      data: {
        id: S17_IDS.trade[i],
        ...products[i],
        agencyId: AGENCY_ID,
        submittedBy: OWNER_ID,
        submitterName: 'Ahmad Fauzi',
      },
    });
  }
  console.log(`  Created ${products.length} trade products`);
}

export async function seedSession17(prisma: PrismaClient) {
  console.log('\n--- Session 17 Seed: Marketplace, Forum, News, Trade ---\n');
  await seedMarketplace(prisma);
  await seedForum(prisma);
  await seedNews(prisma);
  await seedTrade(prisma);
}
