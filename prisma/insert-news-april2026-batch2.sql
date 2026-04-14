INSERT INTO news_articles (id, slug, title, excerpt, content, category, emoji, tags, author, "authorRole", "readTime", "isBreaking", "isOfficial", "isFeatured", "isPublished", "publishedAt", "imageUrl", "createdAt", "updatedAt")
VALUES

-- 1. Nusuk Smart Card
(
  gen_random_uuid(),
  'nusuk-card-kartu-pintar-wajib-jamaah-haji-2026-panduan-lengkap',
  'Nusuk Card: Kartu Pintar Wajib untuk Seluruh Jamaah Haji 2026',
  'Saudi Arabia mewajibkan seluruh jamaah haji 2026 membawa Nusuk Card, kartu identitas pintar yang menyimpan data pribadi, medis, dan akomodasi. Simak panduan lengkapnya.',
  E'Kementerian Haji dan Umrah Arab Saudi mewajibkan seluruh jamaah haji 2026 untuk membawa Nusuk Card, sebuah kartu identitas pintar resmi yang berfungsi sebagai akses utama ke seluruh layanan haji.\n\nApa Itu Nusuk Card?\n\nNusuk Card adalah dokumen identifikasi pintar resmi yang diterbitkan oleh Kementerian Haji dan Umrah Saudi Arabia. Kartu ini menggabungkan data pribadi, rekam medis, dan informasi akomodasi dalam satu kredensial yang wajib dibawa selama seluruh durasi ibadah haji.\n\nFungsi Utama Nusuk Card:\n\n1. Akses ke Lokasi Suci - Kartu ini menjadi tiket masuk ke Mina, Arafah, dan Muzdalifah\n2. Verifikasi Legal - Membuktikan bahwa pemegangnya adalah jamaah haji resmi yang terdaftar\n3. Data Medis - Menyimpan rekam medis untuk akses cepat dalam keadaan darurat\n4. Informasi Akomodasi - Berisi alamat hotel di Makkah dan Madinah\n5. Transportasi - Mengatur boarding bus dan transfer kelompok\n6. Tautan ke Penyedia Layanan - Menghubungkan jamaah dengan perusahaan layanan haji yang ditunjuk\n\nSiapa yang Wajib Memiliki?\n\nSeluruh jamaah haji 2026 yang terdaftar wajib membawa kartu ini. Kartu berlaku dari saat kedatangan hingga keberangkatan pulang.\n\nAkses Digital:\n\nSelain kartu fisik, jamaah juga bisa mengakses versi digital melalui:\n- Aplikasi Nusuk: Tersedia secara global untuk semua jamaah terdaftar\n- Aplikasi Tawakkalna: Untuk jamaah yang sudah berada di Saudi Arabia\n\nJika Kartu Hilang:\n\nJika kartu fisik hilang, jamaah dapat:\n- Meminta penerbitan ulang dari ketua rombongan atau penyedia layanan\n- Menggunakan kartu digital via aplikasi Nusuk atau Tawakkalna\n- Mengunjungi Nusuk Care Center secara langsung\n- Menghubungi Unified Call Center di nomor 1966\n\nBagi PPIU, pastikan seluruh jamaah memahami cara menggunakan Nusuk Card dan telah menginstal aplikasi Nusuk sebelum keberangkatan.\n\nSumber: Gulf News, Saudi Ministry of Hajj and Umrah',
  'regulasi',
  E'\U0001F4F3',
  ARRAY['Nusuk Card', 'Kartu Pintar', 'Haji 2026', 'Teknologi', 'Saudi Arabia'],
  'Tim Redaksi GEZMA',
  'Editor',
  6,
  false,
  true,
  true,
  true,
  '2026-04-14T12:00:00Z',
  NULL,
  NOW(),
  NOW()
),

