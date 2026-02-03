export type NewsCategory = 'semua' | 'regulasi' | 'pengumuman' | 'event' | 'tips' | 'peringatan';

export interface NewsArticle {
  id: string;
  title: string;
  excerpt: string;
  category: NewsCategory;
  author: string;
  authorRole: string;
  publishedAt: string;
  readTime: string;
  isFeatured?: boolean;
  isBreaking?: boolean;
  tags: string[];
  imageEmoji: string;
}

export const newsCategories = [
  { id: 'semua', label: 'Semua', icon: '📰' },
  { id: 'regulasi', label: 'Regulasi', icon: '📜', color: '#2563EB' },
  { id: 'pengumuman', label: 'Pengumuman', icon: '📢', color: '#7C3AED' },
  { id: 'event', label: 'Event', icon: '📅', color: '#059669' },
  { id: 'tips', label: 'Tips & Artikel', icon: '💡', color: '#D97706' },
  { id: 'peringatan', label: 'Peringatan', icon: '⚠️', color: '#DC2626' },
];

export const newsArticles: NewsArticle[] = [
  // FEATURED / BREAKING
  {
    id: 'news-1',
    title: 'Update Sistem Nusuk 2026: Perubahan Besar yang Wajib Diketahui Semua PPIU',
    excerpt: 'Kementerian Haji dan Umrah Saudi Arabia resmi mengumumkan pembaruan besar pada sistem Nusuk yang berlaku mulai 1 Maret 2026. Perubahan mencakup proses visa, kuota, dan persyaratan baru.',
    category: 'regulasi',
    author: 'Tim Redaksi GEZMA',
    authorRole: 'Official',
    publishedAt: '2026-02-03T08:00:00',
    readTime: '8 menit',
    isFeatured: true,
    isBreaking: true,
    tags: ['Nusuk', 'Regulasi', 'Saudi'],
    imageEmoji: '🕋',
  },
  {
    id: 'news-2',
    title: 'GEZMA Marketplace Resmi Diluncurkan: Belanja Kebutuhan Umrah Jadi Lebih Mudah',
    excerpt: 'Fitur Marketplace GEZMA kini tersedia untuk semua anggota. Travel agent dapat mencari dan membandingkan hotel, visa, transportasi, dan layanan umrah lainnya dalam satu platform.',
    category: 'pengumuman',
    author: 'Tim GEZMA',
    authorRole: 'Official',
    publishedAt: '2026-02-01T10:00:00',
    readTime: '5 menit',
    isFeatured: true,
    tags: ['Marketplace', 'Fitur Baru', 'GEZMA'],
    imageEmoji: '🛒',
  },

  // REGULAR
  {
    id: 'news-3',
    title: 'Saudi Buka Visa Umrah untuk 6 Negara Baru Mulai Februari 2026',
    excerpt: 'Pemerintah Saudi Arabia memperluas akses visa umrah ke 6 negara baru di Asia dan Afrika. Langkah ini diperkirakan meningkatkan jumlah jemaah umrah global.',
    category: 'regulasi',
    author: 'Ahmad Zulfikar',
    authorRole: 'Editor',
    publishedAt: '2026-02-01T07:00:00',
    readTime: '4 menit',
    tags: ['Visa', 'Saudi', 'Umrah'],
    imageEmoji: '✈️',
  },
  {
    id: 'news-4',
    title: 'Webinar GEZMA: Strategi Meningkatkan Penjualan Paket Umrah di Era Digital',
    excerpt: 'Ikuti webinar gratis bersama praktisi marketing travel umrah. Pelajari teknik digital marketing, social media strategy, dan conversion optimization.',
    category: 'event',
    author: 'Tim Event GEZMA',
    authorRole: 'Official',
    publishedAt: '2026-01-30T09:00:00',
    readTime: '3 menit',
    tags: ['Webinar', 'Marketing', 'Digital'],
    imageEmoji: '🎓',
  },
  {
    id: 'news-5',
    title: '5 Kesalahan Fatal dalam Menghitung HPP Paket Umrah dan Cara Menghindarinya',
    excerpt: 'Banyak travel agent yang merugi karena salah menghitung HPP. Artikel ini membahas 5 kesalahan paling umum dan solusi praktis menggunakan kalkulator HPP GEZMA.',
    category: 'tips',
    author: 'Ustadz Hasan Basri',
    authorRole: 'Kontributor',
    publishedAt: '2026-01-28T14:00:00',
    readTime: '10 menit',
    tags: ['HPP', 'Tips', 'Keuangan'],
    imageEmoji: '📊',
  },
  {
    id: 'news-6',
    title: 'Waspada Penipuan Berkedok Allotment Hotel Makkah Musim Ramadhan',
    excerpt: 'GEZMA menerima laporan adanya oknum yang menawarkan allotment hotel di Makkah untuk musim Ramadhan dengan harga sangat murah. Berikut ciri-ciri dan cara menghindarinya.',
    category: 'peringatan',
    author: 'Tim Keamanan GEZMA',
    authorRole: 'Official',
    publishedAt: '2026-01-27T11:00:00',
    readTime: '6 menit',
    tags: ['Penipuan', 'Hotel', 'Waspada'],
    imageEmoji: '🚨',
  },
  {
    id: 'news-7',
    title: 'Panduan Lengkap: Cara Menggunakan Fitur Manifest Otomatis GEZMA',
    excerpt: 'Fitur manifest otomatis GEZMA memudahkan travel agent menyusun daftar jemaah, assign kamar hotel, dan cetak dokumen perjalanan. Berikut panduan lengkapnya.',
    category: 'tips',
    author: 'Tim Produk GEZMA',
    authorRole: 'Official',
    publishedAt: '2026-01-25T10:00:00',
    readTime: '7 menit',
    tags: ['Manifest', 'Tutorial', 'GEZMA'],
    imageEmoji: '📋',
  },
  {
    id: 'news-8',
    title: 'Perubahan Tarif Handling Bandara Jeddah Mulai April 2026',
    excerpt: 'Otoritas bandara Jeddah mengumumkan penyesuaian tarif handling untuk penerbangan umrah mulai April 2026. Berikut rincian perubahan dan dampaknya pada HPP.',
    category: 'regulasi',
    author: 'Ahmad Zulfikar',
    authorRole: 'Editor',
    publishedAt: '2026-01-23T08:00:00',
    readTime: '5 menit',
    tags: ['Handling', 'Jeddah', 'Tarif'],
    imageEmoji: '🛫',
  },
  {
    id: 'news-9',
    title: 'GEZMA Gathering 2026: Silaturahmi & Networking Travel Umrah se-Indonesia',
    excerpt: 'Catat tanggalnya! GEZMA Gathering 2026 akan diadakan di Jakarta pada 15 Maret 2026. Acara networking terbesar untuk travel agent umrah.',
    category: 'event',
    author: 'Tim Event GEZMA',
    authorRole: 'Official',
    publishedAt: '2026-01-20T09:00:00',
    readTime: '3 menit',
    tags: ['Gathering', 'Networking', 'Jakarta'],
    imageEmoji: '🤝',
  },
  {
    id: 'news-10',
    title: 'Tips Memilih Asuransi Perjalanan Umrah yang Tepat untuk Jemaah Anda',
    excerpt: 'Pemilihan asuransi perjalanan yang tepat sangat penting. Artikel ini membahas perbandingan coverage, harga, dan proses klaim dari 5 provider asuransi terpopuler.',
    category: 'tips',
    author: 'Dewi Kartika',
    authorRole: 'Kontributor',
    publishedAt: '2026-01-18T13:00:00',
    readTime: '8 menit',
    tags: ['Asuransi', 'Tips', 'Perbandingan'],
    imageEmoji: '🛡️',
  },
];
