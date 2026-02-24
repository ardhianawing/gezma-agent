export interface HelpFAQ {
  id: string;
  category: string;
  question: string;
  answer: string;
}

export const helpCategories = [
  'Akun & Login',
  'Jamaah',
  'Paket & Perjalanan',
  'Pembayaran',
  'Fitur Lainnya',
];

export const helpFAQs: HelpFAQ[] = [
  // === Akun & Login ===
  {
    id: 'faq-01',
    category: 'Akun & Login',
    question: 'Bagaimana cara mendaftar akun baru di GEZMA?',
    answer: 'Kunjungi halaman register, isi nama agensi, email, dan password. Setelah mendaftar, Anda akan menerima email verifikasi. Klik link di email tersebut untuk mengaktifkan akun Anda.',
  },
  {
    id: 'faq-02',
    category: 'Akun & Login',
    question: 'Saya lupa password, bagaimana cara resetnya?',
    answer: 'Klik "Lupa Password" di halaman login. Masukkan email yang terdaftar, dan Anda akan menerima link reset password melalui email. Link tersebut berlaku selama 1 jam.',
  },
  {
    id: 'faq-03',
    category: 'Akun & Login',
    question: 'Bagaimana cara menambah user/staf baru di agensi?',
    answer: 'Buka menu Pengaturan > Tim. Klik "Tambah Anggota", isi data user baru termasuk nama, email, dan role (admin, staf, marketing). User baru akan menerima undangan via email.',
  },
  {
    id: 'faq-04',
    category: 'Akun & Login',
    question: 'Apakah bisa mengubah email akun yang sudah terdaftar?',
    answer: 'Saat ini email akun tidak dapat diubah secara langsung. Silakan hubungi tim support GEZMA untuk bantuan perubahan email akun.',
  },
  {
    id: 'faq-05',
    category: 'Akun & Login',
    question: 'Bagaimana cara mengaktifkan Two-Factor Authentication (2FA)?',
    answer: 'Buka menu Pengaturan > Keamanan. Klik "Aktifkan 2FA", scan QR code menggunakan aplikasi authenticator (Google Authenticator/Authy), lalu masukkan kode OTP untuk verifikasi.',
  },

  // === Jamaah ===
  {
    id: 'faq-06',
    category: 'Jamaah',
    question: 'Bagaimana cara menambah data jamaah baru?',
    answer: 'Buka menu Jamaah di sidebar, lalu klik tombol "Tambah Jamaah". Isi semua data yang diperlukan seperti nama, NIK, alamat, kontak, dan data darurat. Klik "Simpan" untuk menyimpan data.',
  },
  {
    id: 'faq-07',
    category: 'Jamaah',
    question: 'Bagaimana cara mengupload dokumen jamaah (KTP, paspor, dll)?',
    answer: 'Buka halaman detail jamaah, scroll ke bagian "Dokumen". Klik tombol upload pada jenis dokumen yang ingin diupload (KTP, paspor, foto, visa, surat kesehatan). Format yang didukung: JPG, PNG, PDF. Maksimal ukuran 5MB.',
  },
  {
    id: 'faq-08',
    category: 'Jamaah',
    question: 'Bagaimana cara mengubah status jamaah?',
    answer: 'Buka halaman detail jamaah. Pada bagian info utama, terdapat dropdown status (Lead, DP, Lunas, Dokumen, Visa, Ready, Departed, Completed). Pilih status baru dan perubahan akan tersimpan otomatis.',
  },
  {
    id: 'faq-09',
    category: 'Jamaah',
    question: 'Apakah bisa export data jamaah ke Excel?',
    answer: 'Ya, buka halaman daftar Jamaah, lalu klik tombol "Export" di bagian atas. Data akan diunduh dalam format CSV yang bisa dibuka di Excel atau Google Sheets.',
  },
  {
    id: 'faq-10',
    category: 'Jamaah',
    question: 'Bagaimana cara mengelompokkan jamaah ke dalam trip/perjalanan?',
    answer: 'Buka halaman detail jamaah, lalu pilih Trip pada dropdown "Assign Trip". Atau buka halaman Trip, pilih trip yang diinginkan, lalu tambahkan jamaah ke trip tersebut.',
  },

  // === Paket & Perjalanan ===
  {
    id: 'faq-11',
    category: 'Paket & Perjalanan',
    question: 'Bagaimana cara membuat paket umrah baru?',
    answer: 'Buka menu Paket di sidebar, klik "Tambah Paket". Isi informasi paket termasuk nama, kategori, durasi, maskapai, hotel, itinerary harian, dan detail harga (HPP + margin). Klik "Simpan" setelah selesai.',
  },
  {
    id: 'faq-12',
    category: 'Paket & Perjalanan',
    question: 'Bagaimana cara membuat trip/keberangkatan baru?',
    answer: 'Buka menu Trips di sidebar, klik "Buat Trip". Pilih paket yang akan digunakan, tentukan tanggal keberangkatan dan kepulangan, kuota jamaah, dan detail lainnya. Trip yang sudah dibuat bisa di-assign jamaah.',
  },
  {
    id: 'faq-13',
    category: 'Paket & Perjalanan',
    question: 'Apakah bisa mengatur harga promo untuk paket tertentu?',
    answer: 'Ya, buka halaman detail paket, aktifkan toggle "Promo", lalu isi harga promo dan periode promo. Harga promo akan ditampilkan dengan coret harga normal di halaman paket.',
  },
  {
    id: 'faq-14',
    category: 'Paket & Perjalanan',
    question: 'Bagaimana cara mengelola itinerary perjalanan?',
    answer: 'Pada halaman detail paket, scroll ke bagian "Itinerary". Anda bisa menambah, mengedit, atau menghapus jadwal per hari. Setiap hari bisa berisi multiple aktivitas dengan waktu dan deskripsi.',
  },
  {
    id: 'faq-15',
    category: 'Paket & Perjalanan',
    question: 'Bagaimana cara menggunakan Package Builder?',
    answer: 'Buka menu Paket, klik "Builder Paket Modular". Pilih komponen paket secara bertahap: penerbangan, hotel Makkah, hotel Madinah, dan visa/handling. Sistem akan menghitung total harga secara otomatis.',
  },

  // === Pembayaran ===
  {
    id: 'faq-16',
    category: 'Pembayaran',
    question: 'Bagaimana cara mencatat pembayaran jamaah?',
    answer: 'Buka halaman detail jamaah, scroll ke bagian "Riwayat Pembayaran". Klik "Tambah Pembayaran", isi jumlah, tipe (DP/cicilan/lunas/refund), metode (transfer/cash/kartu), dan tanggal pembayaran.',
  },
  {
    id: 'faq-17',
    category: 'Pembayaran',
    question: 'Apakah bisa melihat laporan keuangan secara keseluruhan?',
    answer: 'Ya, buka menu Reports/Laporan di sidebar. Anda bisa melihat ringkasan pendapatan, pembayaran masuk, piutang, dan grafik keuangan. Data bisa difilter berdasarkan periode waktu.',
  },
  {
    id: 'faq-18',
    category: 'Pembayaran',
    question: 'Bagaimana cara menangani refund pembayaran?',
    answer: 'Buka halaman detail jamaah, pada bagian pembayaran klik "Tambah Pembayaran" dengan tipe "Refund". Masukkan jumlah refund (nilai negatif akan otomatis dikurangi dari total bayar).',
  },
  {
    id: 'faq-19',
    category: 'Pembayaran',
    question: 'Apakah ada notifikasi untuk pembayaran yang belum lunas?',
    answer: 'Ya, sistem akan menampilkan indikator pada dashboard untuk jamaah yang masih memiliki sisa pembayaran. Anda juga bisa mengatur pengingat email otomatis melalui menu Pengaturan > Notifikasi.',
  },
  {
    id: 'faq-20',
    category: 'Pembayaran',
    question: 'Bagaimana cara melihat rincian HPP (Harga Pokok Penjualan)?',
    answer: 'Buka halaman detail paket, scroll ke bagian "Rincian Harga". Di sana terlihat breakdown HPP per komponen (hotel, tiket, visa, handling, dll), margin, dan harga jual akhir.',
  },

  // === Fitur Lainnya ===
  {
    id: 'faq-21',
    category: 'Fitur Lainnya',
    question: 'Bagaimana cara menggunakan AI Assistant?',
    answer: 'Klik ikon chat (bubble) di pojok kanan bawah. AI Assistant bisa membantu menjawab pertanyaan operasional, memberikan saran, dan membantu navigasi fitur GEZMA. Cukup ketik pertanyaan Anda.',
  },
  {
    id: 'faq-22',
    category: 'Fitur Lainnya',
    question: 'Apakah GEZMA mendukung mode gelap (dark mode)?',
    answer: 'Ya, klik ikon tema di header (matahari/bulan) untuk beralih antara mode terang dan mode gelap. Preferensi tema akan tersimpan dan berlaku di semua halaman.',
  },
  {
    id: 'faq-23',
    category: 'Fitur Lainnya',
    question: 'Bagaimana cara mengubah branding/warna agensi?',
    answer: 'Buka menu Pengaturan > Branding. Anda bisa mengubah warna primer, logo, favicon, dan judul aplikasi. Perubahan branding akan langsung terlihat di seluruh dashboard.',
  },
  {
    id: 'faq-24',
    category: 'Fitur Lainnya',
    question: 'Apakah GEZMA bisa diakses di HP/tablet?',
    answer: 'Ya, GEZMA sudah responsive dan bisa diakses di semua perangkat. Selain itu, GEZMA juga mendukung PWA (Progressive Web App) sehingga bisa di-install seperti aplikasi native di smartphone.',
  },
  {
    id: 'faq-25',
    category: 'Fitur Lainnya',
    question: 'Bagaimana cara melihat aktivitas log/riwayat perubahan?',
    answer: 'Buka menu Pengaturan > Activity Log. Di sana tercatat semua aktivitas yang dilakukan oleh user di agensi Anda, termasuk waktu, user, dan detail perubahan.',
  },
];