-- 2. Biaya Haji 2026 Turun
(
  gen_random_uuid(),
  'biaya-haji-2026-turun-rp-2-juta-pemerintah-tanggung-kenaikan',
  'Biaya Haji 2026 Turun Rp 2 Juta, Pemerintah Tanggung Kenaikan Operasional',
  'Kabar baik untuk calon jamaah haji! Biaya haji 2026 ditetapkan Rp 54,1 juta per jamaah, turun sekitar Rp 2 juta dari tahun sebelumnya meski biaya avtur naik.',
  E'Pemerintah Indonesia menetapkan Biaya Penyelenggaraan Ibadah Haji (BPIH) tahun 2026 sebesar Rp 54.194.366 per jamaah, turun sekitar Rp 2 juta dari tahun 2025. Keputusan ini disambut positif di tengah kekhawatiran kenaikan biaya akibat fluktuasi harga avtur dan nilai tukar.\n\nRincian Biaya:\n\nTotal biaya penyelenggaraan haji sebenarnya mencapai Rp 87.409.366 per jamaah, namun pemerintah menanggung selisihnya melalui APBN sehingga jamaah hanya membayar Rp 54,1 juta.\n\nKomponen biaya meliputi:\n- Penerbangan (Garuda Indonesia dan Saudia Airlines)\n- Akomodasi di Makkah dan Madinah\n- Katering selama di Saudi Arabia\n- Transportasi darat (bus antar-kota)\n- Layanan kesehatan dan asuransi\n- Biaya operasional dan administrasi\n\nKenapa Bisa Turun?\n\nPresiden Prabowo Subianto secara khusus berpesan agar kenaikan biaya operasional tidak dibebankan kepada jamaah haji. Meski harga avtur mengalami kenaikan signifikan akibat dinamika geopolitik global, pemerintah memilih untuk menyerap kenaikan tersebut.\n\nHidayat Nur Wahid dari MPR mengapresiasi penurunan biaya ini, namun mengingatkan agar kualitas penyelenggaraan haji tetap meningkat sesuai arahan Presiden.\n\nPerbandingan Biaya per Embarkasi:\n\nBiaya bervariasi tergantung embarkasi keberangkatan, karena perbedaan jarak tempuh penerbangan. Jamaah dari embarkasi di Indonesia bagian timur umumnya membayar sedikit lebih tinggi.\n\nJadwal Pelunasan:\n\nCalon jamaah haji 2026 yang telah mendapat nomor porsi dapat melakukan pelunasan sesuai jadwal yang ditetapkan Kementerian Haji dan Umrah melalui bank penerima setoran BPIH.\n\nSumber: Tempo.co, Kementerian Haji dan Umrah RI, MPR RI',
  'regulasi',
  E'\U0001F4B0',
  ARRAY['Biaya Haji', 'BPIH', '2026', 'Prabowo', 'Turun'],
  'Tim Redaksi GEZMA',
  'Editor',
  5,
  false,
  true,
  false,
  true,
  '2026-04-09T08:00:00Z',
  NULL,
  NOW(),
  NOW()
),

