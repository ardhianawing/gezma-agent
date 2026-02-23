export type CourseCategory = 'all' | 'operasional' | 'manasik' | 'bisnis' | 'tutorial';
export type CourseLevel = 'all' | 'pemula' | 'menengah' | 'lanjutan';

export interface Course {
  id: string;
  title: string;
  description: string;
  category: Exclude<CourseCategory, 'all'>;
  level: Exclude<CourseLevel, 'all'>;
  instructor: string;
  instructorRole: string;
  emoji: string;
  rating: number;
  reviewCount: number;
  lessonCount: number;
  duration: string;
  enrolled: number;
  isFree: boolean;
  isNew: boolean;
  isPopular: boolean;
  progress: number | null;
  tags: string[];
}

export interface CategoryMeta {
  key: CourseCategory;
  label: string;
  emoji: string;
  color: string;
}

export interface LevelMeta {
  key: CourseLevel;
  label: string;
  color: string;
}

export const categories: CategoryMeta[] = [
  { key: 'all', label: 'Semua', emoji: '📚', color: '#6B7280' },
  { key: 'operasional', label: 'Operasional', emoji: '⚙️', color: '#2563EB' },
  { key: 'manasik', label: 'Manasik & Ibadah', emoji: '🕌', color: '#059669' },
  { key: 'bisnis', label: 'Bisnis & Marketing', emoji: '📈', color: '#D97706' },
  { key: 'tutorial', label: 'Tutorial GEZMA', emoji: '💻', color: '#7C3AED' },
];

export const levels: LevelMeta[] = [
  { key: 'all', label: 'Semua', color: '#6B7280' },
  { key: 'pemula', label: 'Pemula', color: '#059669' },
  { key: 'menengah', label: 'Menengah', color: '#D97706' },
  { key: 'lanjutan', label: 'Lanjutan', color: '#DC2626' },
];

export const academyStats = {
  totalCourses: 48,
  enrolled: 12,
  completed: 5,
  certificates: 3,
};

