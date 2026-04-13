interface FAQEntry {
  keywords: string[];
  patterns: RegExp[];
  answer: string;
  category: string;
}

const FAQ_DATABASE: FAQEntry[] = [
  {
    category: 'umrah',
    keywords: ['umrah', 'umroh', 'harga umrah', 'biaya umrah', 'paket umrah'],
    patterns: [/berapa.*(harga|biaya|cost).*(umrah|umroh)/i, /paket.*(umrah|umroh)/i],
    answer: 'GEZMA menyediakan berbagai paket Umrah untuk travel agent. Harga mulai dari Rp 25 juta untuk paket ekonomi hingga Rp 45 juta untuk paket premium. Setiap paket termasuk visa, penerbangan, hotel, dan makan. Kunjungi halaman Paket untuk detail lengkap atau hubungi admin untuk konsultasi!',
  },
  {
    category: 'haji',
    keywords: ['haji', 'daftar haji', 'antrian haji', 'waiting list haji'],
    patterns: [/daftar.*(haji)/i, /(haji).*(berapa|kapan|antrian)/i],
    answer: 'Pendaftaran Haji reguler melalui Kemenag dengan estimasi keberangkatan 20-25 tahun. GEZMA membantu proses pendaftaran dan persiapan. Untuk Haji Plus (ONH Plus), estimasi 5-7 tahun dengan biaya mulai Rp 150 juta. Hubungi admin untuk info lebih lanjut!',
  },
  {
    category: 'pembayaran',
    keywords: ['bayar', 'pembayaran', 'cicilan', 'tabungan', 'gezmapay', 'paylater'],
    patterns: [/cara.*(bayar|pembayaran)/i, /(cicilan|tabungan|kredit)/i, /gezmapay/i],
    answer: 'GEZMA menyediakan beberapa opsi pembayaran:\n\n- Bayar penuh (transfer/VA)\n- Cicilan via GEZMAPay (0% hingga 12 bulan)\n- Tabungan Umrah (setor rutin bulanan)\n- PayLater (tenor 3-24 bulan)\n\nSemua pembayaran aman dan terverifikasi. Cek menu Pembayaran di app untuk mulai!',
  },
  {
    category: 'dokumen',
    keywords: ['paspor', 'visa', 'dokumen', 'persyaratan', 'syarat'],
    patterns: [/syarat.*(umrah|haji|dokumen)/i, /(paspor|visa|passport).*(buat|bikin|perpanjang)/i],
    answer: 'Dokumen yang diperlukan untuk Umrah:\n\n- Paspor (min. 6 bulan sebelum expired)\n- Foto 4x6 background putih (4 lembar)\n- KTP asli + fotokopi\n- Kartu Keluarga\n- Buku Nikah (jika suami/istri)\n- Surat Mahram (untuk wanita < 45 tahun)\n- Bukti vaksinasi Meningitis\n\nGEZMA akan bantu urus visa dan dokumen lainnya!',
  },
  {
    category: 'manasik',
    keywords: ['manasik', 'persiapan', 'latihan', 'belajar', 'tata cara'],
    patterns: [/manasik/i, /tata.cara.*(umrah|haji)/i, /(persiapan|belajar).*(umrah|haji)/i],
    answer: 'GEZMA menyediakan program Manasik interaktif melalui Gezma Academy:\n\n- Video tutorial tata cara Umrah/Haji\n- Quiz interaktif setiap materi\n- Sertifikat blockchain setelah lulus\n- Grup diskusi dengan pembimbing\n\nAkses Manasik di menu Academy app kamu!',
  },
  {
    category: 'akun',
    keywords: ['daftar', 'register', 'login', 'akun', 'lupa password', 'ganti password'],
    patterns: [/cara.*(daftar|register|login)/i, /lupa.*(password|sandi)/i],
    answer: 'Cara daftar di GEZMA:\n\n1. Kunjungi app GEZMA\n2. Klik "Daftar" dan isi data diri\n3. Verifikasi email\n4. Login dan lengkapi profil\n\nLupa password? Klik "Lupa Password" di halaman login untuk reset via email. Butuh bantuan? Chat admin!',
  },
  {
    category: 'kontak',
    keywords: ['kontak', 'hubungi', 'whatsapp', 'wa', 'telepon', 'email', 'cs', 'customer service'],
    patterns: [/hubungi.*(admin|cs|customer)/i, /(nomor|no).*(wa|whatsapp|telp)/i],
    answer: 'Hubungi tim GEZMA:\n\n- WhatsApp: Klik tombol WA di pojok kanan bawah app\n- Email: cs@gezma.id\n- Jam operasional: Senin-Sabtu, 08:00-21:00 WIB\n\nTim kami siap membantu!',
  },
  {
    category: 'tentang',
    keywords: ['gezma', 'apa itu gezma', 'tentang', 'about'],
    patterns: [/apa.*(itu|sih).*gezma/i, /gezma.*(apa|itu|artinya)/i],
    answer: 'GEZMA (Generasi Z dan Milenial Ashpirasi) adalah platform travel Haji & Umrah yang dirancang khusus untuk generasi muda. Fitur unggulan:\n\n- Paket Umrah terjangkau\n- Pembayaran fleksibel (cicilan/tabungan)\n- Academy & Manasik interaktif\n- Sertifikat blockchain\n- Komunitas sesama jamaah\n\nIbadah jadi lebih mudah dan modern!',
  },
  {
    category: 'marketplace',
    keywords: ['marketplace', 'hotel', 'tiket', 'pesawat', 'asuransi', 'mutawwif', 'bus', 'handling'],
    patterns: [/marketplace/i, /cari.*(hotel|tiket|pesawat)/i, /harga.*(hotel|tiket)/i],
    answer: 'GEZMA Marketplace menyediakan kebutuhan operasional umrah:\n\n- Hotel di Makkah & Madinah (mulai Rp 1.1 juta/malam)\n- Visa umrah regular & express (Rp 400-750 ribu/pax)\n- Bus & Handling di Saudi (Rp 200-500 ribu/pax)\n- Asuransi perjalanan (Rp 150-350 ribu/pax)\n- Mutawwif/Pembimbing (Rp 4-7.5 juta/trip)\n- Tiket Pesawat (Rp 6.5-9.2 juta/pax)\n\nAkses di menu Marketplace!',
  },
  {
    category: 'nusuk',
    keywords: ['nusuk', 'kemenag', 'ppiu', 'pihk', 'izin', 'regulasi'],
    patterns: [/nusuk/i, /ppiu/i, /kemenag/i],
    answer: 'Nusuk adalah sistem resmi dari Kementerian Haji dan Umrah Saudi Arabia untuk pengelolaan visa dan perjalanan umrah. Semua PPIU wajib terdaftar di sistem Nusuk.\n\nPPIU (Penyelenggara Perjalanan Ibadah Umrah) adalah biro perjalanan berizin resmi dari Kemenag RI. GEZMA membantu PPIU/PIHK dalam mengelola operasional bisnis travel umrah mereka.',
  },
  {
    category: 'fitur',
    keywords: ['fitur', 'feature', 'bisa apa', 'fungsi'],
    patterns: [/fitur.*(gezma|app|aplikasi)/i, /(gezma|app).*(bisa|buat).*(apa)/i],
    answer: 'Fitur utama GEZMA:\n\n1. Dashboard - overview statistik bisnis\n2. Jamaah - database & tracking jamaah\n3. Paket - kelola paket umrah\n4. Perjalanan - jadwal & manifest\n5. Dokumen - template & penyimpanan\n6. Marketplace - hotel, visa, tiket, dll\n7. Forum - komunitas travel agent\n8. Berita - update regulasi & industri\n9. Academy - kursus & sertifikasi\n10. Pembayaran - cicilan, tabungan, PayLater\n\nSemua dalam satu platform!',
  },
];

export function findFAQAnswer(question: string): string | null {
  const q = question.toLowerCase().trim();

  // Check patterns first (more precise)
  for (const faq of FAQ_DATABASE) {
    for (const pattern of faq.patterns) {
      if (pattern.test(q)) {
        return faq.answer;
      }
    }
  }

  // Check keyword matches (need at least 2 keyword hits or 1 exact multi-word phrase)
  let bestMatch: FAQEntry | null = null;
  let bestScore = 0;

  for (const faq of FAQ_DATABASE) {
    let score = 0;
    for (const keyword of faq.keywords) {
      if (q.includes(keyword.toLowerCase())) {
        score += keyword.split(' ').length; // multi-word keywords score higher
      }
    }
    if (score > bestScore && score >= 2) {
      bestScore = score;
      bestMatch = faq;
    }
  }

  return bestMatch?.answer || null;
}
