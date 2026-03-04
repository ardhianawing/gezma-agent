/**
 * Seed academy quizzes for original 12 courses from seed.ts
 *
 * Each quiz has 5 questions with 4 options. All in Bahasa Indonesia.
 */

import type { PrismaClient } from '../src/generated/prisma/client';

interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  order: number;
}

interface QuizData {
  id: string;
  courseId: string;
  title: string;
  passScore: number;
  questions: QuizQuestion[];
}

// Course IDs from seed.ts (original 12 courses use sequential IDs)
// We need to look up by title since seed.ts generates UUIDs
const QUIZ_DATA: Omit<QuizData, 'courseId'>[] = [
  {
    id: '00000000-0000-4000-a000-000000000710',
    title: 'Quiz: Dasar Manajemen Umrah',
    passScore: 70,
    questions: [
      { question: 'Apa dokumen utama yang wajib dimiliki jemaah untuk berangkat umrah?', options: ['KTP saja', 'Paspor dengan masa berlaku minimal 6 bulan', 'SIM Internasional', 'Kartu keluarga'], correctIndex: 1, order: 1 },
      { question: 'Siapa pihak yang berwenang mengeluarkan izin PPIU di Indonesia?', options: ['Kemenlu', 'Kemenag', 'Kemenkumham', 'Kemenhub'], correctIndex: 1, order: 2 },
      { question: 'Berapa jumlah minimal peserta dalam satu keberangkatan grup umrah?', options: ['5 orang', '10 orang', '15 orang', '20 orang'], correctIndex: 0, order: 3 },
      { question: 'Apa fungsi manifest dalam operasional umrah?', options: ['Daftar harga paket', 'Daftar nama jemaah beserta data lengkap per keberangkatan', 'Laporan keuangan', 'Daftar vendor'], correctIndex: 1, order: 4 },
      { question: 'Apa yang dimaksud dengan muthawwif?', options: ['Supir bus', 'Pembimbing ibadah jemaah di Tanah Suci', 'Petugas bandara', 'Agen tiket pesawat'], correctIndex: 1, order: 5 },
    ],
  },
  {
    id: '00000000-0000-4000-a000-000000000711',
    title: 'Quiz: Proses Visa Umrah',
    passScore: 70,
    questions: [
      { question: 'Melalui sistem apa proses visa umrah Saudi Arabia saat ini diproses?', options: ['Sistem manual kedutaan', 'Sistem Nusuk (e-visa)', 'Sistem imigrasi Indonesia', 'Sistem UNHCR'], correctIndex: 1, order: 1 },
      { question: 'Berapa lama masa berlaku visa umrah Saudi Arabia?', options: ['30 hari', '90 hari', '180 hari', '1 tahun'], correctIndex: 1, order: 2 },
      { question: 'Dokumen apa yang diperlukan untuk pengajuan visa umrah?', options: ['Paspor, foto, bukti vaksinasi', 'KTP dan KK', 'SKCK dan surat domisili', 'Ijazah dan CV'], correctIndex: 0, order: 3 },
      { question: 'Siapa yang bertanggung jawab atas pengajuan visa umrah ke Muassasah?', options: ['Jemaah sendiri', 'Travel agent/PPIU', 'Kedutaan Indonesia', 'Kemenag'], correctIndex: 1, order: 4 },
      { question: 'Apa yang terjadi jika visa umrah ditolak?', options: ['Jemaah otomatis dideportasi', 'Travel agent mengajukan ulang atau refund', 'Tidak ada solusi', 'Jemaah harus menikah dengan warga Saudi'], correctIndex: 1, order: 5 },
    ],
  },
  {
    id: '00000000-0000-4000-a000-000000000712',
    title: 'Quiz: Handling Bandara',
    passScore: 70,
    questions: [
      { question: 'Berapa jam sebelum keberangkatan sebaiknya jemaah tiba di bandara?', options: ['1 jam', '2 jam', '3-4 jam', '6 jam'], correctIndex: 2, order: 1 },
      { question: 'Apa yang dimaksud dengan handling agent di bandara?', options: ['Tukang parkir pesawat', 'Petugas yang mengurus proses check-in dan boarding jemaah', 'Petugas keamanan', 'Pilot pesawat'], correctIndex: 1, order: 2 },
      { question: 'Dokumen apa yang harus disiapkan saat check-in bandara untuk umrah?', options: ['Tiket, paspor, dan visa', 'KTP saja', 'Boarding pass saja', 'Surat keterangan RT'], correctIndex: 0, order: 3 },
      { question: 'Berapa batas maksimal berat bagasi kabin umumnya pada penerbangan umrah?', options: ['3 kg', '7 kg', '15 kg', '23 kg'], correctIndex: 1, order: 4 },
      { question: 'Apa yang harus dilakukan jika ada jemaah yang kehilangan paspor di bandara?', options: ['Abaikan dan lanjutkan penerbangan', 'Koordinasi dengan airport security dan imigrasi', 'Suruh jemaah pulang', 'Beli paspor baru di bandara'], correctIndex: 1, order: 5 },
    ],
  },
  {
    id: '00000000-0000-4000-a000-000000000713',
    title: 'Quiz: Panduan Manasik',
    passScore: 70,
    questions: [
      { question: 'Apa rukun umrah yang pertama?', options: ['Tawaf', 'Ihram', "Sa'i", 'Tahallul'], correctIndex: 1, order: 1 },
      { question: 'Berapa kali putaran tawaf yang harus dilakukan saat umrah?', options: ['3 kali', '5 kali', '7 kali', '9 kali'], correctIndex: 2, order: 2 },
      { question: "Sa'i dilakukan antara bukit apa?", options: ['Tursina dan Uhud', 'Shafa dan Marwa', 'Arafah dan Mina', 'Nur dan Rahmah'], correctIndex: 1, order: 3 },
      { question: 'Apa yang dimaksud dengan tahallul?', options: ['Membaca talbiyah', 'Mencukur atau memotong rambut setelah selesai umrah', 'Memakai ihram', 'Berdo\'a di Multazam'], correctIndex: 1, order: 4 },
      { question: 'Dari mana jamaah yang datang dari Madinah harus berihram?', options: ['Yalamlam', 'Qarnul Manazil', 'Dzul Hulaifah (Bir Ali)', 'Juhfah'], correctIndex: 2, order: 5 },
    ],
  },
  {
    id: '00000000-0000-4000-a000-000000000714',
    title: "Quiz: Doa & Dzikir Umrah",
    passScore: 70,
    questions: [
      { question: 'Apa bacaan talbiyah yang dibaca saat ihram?', options: ['Bismillah', 'Labbaikallahumma labbaik...', 'Allahu Akbar', 'Subhanallah'], correctIndex: 1, order: 1 },
      { question: 'Kapan waktu yang mustajab untuk berdoa saat tawaf?', options: ['Saat di depan pintu Ka\'bah', 'Antara Rukun Yamani dan Hajar Aswad', 'Saat duduk di Hijr Ismail', 'Saat berjalan cepat'], correctIndex: 1, order: 2 },
      { question: 'Doa apa yang dibaca saat minum air zamzam?', options: ['Doa qunut', 'Doa sesuai hajat masing-masing', 'Tidak ada doa khusus', 'Doa iftitah'], correctIndex: 1, order: 3 },
      { question: 'Apa bacaan yang dianjurkan saat memasuki Masjidil Haram?', options: ['Doa masuk masjid + doa melihat Ka\'bah', 'Doa qunut', 'Surat Al-Fatihah 7 kali', 'Istighfar 100 kali'], correctIndex: 0, order: 4 },
      { question: "Saat sa'i, doa khusus dibaca di bukit mana?", options: ['Hanya di Marwa', 'Di Shafa dan Marwa', 'Tidak ada doa khusus di bukit', 'Hanya di Shafa'], correctIndex: 1, order: 5 },
    ],
  },
  {
    id: '00000000-0000-4000-a000-000000000715',
    title: 'Quiz: Fiqih Ibadah Umrah',
    passScore: 70,
    questions: [
      { question: 'Apa hukum umrah menurut mayoritas ulama?', options: ['Wajib sekali seumur hidup', 'Sunnah muakkadah', 'Mubah', 'Makruh'], correctIndex: 0, order: 1 },
      { question: 'Apa yang membatalkan ihram?', options: ['Makan dan minum', 'Memakai wewangian, memotong kuku, atau mencabut rambut', 'Berbicara', 'Tidur'], correctIndex: 1, order: 2 },
      { question: 'Apa dam yang harus dibayar jika melanggar larangan ihram?', options: ['Puasa 3 hari', 'Menyembelih kambing, atau puasa 3 hari, atau memberi makan 6 orang miskin', 'Membaca istighfar 1000 kali', 'Mengulangi umrah'], correctIndex: 1, order: 3 },
      { question: 'Bolehkah wanita haid melakukan tawaf?', options: ['Boleh tanpa syarat', 'Tidak boleh, harus menunggu suci', 'Boleh dengan wudhu saja', 'Boleh jika memakai pembalut'], correctIndex: 1, order: 4 },
      { question: 'Berapa jarak minimal antara dua umrah menurut sebagian ulama?', options: ['Tidak ada batasan', 'Minimal setelah rambut tumbuh kembali', '1 tahun', '40 hari'], correctIndex: 1, order: 5 },
    ],
  },
  {
    id: '00000000-0000-4000-a000-000000000716',
    title: 'Quiz: Digital Marketing Travel',
    passScore: 70,
    questions: [
      { question: 'Platform media sosial mana yang paling efektif untuk marketing umrah ke target Gen Z?', options: ['Facebook saja', 'LinkedIn', 'TikTok dan Instagram Reels', 'Twitter/X'], correctIndex: 2, order: 1 },
      { question: 'Apa keuntungan utama SEO untuk website travel umrah?', options: ['Hasil langsung dalam 1 hari', 'Traffic organik jangka panjang dari calon jemaah', 'Tidak perlu konten berkualitas', 'Gratis tanpa effort'], correctIndex: 1, order: 2 },
      { question: 'Apa itu retargeting dalam digital marketing?', options: ['Mengubah target pasar', 'Menampilkan iklan ulang kepada pengunjung yang pernah melihat', 'Menarget kompetitor', 'Menghapus iklan lama'], correctIndex: 1, order: 3 },
      { question: 'Konten jenis apa yang paling efektif untuk meningkatkan trust calon jemaah?', options: ['Iklan diskon besar', 'Testimoni dan review dari jemaah sebelumnya', 'Foto stock generic', 'Teks panjang tanpa visual'], correctIndex: 1, order: 4 },
      { question: 'Apa yang dimaksud dengan CPA dalam digital advertising?', options: ['Content Per Article', 'Cost Per Acquisition — biaya per konversi', 'Click Per Ad', 'Campaign Performance Analysis'], correctIndex: 1, order: 5 },
    ],
  },
  {
    id: '00000000-0000-4000-a000-000000000717',
    title: 'Quiz: Manajemen Keuangan',
    passScore: 70,
    questions: [
      { question: 'Apa komponen HPP terbesar dalam paket umrah?', options: ['Visa', 'Tiket pesawat', 'Catering', 'Souvenir'], correctIndex: 1, order: 1 },
      { question: 'Apa yang dimaksud dengan trust account dalam bisnis travel?', options: ['Rekening gaji', 'Rekening terpisah untuk menyimpan dana jemaah', 'Rekening pinjaman', 'Rekening investasi'], correctIndex: 1, order: 2 },
      { question: 'Berapa margin yang umumnya sehat untuk paket umrah reguler?', options: ['1-3%', '5-15%', '25-30%', '50%+'], correctIndex: 1, order: 3 },
      { question: 'Apa risiko utama jika dana jemaah dicampur dengan dana operasional?', options: ['Tidak ada risiko', 'Pelanggaran regulasi dan potensi gagal berangkatkan jemaah', 'Keuntungan lebih besar', 'Administrasi lebih mudah'], correctIndex: 1, order: 4 },
      { question: 'Kapan waktu terbaik untuk membeli tiket pesawat umrah agar mendapat harga optimal?', options: ['H-1 keberangkatan', '3-6 bulan sebelum keberangkatan', 'Setelah jemaah berangkat', 'Tidak berpengaruh'], correctIndex: 1, order: 5 },
    ],
  },
  {
    id: '00000000-0000-4000-a000-000000000718',
    title: 'Quiz: Pricing Strategy',
    passScore: 70,
    questions: [
      { question: 'Apa faktor utama yang mempengaruhi harga paket umrah?', options: ['Warna brosur', 'Musim (peak/off-peak), bintang hotel, dan maskapai', 'Jumlah karyawan travel', 'Logo perusahaan'], correctIndex: 1, order: 1 },
      { question: 'Apa strategi pricing yang tepat saat low season umrah?', options: ['Naikkan harga 50%', 'Berikan early bird discount dan value-added package', 'Tutup penjualan', 'Tidak perlu strategi khusus'], correctIndex: 1, order: 2 },
      { question: 'Apa yang dimaksud dengan published price vs nett price?', options: ['Sama saja', 'Published = harga jual ke konsumen, nett = harga dasar dari vendor', 'Published = harga vendor, nett = harga jual', 'Keduanya untuk internal'], correctIndex: 1, order: 3 },
      { question: 'Bagaimana cara menentukan harga paket VIP yang tepat?', options: ['2x harga reguler', 'Kalkulasi HPP dengan komponen premium + margin sesuai value', 'Tanya kompetitor', 'Estimasi tanpa kalkulasi'], correctIndex: 1, order: 4 },
      { question: 'Apa risiko dari pricing terlalu murah (predatory pricing)?', options: ['Jemaah senang', 'Cash flow negatif, kualitas turun, dan potensi gagal operasional', 'Tidak ada risiko', 'Kompetitor akan ikut murah'], correctIndex: 1, order: 5 },
    ],
  },
  {
    id: '00000000-0000-4000-a000-000000000719',
    title: 'Quiz: Tutorial Kelola Jamaah',
    passScore: 70,
    questions: [
      { question: 'Di menu mana Anda bisa menambahkan jemaah baru di sistem GEZMA?', options: ['Dashboard', 'Jemaah > Tambah Jemaah', 'Settings', 'Laporan'], correctIndex: 1, order: 1 },
      { question: 'Status apa yang menandakan jemaah sudah membayar DP?', options: ['Lead', 'DP', 'Lunas', 'Ready'], correctIndex: 1, order: 2 },
      { question: 'Bagaimana cara assign jemaah ke trip keberangkatan?', options: ['Otomatis oleh sistem', 'Di halaman detail jemaah, pilih trip', 'Melalui email', 'Tidak bisa dilakukan'], correctIndex: 1, order: 3 },
      { question: 'Fitur apa yang digunakan untuk mengubah status banyak jemaah sekaligus?', options: ['Edit satu per satu', 'Bulk Actions', 'Import CSV', 'Export CSV'], correctIndex: 1, order: 4 },
      { question: 'Bagaimana cara melihat riwayat pembayaran jemaah?', options: ['Di halaman laporan', 'Di detail jemaah tab pembayaran', 'Di settings', 'Tidak tersedia'], correctIndex: 1, order: 5 },
    ],
  },
  {
    id: '00000000-0000-4000-a000-000000000720',
    title: 'Quiz: Tutorial Laporan',
    passScore: 70,
    questions: [
      { question: 'Ada berapa tab laporan di sistem GEZMA?', options: ['2 tab', '3 tab', '5 tab', '7 tab'], correctIndex: 2, order: 1 },
      { question: 'Tab apa yang menampilkan conversion funnel jemaah?', options: ['Keuangan', 'Demografi', 'Dokumen', 'Funnel'], correctIndex: 3, order: 2 },
      { question: 'Format file apa yang dihasilkan saat export laporan?', options: ['PDF', 'CSV (UTF-8 BOM)', 'Excel (.xlsx)', 'Word (.docx)'], correctIndex: 1, order: 3 },
      { question: 'Apa yang ditampilkan di tab Aging?', options: ['Umur jemaah', 'Piutang berdasarkan durasi (0-30, 31-60, 61-90, 90+ hari)', 'Usia paket', 'Lama operasional'], correctIndex: 1, order: 4 },
      { question: 'Bagaimana cara mengatur laporan otomatis (scheduled reports)?', options: ['Tidak bisa', 'Settings > Laporan Terjadwal', 'Hubungi support', 'Via email manual'], correctIndex: 1, order: 5 },
    ],
  },
  {
    id: '00000000-0000-4000-a000-000000000721',
    title: 'Quiz: Tutorial Keuangan',
    passScore: 70,
    questions: [
      { question: 'Di mana Anda bisa melihat total revenue dan outstanding di GEZMA?', options: ['Settings', 'Laporan tab Keuangan', 'Dashboard saja', 'Tidak tersedia'], correctIndex: 1, order: 1 },
      { question: 'Apa yang dimaksud dengan collection rate?', options: ['Jumlah jemaah', 'Persentase pembayaran yang sudah diterima vs total tagihan', 'Jumlah trip', 'Biaya operasional'], correctIndex: 1, order: 2 },
      { question: 'Bagaimana cara membuat invoice/kwitansi untuk jemaah?', options: ['Buat manual di Word', 'Di detail jemaah, klik Generate Invoice', 'Tidak ada fitur ini', 'Via email'], correctIndex: 1, order: 3 },
      { question: 'Fitur apa yang digunakan untuk menghitung HPP paket?', options: ['Kalkulator HP', 'HPP Calculator di halaman buat paket', 'Excel terpisah', 'Estimasi manual'], correctIndex: 1, order: 4 },
      { question: 'Jenis pembayaran apa saja yang didukung sistem?', options: ['DP saja', 'DP, Cicilan, Pelunasan, dan Refund', 'Hanya lunas', 'Transfer bank saja'], correctIndex: 1, order: 5 },
    ],
  },
];

