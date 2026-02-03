export type CourseCategory = 'semua' | 'regulasi' | 'operasional' | 'marketing' | 'keuangan' | 'sertifikasi';
export type CourseLevel = 'pemula' | 'menengah' | 'lanjutan';

export interface Course {
  id: string;
  title: string;
  description: string;
  category: CourseCategory;
  level: CourseLevel;
  instructor: string;
  instructorRole: string;
  duration: string;
  lessons: number;
  students: number;
  rating: number;
  reviewCount: number;
  thumbnail: string;
  isFree?: boolean;
  isNew?: boolean;
  isBestSeller?: boolean;
  price?: number;
  progress?: number;
  tags: string[];
}

export interface LearningPath {
  id: string;
  title: string;
  description: string;
  courses: number;
  duration: string;
  icon: string;
  color: string;
}

export const courseCategories = [
  { id: 'semua', label: 'Semua', icon: '📚' },
  { id: 'regulasi', label: 'Regulasi & Compliance', icon: '📜', color: '#2563EB' },
  { id: 'operasional', label: 'Operasional', icon: '⚙️', color: '#059669' },
  { id: 'marketing', label: 'Marketing & Sales', icon: '📈', color: '#D97706' },
  { id: 'keuangan', label: 'Keuangan', icon: '💰', color: '#7C3AED' },
  { id: 'sertifikasi', label: 'Sertifikasi', icon: '🎓', color: '#DC2626' },
];

export const learningPaths: LearningPath[] = [
  {
    id: 'path-1',
    title: 'PPIU Starter Kit',
    description: 'Panduan lengkap untuk memulai bisnis travel umrah dari nol',
    courses: 5,
    duration: '8 jam',
    icon: '🚀',
    color: '#2563EB',
  },
  {
    id: 'path-2',
    title: 'Operasional Mastery',
    description: 'Kuasai handling jamaah dari A-Z dengan standar profesional',
    courses: 7,
    duration: '12 jam',
    icon: '⚙️',
    color: '#059669',
  },
  {
    id: 'path-3',
    title: 'Digital Marketing Pro',
    description: 'Strategi pemasaran digital khusus industri travel umrah',
    courses: 6,
    duration: '10 jam',
    icon: '📱',
    color: '#D97706',
  },
  {
    id: 'path-4',
    title: 'Financial Expert',
    description: 'Kelola keuangan travel umrah dengan sistem yang benar',
    courses: 4,
    duration: '6 jam',
    icon: '💹',
    color: '#7C3AED',
  },
];