-- 3. Umrah Closing Dates Guide for PPIU
(
  gen_random_uuid(),
  'panduan-lengkap-jadwal-penutupan-umrah-2026-untuk-ppiu',
  'Panduan Lengkap Jadwal Penutupan Umrah 2026 untuk PPIU',
  'Musim umrah 2026 resmi berakhir jelang haji. Berikut timeline lengkap yang wajib diketahui setiap PPIU agar jamaah tidak terkena masalah di Saudi.',
  E'Menjelang musim haji 1447 H, pemerintah Saudi Arabia memberlakukan serangkaian penutupan bertahap untuk layanan umrah. Bagi PPIU, memahami timeline ini sangat penting untuk menghindari masalah bagi jamaah yang sedang atau akan berangkat umrah.\n\nTimeline Penutupan Umrah 2026:\n\n1. 19-20 Maret 2026: Batas akhir penerbitan visa umrah untuk musim 1447H. Setelah tanggal ini, tidak ada visa umrah baru yang diterbitkan.\n\n2. 2-3 April 2026: Batas akhir kedatangan di Saudi Arabia dengan visa umrah. Maskapai penerbangan dilarang menerbangkan jamaah umrah setelah tanggal ini, meskipun visa masih berlaku.\n\n3. 13 April 2026: Pembatasan akses masuk Makkah dimulai. Hanya pemegang izin resmi, penduduk Makkah, dan pemegang visa haji yang boleh masuk.\n\n4. 18 April 2026: Deadline keberangkatan jamaah umrah dari Saudi. Semua pemegang visa umrah wajib sudah meninggalkan Kerajaan.\n\n5. 18 April - 31 Mei 2026: Platform Nusuk menghentikan seluruh penerbitan izin umrah.\n\n6. 25-30 Mei 2026: Perkiraan pelaksanaan ibadah haji.\n\n7. 10-11 Juni 2026: Perkiraan pembukaan kembali visa umrah pasca-haji.\n\nYang Perlu Dilakukan PPIU:\n\n- Segera informasikan timeline ini kepada seluruh calon jamaah\n- Pastikan tidak ada jamaah yang masih berada di Saudi setelah 18 April\n- Siapkan rencana keberangkatan kembali (return flight) sebelum deadline\n- Manfaatkan kelonggaran Saudi: visa umrah expired dapat digunakan untuk keluar tanpa denda, asalkan sebelum 18 April\n- Update sistem booking dan informasi di website/app travel agent\n\nKapan Umrah Dibuka Lagi?\n\nPenerbitan visa umrah diperkirakan dibuka kembali sekitar 10-11 Juni 2026, setelah seluruh rangkaian ibadah haji selesai. PPIU sudah bisa mulai mempersiapkan paket umrah pasca-haji dari sekarang.\n\nSumber: Funadiq, UmrahTransit, UmrahCompanions',
  'tips',
  E'\U0001F4C5',
  ARRAY['Penutupan Umrah', 'Timeline', 'PPIU', 'Jadwal', '2026'],
  'Tim Redaksi GEZMA',
  'Editor',
  6,
  false,
  false,
  false,
  true,
  '2026-04-08T10:00:00Z',
  NULL,
  NOW(),
  NOW()
),

-- 4. Saudi Opens Hajj Package Bookings on Nusuk
(
  gen_random_uuid(),
  'saudi-buka-booking-paket-haji-2026-via-nusuk-permintaan-melonjak',
  'Saudi Buka Booking Paket Haji 2026 via Nusuk, Permintaan Melonjak Tajam',
  'Kementerian Haji Saudi membuka pemesanan paket haji 2026 melalui platform Nusuk. Permintaan melonjak dari berbagai negara termasuk Indonesia, Pakistan, dan India.',
  E'Kementerian Haji dan Umrah Arab Saudi resmi membuka pemesanan paket haji 2026 melalui platform digital Nusuk, dan permintaan langsung melonjak tajam dari berbagai negara di seluruh dunia.\n\nPlatform Nusuk kini menjadi sistem sentral untuk seluruh proses haji, mulai dari pendaftaran visa hingga layanan di lapangan. Langkah digitalisasi ini menghilangkan kebutuhan banyak perantara dan memastikan transparansi dalam seluruh proses.\n\nLayanan yang Tersedia di Nusuk:\n\n1. Penerbitan Visa Haji - Proses pengajuan dan penerbitan visa terintegrasi\n2. Penerbangan - Booking tiket pesawat ke Jeddah dan Madinah\n3. Akomodasi - Reservasi hotel di Makkah dan Madinah\n4. Katering - Paket makan selama di Saudi\n5. Transportasi Darat - Bus antar-kota dan layanan Mashair\n6. Layanan Bimbingan - Panduan ibadah dan informasi\n\nKeuntungan Sistem Digital:\n\nMelalui platform Nusuk, Kementerian Haji dan Umrah Saudi dapat:\n- Memperkirakan permintaan dan mengalokasikan sumber daya secara efisien\n- Berkomunikasi langsung dengan jamaah secara real-time\n- Menegakkan standar regulasi terhadap penyedia layanan haji berlisensi\n- Memastikan paket yang ditawarkan memenuhi ambang batas kualitas\n\nNegara dengan Permintaan Tertinggi:\n\nIndonesia, Pakistan, India, Turki, Mesir, dan Iran tercatat sebagai negara dengan permintaan tertinggi untuk paket haji 2026. Saudi Arabia telah mulai menerbitkan visa haji untuk negara-negara tersebut.\n\nDampak untuk PPIU Indonesia:\n\nBagi PPIU di Indonesia, integrasi Nusuk berarti seluruh proses administrasi haji kini lebih transparan dan terstandarisasi. PPIU wajib memastikan sistem internal mereka terintegrasi dengan Nusuk untuk kelancaran operasional.\n\nSumber: The Saudi Times, Nusuk Platform, Office Newz',
  'pengumuman',
  E'\U0001F310',
  ARRAY['Nusuk', 'Booking Haji', 'Digital', 'Saudi Arabia', 'Platform'],
  'Tim Redaksi GEZMA',
  'Editor',
  5,
  false,
  true,
  false,
  true,
  '2026-04-07T09:00:00Z',
  NULL,
  NOW(),
  NOW()
),