export const courses: Course[] = [
  {
    id: 'course-001',
    title: 'Dasar-Dasar Manajemen Haji & Umrah',
    description: 'Pelajari fundamental pengelolaan perjalanan haji dan umrah mulai dari perencanaan hingga eksekusi. Cocok untuk pemula yang baru memulai bisnis travel.',
    category: 'operasional',
    level: 'pemula',
    instructor: 'Ustaz Ahmad Fauzi',
    instructorRole: 'Konsultan Travel Haji',
    emoji: '🕋',
    rating: 4.8,
    reviewCount: 234,
    lessonCount: 12,
    duration: '6 jam',
    enrolled: 1245,
    isFree: true,
    isNew: false,
    isPopular: true,
    progress: 75,
    tags: ['haji', 'umrah', 'manajemen', 'dasar'],
  },
  {
    id: 'course-002',
    title: 'Tata Cara Manasik Haji Lengkap',
    description: 'Panduan lengkap tata cara manasik haji dari ihram hingga tahallul. Dilengkapi video praktik dan simulasi di setiap rukun haji.',
    category: 'manasik',
    level: 'pemula',
    instructor: 'Dr. Hj. Siti Aminah',
    instructorRole: 'Pembimbing Haji Senior',
    emoji: '🕌',
    rating: 4.9,
    reviewCount: 567,
    lessonCount: 18,
    duration: '10 jam',
    enrolled: 3200,
    isFree: false,
    isNew: false,
    isPopular: true,
    progress: 30,
    tags: ['manasik', 'haji', 'ibadah', 'rukun'],
  },
  {
    id: 'course-003',
    title: 'Digital Marketing untuk Travel Umrah',
    description: 'Strategi pemasaran digital khusus industri travel umrah. Pelajari cara memanfaatkan sosial media, Google Ads, dan content marketing.',
    category: 'bisnis',
    level: 'menengah',
    instructor: 'Rizky Pratama',
    instructorRole: 'Digital Marketing Specialist',
    emoji: '📱',
    rating: 4.6,
    reviewCount: 189,
    lessonCount: 15,
    duration: '8 jam',
    enrolled: 890,
    isFree: false,
    isNew: true,
    isPopular: false,
    progress: null,
    tags: ['marketing', 'digital', 'sosmed', 'iklan'],
  },
  {
    id: 'course-004',
    title: 'Tutorial GEZMA: Manajemen Jamaah',
    description: 'Kuasai fitur manajemen jamaah di platform GEZMA. Mulai dari input data, pengelompokan, hingga tracking dokumen jamaah.',
    category: 'tutorial',
    level: 'pemula',
    instructor: 'Tim GEZMA',
    instructorRole: 'Product Team',
    emoji: '👥',
    rating: 4.7,
    reviewCount: 312,
    lessonCount: 8,
    duration: '3 jam',
    enrolled: 2100,
    isFree: true,
    isNew: false,
    isPopular: true,
    progress: 100,
    tags: ['gezma', 'jamaah', 'tutorial', 'data'],
  },
  {
    id: 'course-005',
    title: 'Manajemen Keuangan Travel Haji',
    description: 'Pengelolaan keuangan profesional untuk biro travel haji. Mencakup pembukuan, laporan keuangan, dan compliance regulasi PPIU.',
    category: 'bisnis',
    level: 'lanjutan',
    instructor: 'Ir. Budi Santoso, M.M.',
    instructorRole: 'Akuntan Travel Senior',
    emoji: '💰',
    rating: 4.5,
    reviewCount: 98,
    lessonCount: 20,
    duration: '12 jam',
    enrolled: 456,
    isFree: false,
    isNew: false,
    isPopular: false,
    progress: null,
    tags: ['keuangan', 'akuntansi', 'ppiu', 'regulasi'],
  },
  {
    id: 'course-006',
    title: 'Doa & Dzikir Haji dan Umrah',
    description: 'Kumpulan lengkap doa dan dzikir selama perjalanan haji dan umrah. Disertai transliterasi, terjemahan, dan audio bacaan.',
    category: 'manasik',
    level: 'pemula',
    instructor: 'Ustaz Muhammad Ridwan',
    instructorRole: 'Pembimbing Ibadah',
    emoji: '🤲',
    rating: 4.9,
    reviewCount: 721,
    lessonCount: 24,
    duration: '5 jam',
    enrolled: 4500,
    isFree: true,
    isNew: false,
    isPopular: true,
    progress: 0,
    tags: ['doa', 'dzikir', 'haji', 'umrah'],
  },
  {
    id: 'course-007',
    title: 'Tutorial GEZMA: Laporan & Analitik',
    description: 'Pelajari cara membuat dan menganalisis laporan bisnis travel Anda menggunakan fitur reporting canggih di GEZMA.',
    category: 'tutorial',
    level: 'menengah',
    instructor: 'Tim GEZMA',
    instructorRole: 'Product Team',
    emoji: '📊',
    rating: 4.4,
    reviewCount: 145,
    lessonCount: 10,
    duration: '4 jam',
    enrolled: 780,
    isFree: true,
    isNew: true,
    isPopular: false,
    progress: 50,
    tags: ['gezma', 'laporan', 'analitik', 'bisnis'],
  },
  {
    id: 'course-008',
    title: 'Pengurusan Visa & Dokumen Perjalanan',
    description: 'Panduan lengkap mengurus visa haji/umrah, paspor, surat kesehatan, dan dokumen wajib lainnya. Tips agar proses cepat dan lancar.',
    category: 'operasional',
    level: 'menengah',
    instructor: 'Hj. Dewi Kartika',
    instructorRole: 'Manajer Operasional',
    emoji: '📋',
    rating: 4.7,
    reviewCount: 203,
    lessonCount: 14,
    duration: '7 jam',
    enrolled: 1100,
    isFree: false,
    isNew: false,
    isPopular: false,
    progress: null,
    tags: ['visa', 'dokumen', 'paspor', 'administrasi'],
  },
  {
    id: 'course-009',
    title: 'Strategi Pricing Paket Umrah',
    description: 'Cara menentukan harga paket umrah yang kompetitif namun tetap menguntungkan. Analisis biaya, margin, dan positioning di pasar.',
    category: 'bisnis',
    level: 'menengah',
    instructor: 'Andi Wijaya, MBA',
    instructorRole: 'Business Consultant',
    emoji: '🏷️',
    rating: 4.3,
    reviewCount: 76,
    lessonCount: 9,
    duration: '5 jam',
    enrolled: 340,
    isFree: false,
    isNew: true,
    isPopular: false,
    progress: null,
    tags: ['pricing', 'paket', 'umrah', 'strategi'],
  },
  {
    id: 'course-010',
    title: 'Fiqih Haji & Umrah Kontemporer',
    description: 'Pembahasan mendalam tentang fiqih haji dan umrah sesuai perkembangan zaman. Membahas masalah kontemporer dan perbedaan pendapat ulama.',
    category: 'manasik',
    level: 'lanjutan',
    instructor: 'Prof. Dr. KH. Abdul Hakim',
    instructorRole: 'Guru Besar Fiqih',
    emoji: '📖',
    rating: 4.8,
    reviewCount: 156,
    lessonCount: 22,
    duration: '14 jam',
    enrolled: 670,
    isFree: false,
    isNew: false,
    isPopular: false,
    progress: null,
    tags: ['fiqih', 'haji', 'umrah', 'kontemporer'],
  },
  {
    id: 'course-011',
    title: 'Tutorial GEZMA: Keuangan & Invoice',
    description: 'Kelola keuangan travel Anda dengan modul keuangan GEZMA. Buat invoice otomatis, tracking pembayaran, dan rekonsiliasi.',
    category: 'tutorial',
    level: 'pemula',
    instructor: 'Tim GEZMA',
    instructorRole: 'Product Team',
    emoji: '🧾',
    rating: 4.6,
    reviewCount: 198,
    lessonCount: 7,
    duration: '2.5 jam',
    enrolled: 1560,
    isFree: true,
    isNew: false,
    isPopular: false,
    progress: null,
    tags: ['gezma', 'keuangan', 'invoice', 'pembayaran'],
  },
  {
    id: 'course-012',
    title: 'Handling Komplain & Krisis Jamaah',
    description: 'Teknik profesional menangani komplain jamaah dan manajemen krisis di lapangan. Studi kasus nyata dan role-play situasi darurat.',
    category: 'operasional',
    level: 'lanjutan',
    instructor: 'Dra. Nurhayati',
    instructorRole: 'Customer Service Director',
    emoji: '🛡️',
    rating: 4.5,
    reviewCount: 112,
    lessonCount: 11,
    duration: '6 jam',
    enrolled: 520,
    isFree: false,
    isNew: false,
    isPopular: false,
    progress: 15,
    tags: ['komplain', 'krisis', 'jamaah', 'handling'],
  },
];