export const courses: Course[] = [
  // REGULASI
  {
    id: 'course-1',
    title: 'Memahami Sistem Nusuk: Panduan Lengkap 2026',
    description: 'Pelajari semua tentang sistem Nusuk terbaru dari Saudi Arabia. Mencakup proses registrasi, pengajuan visa, tracking status, dan troubleshooting masalah umum.',
    category: 'regulasi',
    level: 'pemula',
    instructor: 'Tim Regulasi GEZMA',
    instructorRole: 'Official',
    duration: '2.5 jam',
    lessons: 12,
    students: 1247,
    rating: 4.9,
    reviewCount: 342,
    thumbnail: '🕋',
    isFree: true,
    isBestSeller: true,
    tags: ['Nusuk', 'Visa', 'Saudi'],
  },
  {
    id: 'course-2',
    title: 'Regulasi PPIU & PIHK: Update Terkini Kemenag',
    description: 'Pahami regulasi terbaru dari Kemenag untuk PPIU dan PIHK. Termasuk persyaratan izin, pelaporan, dan standar operasional yang wajib dipenuhi.',
    category: 'regulasi',
    level: 'pemula',
    instructor: 'Drs. Ahmad Hidayat',
    instructorRole: 'Mantan Kasubdit Umrah Kemenag',
    duration: '3 jam',
    lessons: 15,
    students: 892,
    rating: 4.8,
    reviewCount: 234,
    thumbnail: '📋',
    isNew: true,
    tags: ['Kemenag', 'PPIU', 'Regulasi'],
  },
  {
    id: 'course-3',
    title: 'Siskopatuh Mastery: Pelaporan Tanpa Ribet',
    description: 'Tutorial lengkap menggunakan sistem Siskopatuh untuk pelaporan keberangkatan dan kepulangan jamaah. Tips agar laporan tidak ditolak.',
    category: 'regulasi',
    level: 'menengah',
    instructor: 'Siti Rahmawati',
    instructorRole: 'Praktisi PPIU',
    duration: '1.5 jam',
    lessons: 8,
    students: 654,
    rating: 4.7,
    reviewCount: 178,
    thumbnail: '📊',
    isFree: true,
    tags: ['Siskopatuh', 'Pelaporan', 'Kemenag'],
  },

  // OPERASIONAL
  {
    id: 'course-4',
    title: 'Handling Jamaah Profesional: Dari Bandara Sampai Pulang',
    description: 'Pelajari SOP handling jamaah yang benar mulai dari briefing pra-keberangkatan, handling di bandara, selama di tanah suci, hingga kepulangan.',
    category: 'operasional',
    level: 'pemula',
    instructor: 'Ustadz Hasan Basri',
    instructorRole: 'Mutawwif Senior',
    duration: '4 jam',
    lessons: 20,
    students: 2341,
    rating: 4.9,
    reviewCount: 567,
    thumbnail: '✈️',
    isBestSeller: true,
    price: 299000,
    tags: ['Handling', 'SOP', 'Jamaah'],
  },
  {
    id: 'course-5',
    title: 'Manasik Umrah: Panduan Bimbingan Lengkap',
    description: 'Materi lengkap untuk membimbing jamaah melaksanakan umrah dengan benar. Dilengkapi video demonstrasi dan checklist.',
    category: 'operasional',
    level: 'pemula',
    instructor: 'Ustadz Ahmad Zarkasyi',
    instructorRole: 'Pembimbing Ibadah',
    duration: '3.5 jam',
    lessons: 18,
    students: 1876,
    rating: 4.9,
    reviewCount: 445,
    thumbnail: '🕌',
    price: 199000,
    tags: ['Manasik', 'Ibadah', 'Bimbingan'],
  },
  {
    id: 'course-6',
    title: 'Mengatasi Masalah Operasional di Lapangan',
    description: 'Kumpulan studi kasus dan solusi untuk masalah operasional yang sering terjadi: jamaah sakit, dokumen hilang, hotel overbook, dll.',
    category: 'operasional',
    level: 'lanjutan',
    instructor: 'Rizky Pratama',
    instructorRole: 'Tour Leader Senior',
    duration: '2 jam',
    lessons: 10,
    students: 743,
    rating: 4.8,
    reviewCount: 189,
    thumbnail: '🔧',
    price: 249000,
    tags: ['Problem Solving', 'Studi Kasus', 'Tips'],
  },

  // MARKETING
  {
    id: 'course-7',
    title: 'Digital Marketing untuk Travel Umrah',
    description: 'Strategi pemasaran digital yang efektif untuk travel umrah: social media, content marketing, iklan berbayar, dan lead generation.',
    category: 'marketing',
    level: 'pemula',
    instructor: 'Dewi Kartika',
    instructorRole: 'Digital Marketing Expert',
    duration: '5 jam',
    lessons: 25,
    students: 1543,
    rating: 4.8,
    reviewCount: 387,
    thumbnail: '📱',
    isBestSeller: true,
    price: 399000,
    tags: ['Digital Marketing', 'Social Media', 'Ads'],
  },
  {
    id: 'course-8',
    title: 'Copywriting Paket Umrah yang Menjual',
    description: 'Teknik menulis deskripsi paket umrah yang menarik dan mengkonversi. Termasuk template siap pakai untuk berbagai jenis paket.',
    category: 'marketing',
    level: 'menengah',
    instructor: 'Budi Setiawan',
    instructorRole: 'Content Strategist',
    duration: '2 jam',
    lessons: 10,
    students: 876,
    rating: 4.7,
    reviewCount: 213,
    thumbnail: '✍️',
    price: 199000,
    tags: ['Copywriting', 'Content', 'Sales'],
  },
  {
    id: 'course-9',
    title: 'Closing Techniques: Ubah Prospek Jadi Jamaah',
    description: 'Teknik closing penjualan yang etis dan efektif. Cara menangani keberatan, follow up, dan membangun trust dengan calon jamaah.',
    category: 'marketing',
    level: 'menengah',
    instructor: 'Umar Farouk',
    instructorRole: 'Sales Trainer',
    duration: '3 jam',
    lessons: 15,
    students: 1234,
    rating: 4.8,
    reviewCount: 298,
    thumbnail: '🤝',
    price: 349000,
    tags: ['Sales', 'Closing', 'Negotiation'],
  },

  // KEUANGAN
  {
    id: 'course-10',
    title: 'Menghitung HPP Paket Umrah dengan Benar',
    description: 'Panduan lengkap menghitung Harga Pokok Penjualan paket umrah. Termasuk semua komponen biaya dan margin yang wajar.',
    category: 'keuangan',
    level: 'pemula',
    instructor: 'Ahmad Fauzan',
    instructorRole: 'Financial Consultant',
    duration: '2.5 jam',
    lessons: 12,
    students: 1654,
    rating: 4.9,
    reviewCount: 423,
    thumbnail: '🧮',
    isFree: true,
    isBestSeller: true,
    tags: ['HPP', 'Pricing', 'Keuangan'],
  },
  {
    id: 'course-11',
    title: 'Manajemen Cashflow Travel Umrah',
    description: 'Cara mengelola arus kas travel umrah agar bisnis tetap sehat. Kapan membayar vendor, mengelola DP jamaah, dan reserve fund.',
    category: 'keuangan',
    level: 'menengah',
    instructor: 'Ir. Hendra Wijaya',
    instructorRole: 'Business Consultant',
    duration: '3 jam',
    lessons: 14,
    students: 789,
    rating: 4.7,
    reviewCount: 167,
    thumbnail: '💵',
    price: 299000,
    tags: ['Cashflow', 'Manajemen', 'Keuangan'],
  },

  // SERTIFIKASI
  {
    id: 'course-12',
    title: 'Sertifikasi Tour Leader Umrah GEZMA',
    description: 'Program sertifikasi resmi GEZMA untuk tour leader umrah. Lulus ujian dan dapatkan sertifikat yang diakui industri.',
    category: 'sertifikasi',
    level: 'lanjutan',
    instructor: 'Tim Sertifikasi GEZMA',
    instructorRole: 'Official',
    duration: '10 jam',
    lessons: 40,
    students: 456,
    rating: 4.9,
    reviewCount: 123,
    thumbnail: '🎓',
    isNew: true,
    price: 1500000,
    tags: ['Sertifikasi', 'Tour Leader', 'Official'],
  },
];

export const academyStats = {
  totalCourses: 12,
  totalStudents: 5420,
  totalHours: 45,
  completionRate: 87,
};
