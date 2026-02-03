export interface ServiceItem {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: 'support' | 'tools' | 'exclusive';
  isNew?: boolean;
  isPremium?: boolean;
  link?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: string;
}

export const serviceCategories = [
  { id: 'support', label: 'Dukungan', icon: '🎧', color: '#2563EB' },
  { id: 'tools', label: 'Tools & Fitur', icon: '🛠️', color: '#059669' },
  { id: 'exclusive', label: 'Eksklusif Member', icon: '⭐', color: '#D97706' },
];

export const services: ServiceItem[] = [
  // SUPPORT
  {
    id: 'srv-1',
    title: 'Live Chat Support',
    description: 'Chat langsung dengan tim support GEZMA. Tersedia 24/7 untuk membantu pertanyaan dan kendala Anda.',
    icon: '💬',
    category: 'support',
  },
  {
    id: 'srv-2',
    title: 'WhatsApp Business',
    description: 'Hubungi kami via WhatsApp untuk respons cepat. Kirim dokumen, screenshot, dan konsultasi langsung.',
    icon: '📱',
    category: 'support',
  },
  {
    id: 'srv-3',
    title: 'Email Support',
    description: 'Kirim pertanyaan detail via email. Tim kami akan merespons dalam 1x24 jam kerja.',
    icon: '📧',
    category: 'support',
  },
  {
    id: 'srv-4',
    title: 'Video Call Consultation',
    description: 'Jadwalkan sesi konsultasi video dengan tim ahli GEZMA untuk diskusi mendalam.',
    icon: '📹',
    category: 'support',
    isPremium: true,
  },

  // TOOLS
  {
    id: 'srv-5',
    title: 'Kalkulator HPP',
    description: 'Hitung Harga Pokok Penjualan paket umrah dengan akurat. Include komponen hotel, tiket, visa, dll.',
    icon: '🧮',
    category: 'tools',
  },
  {
    id: 'srv-6',
    title: 'Generator Manifest',
    description: 'Buat manifest jemaah otomatis. Export ke Excel, PDF, dan format Siskopatuh.',
    icon: '📋',
    category: 'tools',
  },
  {
    id: 'srv-7',
    title: 'Template Dokumen',
    description: 'Download template kontrak, SOP, marketing kit, dan dokumen operasional lainnya.',
    icon: '📄',
    category: 'tools',
  },
  {
    id: 'srv-8',
    title: 'API Integration',
    description: 'Integrasikan sistem Anda dengan GEZMA API. Akses data hotel, harga, dan booking.',
    icon: '🔌',
    category: 'tools',
    isNew: true,
    isPremium: true,
  },

  // EXCLUSIVE
  {
    id: 'srv-9',
    title: 'Harga Khusus Member',
    description: 'Dapatkan harga spesial untuk hotel, visa, dan handling dari vendor partner GEZMA.',
    icon: '💰',
    category: 'exclusive',
  },
  {
    id: 'srv-10',
    title: 'Early Access Allotment',
    description: 'Akses lebih awal untuk allotment hotel peak season dan Ramadhan.',
    icon: '🎫',
    category: 'exclusive',
    isPremium: true,
  },
  {
    id: 'srv-11',
    title: 'Training & Sertifikasi',
    description: 'Program pelatihan eksklusif untuk upgrade skill tim Anda. Sertifikat resmi GEZMA.',
    icon: '🎓',
    category: 'exclusive',
  },
  {
    id: 'srv-12',
    title: 'Dedicated Account Manager',
    description: 'Personal account manager untuk membantu kebutuhan bisnis Anda secara prioritas.',
    icon: '👔',
    category: 'exclusive',
    isPremium: true,
  },
];

export const faqs: FAQItem[] = [
  {
    id: 'faq-1',
    question: 'Bagaimana cara mendaftar sebagai member GEZMA?',
    answer: 'Anda dapat mendaftar melalui halaman Register dengan melengkapi data PPIU/PIHK Anda. Setelah verifikasi dokumen (1-2 hari kerja), akun Anda akan aktif.',
    category: 'Akun',
  },
  {
    id: 'faq-2',
    question: 'Apakah GEZMA hanya untuk PPIU terdaftar?',
    answer: 'Ya, GEZMA khusus untuk PPIU dan PIHK yang terdaftar resmi di Kemenag. Kami memverifikasi nomor SK untuk memastikan keamanan komunitas.',
    category: 'Akun',
  },
  {
    id: 'faq-3',
    question: 'Bagaimana cara menggunakan Marketplace?',
    answer: 'Masuk ke menu Marketplace, pilih kategori (Hotel, Visa, Bus, dll), bandingkan harga dan review, lalu hubungi vendor untuk booking.',
    category: 'Fitur',
  },
  {
    id: 'faq-4',
    question: 'Apakah transaksi di Marketplace dijamin aman?',
    answer: 'Semua vendor di Marketplace sudah terverifikasi. Namun, transaksi dilakukan langsung antara Anda dan vendor. Kami menyediakan sistem review untuk transparansi.',
    category: 'Fitur',
  },
  {
    id: 'faq-5',
    question: 'Bagaimana cara upgrade ke Premium Member?',
    answer: 'Hubungi tim sales kami via WhatsApp atau Live Chat untuk informasi paket Premium dan benefit eksklusifnya.',
    category: 'Membership',
  },
  {
    id: 'faq-6',
    question: 'Berapa biaya berlangganan GEZMA?',
    answer: 'GEZMA Basic gratis untuk semua PPIU terdaftar. Untuk fitur Premium, tersedia paket mulai dari Rp 500.000/bulan.',
    category: 'Membership',
  },
];

export const contactInfo = {
  whatsapp: '+62 812-3456-7890',
  email: 'support@gezma.id',
  phone: '(021) 1234-5678',
  address: 'Gedung GEZMA, Jl. Haji Nawi No. 123, Jakarta Selatan 12420',
  operationalHours: 'Senin - Jumat, 08:00 - 17:00 WIB',
};