-- 5. Biaya Umrah 2026 Terbaru
(
  gen_random_uuid(),
  'rincian-biaya-umrah-2026-mulai-rp-25-juta-panduan-ppiu',
  'Rincian Biaya Umrah 2026: Mulai Rp 25 Juta, Panduan Lengkap untuk PPIU',
  'Biaya umrah 2026 bervariasi mulai Rp 25 juta hingga Rp 70 juta tergantung paket. Simak rincian komponen biaya dan tips menentukan harga paket yang kompetitif.',
  E'Biaya umrah tahun 2026 bervariasi secara signifikan tergantung jenis paket, durasi perjalanan, dan kelas layanan yang ditawarkan. Berdasarkan Peraturan Menteri Agama Nomor 1021 Tahun 2023 tentang Biaya Penyelenggaraan Ibadah Umrah (BPIU), referensi biaya dasar umrah adalah Rp 23.000.000.\n\nKisaran Harga Paket Umrah 2026:\n\n1. Paket Ekonomi: Rp 25-30 juta\n   - Hotel bintang 3, jarak 500m-1km dari Masjidil Haram\n   - Makan 3x sehari (catering)\n   - Durasi 9-12 hari\n\n2. Paket Reguler: Rp 30-40 juta\n   - Hotel bintang 4, jarak 300-500m\n   - Makan 3x sehari (buffet hotel)\n   - Durasi 9-12 hari\n   - Termasuk city tour\n\n3. Paket VIP: Rp 40-55 juta\n   - Hotel bintang 5, jarak di bawah 300m\n   - Makan premium\n   - Durasi 9-14 hari\n   - City tour + ziarah lengkap\n\n4. Paket Premium/Eksklusif: Rp 55-70+ juta\n   - Hotel bintang 5 view Haram\n   - Layanan personal (mutawwif pribadi)\n   - Durasi fleksibel\n   - Fasilitas VIP di bandara\n\nKomponen Biaya yang Mempengaruhi Harga:\n\n- Tiket pesawat: 30-40% dari total biaya (Garuda, Saudia, Lion Air)\n- Akomodasi hotel: 25-35% (tergantung bintang dan jarak)\n- Visa umrah: Rp 400-750 ribu per jamaah\n- Handling dan transportasi: Rp 200-500 ribu per jamaah\n- Katering: bervariasi per paket\n- Asuransi perjalanan: Rp 150-350 ribu\n- Mutawwif/pembimbing: Rp 4-7,5 juta per trip (dibagi per rombongan)\n\nTips untuk PPIU Menentukan Harga:\n\n1. Gunakan Kalkulator HPP GEZMA untuk menghitung biaya pokok secara akurat\n2. Tentukan margin yang wajar (15-25%) untuk keberlanjutan bisnis\n3. Pertimbangkan musim: harga hotel naik signifikan saat Ramadhan dan musim haji\n4. Negosiasikan harga hotel secara langsung atau melalui muassasah terpercaya\n5. Tawarkan beberapa tier paket untuk menjangkau berbagai segmen jamaah\n\nPerlu diingat bahwa setiap PPIU wajib memiliki izin resmi dari Kementerian Agama RI dan terdaftar di sistem Siskopatuh.\n\nSumber: Detik.com, Kemenag RI (PMA No. 1021/2023), Al-Sha Travel',
  'tips',
  E'\U0001F4B5',
  ARRAY['Biaya Umrah', 'Paket Umrah', '2026', 'PPIU', 'Harga'],
  'Tim Redaksi GEZMA',
  'Editor',
  7,
  false,
  false,
  false,
  true,
  '2026-04-06T10:00:00Z',
  NULL,
  NOW(),
  NOW()
)

ON CONFLICT DO NOTHING;
