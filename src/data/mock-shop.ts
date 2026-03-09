export type ShopCategory = 'semua' | 'ihram' | 'sajadah' | 'oleh-oleh' | 'kesehatan';

export interface ShopProduct {
  id: string;
  name: string;
  price: number;
  category: ShopCategory;
  emoji: string;
  imageUrl?: string;
  description: string;
}

export const shopCategories: { id: ShopCategory; label: string }[] = [
  { id: 'semua', label: 'Semua' },
  { id: 'ihram', label: 'Ihram' },
  { id: 'sajadah', label: 'Sajadah' },
  { id: 'oleh-oleh', label: 'Oleh-oleh' },
  { id: 'kesehatan', label: 'Kesehatan' },
];

export const shopProducts: ShopProduct[] = [
  // Ihram (5)
  {
    id: 'ihram-1',
    name: 'Kain Ihram Premium',
    price: 150000,
    category: 'ihram',
    emoji: '\u{1F9E3}',
    imageUrl: 'https://images.unsplash.com/photo-1620119852054-dcb7744b7c8a?w=400&h=300&fit=crop',
    description: 'Kain ihram premium bahan katun tebal, nyaman dan adem dipakai saat ibadah.',
  },
  {
    id: 'ihram-2',
    name: 'Kain Ihram Standard',
    price: 85000,
    category: 'ihram',
    emoji: '\u{1F9E3}',
    imageUrl: 'https://images.unsplash.com/photo-1620119852054-dcb7744b7c8a?w=400&h=300&fit=crop',
    description: 'Kain ihram standard bahan katun, cocok untuk ibadah umrah dan haji.',
  },
  {
    id: 'ihram-3',
    name: 'Sabuk Ihram',
    price: 45000,
    category: 'ihram',
    emoji: '\u{1F4BC}',
    imageUrl: 'https://images.unsplash.com/photo-1603735198516-755e4ce60384?w=400&h=300&fit=crop',
    description: 'Sabuk ihram dengan kantong tersembunyi untuk menyimpan barang berharga.',
  },
  {
    id: 'ihram-4',
    name: 'Sandal Ihram',
    price: 65000,
    category: 'ihram',
    emoji: '\u{1FA74}',
    imageUrl: 'https://images.unsplash.com/photo-1625318880107-49baad6765fd?w=400&h=300&fit=crop',
    description: 'Sandal khusus ihram, ringan dan nyaman untuk berjalan jauh.',
  },
  {
    id: 'ihram-5',
    name: 'Ikat Pinggang Ihram',
    price: 35000,
    category: 'ihram',
    emoji: '\u{1F4BC}',
    imageUrl: 'https://images.unsplash.com/photo-1603735198516-755e4ce60384?w=400&h=300&fit=crop',
    description: 'Ikat pinggang elastis untuk ihram, mudah dipakai dan tidak merepotkan.',
  },
  // Sajadah (4)
  {
    id: 'sajadah-1',
    name: 'Sajadah Travel Lipat',
    price: 120000,
    category: 'sajadah',
    emoji: '\u{1F9F9}',
    imageUrl: 'https://images.unsplash.com/photo-1630313312052-2699ebbf3374?w=400&h=300&fit=crop',
    description: 'Sajadah travel yang bisa dilipat kecil, mudah dibawa kemana-mana.',
  },
  {
    id: 'sajadah-2',
    name: 'Sajadah Turki Premium',
    price: 350000,
    category: 'sajadah',
    emoji: '\u{1F54C}',
    imageUrl: 'https://plus.unsplash.com/premium_photo-1676446443225-0aadc4ae2aa1?w=400&h=300&fit=crop',
    description: 'Sajadah impor Turki dengan bahan premium dan motif elegan.',
  },
  {
    id: 'sajadah-3',
    name: 'Sajadah Pocket Mini',
    price: 75000,
    category: 'sajadah',
    emoji: '\u{1F45C}',
    imageUrl: 'https://images.unsplash.com/photo-1655438806456-a20a9ac6ba25?w=400&h=300&fit=crop',
    description: 'Sajadah ukuran saku, sangat praktis untuk dibawa saat perjalanan.',
  },
  {
    id: 'sajadah-4',
    name: "Sajadah Motif Ka'bah",
    price: 180000,
    category: 'sajadah',
    emoji: '\u{1F54B}',
    imageUrl: 'https://images.unsplash.com/photo-1630313312052-2699ebbf3374?w=400&h=300&fit=crop',
    description: "Sajadah dengan motif Ka'bah yang indah, cocok sebagai oleh-oleh.",
  },
  // Oleh-oleh (6)
  {
    id: 'oleh-1',
    name: 'Kurma Ajwa 1kg',
    price: 250000,
    category: 'oleh-oleh',
    emoji: '\u{1F334}',
    imageUrl: 'https://images.unsplash.com/photo-1537203374277-c6cf7cebea4a?w=400&h=300&fit=crop',
    description: 'Kurma Ajwa asli Madinah, kualitas terbaik langsung dari kebun.',
  },
  {
    id: 'oleh-2',
    name: 'Air Zamzam 5L',
    price: 185000,
    category: 'oleh-oleh',
    emoji: '\u{1F4A7}',
    imageUrl: 'https://plus.unsplash.com/premium_photo-1681284939219-acfc2faa7eb8?w=400&h=300&fit=crop',
    description: 'Air Zamzam asli dalam kemasan 5 liter, aman untuk dibawa pulang.',
  },
  {
    id: 'oleh-3',
    name: 'Minyak Zaitun 500ml',
    price: 95000,
    category: 'oleh-oleh',
    emoji: '\u{1FAD2}',
    imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400&h=300&fit=crop',
    description: 'Minyak zaitun extra virgin asli Timur Tengah, berkualitas tinggi.',
  },
  {
    id: 'oleh-4',
    name: 'Siwak Asli Madinah',
    price: 25000,
    category: 'oleh-oleh',
    emoji: '\u{1FAB5}',
    imageUrl: 'https://plus.unsplash.com/premium_photo-1758633868310-1d8c0caff14c?w=400&h=300&fit=crop',
    description: 'Siwak asli dari pohon Arak Madinah, sunnah Rasulullah SAW.',
  },
  {
    id: 'oleh-5',
    name: 'Tasbih Kayu 33 Butir',
    price: 45000,
    category: 'oleh-oleh',
    emoji: '\u{1F4FF}',
    imageUrl: 'https://images.unsplash.com/photo-1527999230720-768828d2d0a3?w=400&h=300&fit=crop',
    description: 'Tasbih kayu 33 butir buatan tangan, cocok untuk dzikir harian.',
  },
  {
    id: 'oleh-6',
    name: 'Parfum Arab Non-Alkohol',
    price: 120000,
    category: 'oleh-oleh',
    emoji: '\u{1F9F4}',
    imageUrl: 'https://images.unsplash.com/photo-1669444699729-f55f7cf9f82b?w=400&h=300&fit=crop',
    description: 'Parfum Arab non-alkohol dengan aroma khas Timur Tengah yang tahan lama.',
  },
  // Kesehatan (5)
  {
    id: 'kesehatan-1',
    name: 'Masker N95 (10pcs)',
    price: 85000,
    category: 'kesehatan',
    emoji: '\u{1F637}',
    imageUrl: 'https://images.unsplash.com/photo-1614290501125-d72aeb735c10?w=400&h=300&fit=crop',
    description: 'Masker N95 isi 10 pcs, perlindungan maksimal saat di Tanah Suci.',
  },
  {
    id: 'kesehatan-2',
    name: 'Hand Sanitizer Travel',
    price: 35000,
    category: 'kesehatan',
    emoji: '\u{1F9F4}',
    imageUrl: 'https://images.unsplash.com/photo-1695624825876-7110a459a21a?w=400&h=300&fit=crop',
    description: 'Hand sanitizer ukuran travel 100ml, mudah dibawa kemana-mana.',
  },
  {
    id: 'kesehatan-3',
    name: 'Obat Pribadi Kit',
    price: 150000,
    category: 'kesehatan',
    emoji: '\u{1F48A}',
    imageUrl: 'https://plus.unsplash.com/premium_photo-1677860447055-5ce8092c0d7e?w=400&h=300&fit=crop',
    description: 'Paket obat-obatan pribadi lengkap untuk perjalanan haji dan umrah.',
  },
  {
    id: 'kesehatan-4',
    name: 'Vitamin Haji/Umrah Pack',
    price: 95000,
    category: 'kesehatan',
    emoji: '\u{1F48A}',
    imageUrl: 'https://images.unsplash.com/photo-1763668331599-487470fb85b2?w=400&h=300&fit=crop',
    description: 'Paket vitamin khusus untuk menjaga stamina selama ibadah.',
  },
  {
    id: 'kesehatan-5',
    name: 'Krim Tabir Surya SPF50',
    price: 75000,
    category: 'kesehatan',
    emoji: '\u{2600}\u{FE0F}',
    imageUrl: 'https://images.unsplash.com/photo-1598662972299-5408ddb8a3dc?w=400&h=300&fit=crop',
    description: 'Tabir surya SPF50 untuk melindungi kulit dari sinar matahari gurun.',
  },
];