// Map course titles used in the original seed.ts to find the course IDs
const COURSE_TITLE_MAP: Record<string, string> = {
  'Quiz: Dasar Manajemen Umrah': 'Dasar Manajemen Umrah',
  'Quiz: Proses Visa Umrah': 'Proses Visa Umrah',
  'Quiz: Handling Bandara': 'Handling Bandara & Penerbangan',
  'Quiz: Panduan Manasik': 'Panduan Manasik Lengkap',
  "Quiz: Doa & Dzikir Umrah": "Doa & Dzikir Umrah",
  'Quiz: Fiqih Ibadah Umrah': 'Fiqih Ibadah Umrah',
  'Quiz: Digital Marketing Travel': 'Digital Marketing Travel',
  'Quiz: Manajemen Keuangan': 'Manajemen Keuangan Umrah',
  'Quiz: Pricing Strategy': 'Pricing Strategy',
  'Quiz: Tutorial Kelola Jamaah': 'Tutorial: Kelola Jamaah',
  'Quiz: Tutorial Laporan': 'Tutorial: Laporan & Analitik',
  'Quiz: Tutorial Keuangan': 'Tutorial: Keuangan',
};

export async function seedAcademyQuizzes(prisma: any) {
  console.log('\n--- Seed: Academy Quizzes for Original 12 Courses ---\n');

  for (const quizData of QUIZ_DATA) {
    // Check if quiz already exists
    const existing = await prisma.academyQuiz.findUnique({ where: { id: quizData.id } });
    if (existing) {
      continue;
    }

    // Find the course by title
    const courseTitle = COURSE_TITLE_MAP[quizData.title];
    if (!courseTitle) {
      console.log(`  Skipping ${quizData.title} — no course title mapping`);
      continue;
    }

    const course = await prisma.academyCourse.findFirst({
      where: { title: { contains: courseTitle.split(':')[0].trim() } },
    });

    if (!course) {
      console.log(`  Skipping ${quizData.title} — course not found: ${courseTitle}`);
      continue;
    }

    // Check if this course already has a quiz
    const existingQuiz = await prisma.academyQuiz.findFirst({
      where: { courseId: course.id },
    });
    if (existingQuiz) {
      continue;
    }

    await prisma.academyQuiz.create({
      data: {
        id: quizData.id,
        courseId: course.id,
        title: quizData.title,
        passScore: quizData.passScore,
        questions: {
          create: quizData.questions,
        },
      },
    });
    console.log(`  Created quiz: ${quizData.title}`);
  }

  console.log('  Done seeding academy quizzes');
}
