INSERT INTO news_articles (id, slug, title, excerpt, content, category, emoji, tags, author, "authorRole", "readTime", "isBreaking", "isOfficial", "isFeatured", "isPublished", "publishedAt", "imageUrl", "createdAt", "updatedAt")
VALUES

-- 1. BREAKING: Makkah Entry Restrictions
(
  gen_random_uuid(),
  'saudi-arabia-batasi-akses-masuk-makkah-mulai-13-april-2026',
  'BREAKING: Saudi Arabia Batasi Akses Masuk Makkah Mulai 13 April 2026, Wajib Izin Resmi',
  'Kementerian Dalam Negeri Arab Saudi resmi memberlakukan pembatasan akses masuk ke kota Makkah mulai 13 April 2026. Hanya pemegang izin resmi yang diperbolehkan memasuki kota suci menjelang musim haji.',
  E'Kementerian Dalam Negeri Arab Saudi secara resmi memberlakukan pembatasan ketat terhadap akses masuk ke kota Makkah mulai Senin, 13 April 2026. Kebijakan ini merupakan langkah rutin yang diterapkan setiap tahun menjelang musim haji untuk memastikan keamanan dan kenyamanan para jamaah.\n\nBerdasarkan pengumuman resmi, hanya individu dengan dokumen berikut yang diperbolehkan memasuki Makkah:\n\n1. Pemegang Iqama (izin tinggal) yang diterbitkan di Makkah \u2014 warga asing yang terdaftar sebagai penduduk Makkah\n2. Pemegang izin haji resmi \u2014 jamaah yang telah terdaftar melalui sistem resmi\n3. Pekerja dengan otorisasi khusus \u2014 tenaga kerja yang bertugas di lokasi-lokasi suci\n\nUntuk mengajukan izin masuk, pemerintah Saudi menyediakan dua platform digital:\n- Absher Individuals: Untuk warga GCC, pemegang Premium Residency, investor, ibu dari warga Saudi, dan pekerja rumah tangga\n- Muqeem: Untuk karyawan perusahaan yang berdomisili di Makkah\n\nKementerian Dalam Negeri memperingatkan bahwa pelanggaran terhadap regulasi ini akan berujung pada sanksi hukum yang tegas. Aparat keamanan telah ditempatkan di seluruh titik akses masuk Makkah untuk memverifikasi dokumen setiap individu yang hendak memasuki kota.\n\nLangkah pembatasan ini bertujuan untuk:\n- Mengendalikan kepadatan menjelang puncak musim haji\n- Mencegah jamaah haji ilegal yang masuk tanpa izin resmi\n- Memastikan keselamatan jamaah mengingat suhu yang diperkirakan melebihi 45\u00b0C\n\nBagi travel agent PPIU di Indonesia, penting untuk menginformasikan kepada calon jamaah bahwa akses masuk Makkah kini memerlukan izin resmi dan memastikan seluruh dokumen perjalanan telah diurus dengan benar sebelum keberangkatan.\n\nSumber: Saudi Ministry of Interior via Khaleej Times, Saudi Gazette',
  'regulasi',
  E'\U0001F6A8',
  ARRAY['Makkah', 'Pembatasan', 'Haji 2026', 'Saudi Arabia', 'Izin Masuk'],
  'Tim Redaksi GEZMA',
  'Editor',
  6,
  true,
  true,
  true,
  true,
  '2026-04-13T10:00:00Z',
  NULL,
  NOW(),
  NOW()
),

-- 2. Umrah Visa Suspension
(
  gen_random_uuid(),
  'nusuk-hentikan-sementara-visa-umrah-18-april-hingga-31-mei-2026',
  'Nusuk Hentikan Sementara Penerbitan Visa Umrah: 18 April - 31 Mei 2026',
  'Platform Nusuk resmi menghentikan penerbitan izin umrah mulai 18 April hingga 31 Mei 2026. Semua pemegang visa umrah wajib meninggalkan Saudi sebelum 18 April.',
  E'Pemerintah Arab Saudi melalui Kementerian Haji dan Umrah mengumumkan penghentian sementara penerbitan izin umrah melalui platform Nusuk mulai 18 April hingga 31 Mei 2026. Kebijakan ini merupakan prosedur standar tahunan menjelang musim haji.\n\nTimeline Penting yang Wajib Diketahui PPIU:\n\n- 19-20 Maret 2026: Batas akhir penerbitan visa umrah 1447H\n- 2-3 April 2026: Batas akhir masuk Saudi dengan visa umrah\n- 18 April 2026: Deadline seluruh jamaah umrah meninggalkan Saudi\n- 18 April - 31 Mei 2026: Penerbitan izin umrah via Nusuk dihentikan\n- 10-11 Juni 2026: Perkiraan pembukaan kembali visa umrah\n\nKebijakan ini berlaku menyeluruh untuk warga Saudi, ekspatriat, maupun warga negara anggota GCC. Selama periode tersebut, hanya pemegang visa haji resmi yang diperbolehkan berada di Makkah.\n\nBagi PPIU yang masih memiliki jamaah umrah di Saudi, pastikan seluruh jamaah telah meninggalkan wilayah Kerajaan sebelum batas waktu 18 April 2026. Pemegang visa umrah yang masih berada di Saudi setelah tanggal tersebut dapat dikenakan sanksi.\n\nKabar baiknya, pemerintah Saudi memberikan kelonggaran bagi pemegang visa umrah yang telah expired untuk meninggalkan Kerajaan tanpa perlu perpanjangan visa atau denda, selama dilakukan sebelum deadline 18 April.\n\nPenerbitan visa umrah diperkirakan akan dibuka kembali sekitar 10-11 Juni 2026, setelah musim haji berakhir.\n\nSumber: Nusuk Platform, Khaleej Times, VisaVerge',
  'regulasi',
  E'\U0001F4CB',
  ARRAY['Nusuk', 'Visa Umrah', 'Suspensi', 'Haji 2026', 'Deadline'],
  'Tim Redaksi GEZMA',
  'Editor',
  5,
  true,
  true,
  true,
  true,
  '2026-04-14T08:00:00Z',
  NULL,
  NOW(),
  NOW()
),

-- 3. Indonesia Hajj Quota
(
  gen_random_uuid(),
  'kuota-haji-indonesia-2026-tetap-221000-jamaah-terbesar-di-dunia',
  'Kuota Haji Indonesia 2026 Tetap 221.000 Jamaah, Terbesar di Dunia',
  'Indonesia mempertahankan kuota haji terbesar di dunia dengan 221.000 jamaah untuk tahun 2026. Jawa Timur mendapat alokasi terbanyak dengan 42.409 jamaah.',
  E'Kementerian Haji dan Umrah (Kemenhaj) RI mengonfirmasi bahwa kuota haji Indonesia untuk tahun 2026 (1447 Hijriah) tetap sebesar 221.000 jamaah, menjadikan Indonesia sebagai negara pengirim jamaah haji terbesar di dunia.\n\nRincian Alokasi Kuota:\n- Haji Reguler: 203.320 jamaah (92%)\n- Haji Khusus (ONH Plus): 17.680 jamaah (8%)\n\n5 Provinsi dengan Kuota Terbesar:\n1. Jawa Timur: 42.409 jamaah\n2. Jawa Tengah: 34.122 jamaah\n3. Jawa Barat: 29.643 jamaah\n4. Sumatera Utara: 12.891 jamaah\n5. DKI Jakarta: 11.234 jamaah\n\nJadwal Keberangkatan:\nJamaah haji Indonesia dijadwalkan masuk asrama haji mulai 21 April 2026, dengan keberangkatan bertahap ke Arab Saudi dimulai 22 April 2026. Garuda Indonesia mengerahkan 15 pesawat wide-body untuk penerbangan haji.\n\n- Penerbangan ke Madinah: 22 April - 6 Mei 2026\n- Penerbangan ke Jeddah: 7 Mei - 21 Mei 2026\n- Penerbangan pulang: 1 Juni - 1 Juli 2026\n\nPerbandingan Kuota Global:\nIndonesia tetap memimpin dengan 221.000, diikuti Pakistan (179.210) dan India (175.025).\n\nMenteri Haji dan Umrah menyampaikan bahwa meskipun biaya pesawat Garuda Indonesia dan Saudia Airlines mengalami kenaikan, Presiden Prabowo Subianto berpesan agar kenaikan biaya tersebut tidak dibebankan kepada jamaah haji.\n\nSumber: Jakarta Globe, Kementerian Haji dan Umrah RI, Databoks Katadata',
  'regulasi',
  E'\U0001F54B',
  ARRAY['Kuota Haji', 'Indonesia', '221000', 'Kemenhaj', '2026'],
  'Tim Redaksi GEZMA',
  'Editor',
  5,
  false,
  true,
  true,
  true,
  '2026-04-12T09:00:00Z',
  NULL,
  NOW(),
  NOW()
),

-- 4. Rakernas Kemenhaj
(
  gen_random_uuid(),
  'rakernas-kemenhaj-2026-transformasi-penyelenggaraan-haji-inklusif',
  'Rakernas Kemenhaj 2026: Momentum Perbaikan Total Penyelenggaraan Haji',
  'Kementerian Haji dan Umrah menggelar Rapat Kerja Nasional konsolidasi penyelenggaraan haji 2026 di Asrama Haji Tangerang, mengusung tema transformasi haji inklusif.',
  E'Kementerian Haji dan Umrah (Kemenhaj) Republik Indonesia menggelar Rapat Kerja Nasional (Rakernas) Konsolidasi Penyelenggaraan Ibadah Haji Tahun 1447 H/2026 M pada 8-11 April 2026 di Asrama Haji Kelas 1 Tangerang, Banten.\n\nRakernas ini mengusung tema: \"Transformasi Penyelenggaraan Haji Inklusif dalam Tantangan Dinamika Geopolitik Global\"\n\nMenteri Haji dan Umrah, Gus Irfan, menegaskan bahwa Rakernas ini merupakan momentum perbaikan total dalam penyelenggaraan ibadah haji. Beberapa poin penting yang dibahas:\n\n1. Perbaikan Layanan\n- Peningkatan kualitas katering dan akomodasi di Arab Saudi\n- Standarisasi pelayanan di seluruh embarkasi\n- Digitalisasi proses administrasi jamaah\n\n2. Tantangan Geopolitik\n- Dampak dinamika geopolitik global terhadap keamanan jamaah\n- Koordinasi dengan pihak Saudi terkait keamanan jalur perjalanan\n- Stabilitas harga layanan di tengah fluktuasi nilai tukar\n\n3. Biaya Haji\n- Presiden Prabowo berpesan agar kenaikan biaya operasional tidak dibebankan kepada jamaah\n- Biaya pesawat Garuda Indonesia dan Saudia Airlines mengalami kenaikan\n- Kemenhaj mencari skema subsidi untuk menekan biaya\n\n4. Inklusivitas\n- Peningkatan fasilitas untuk jamaah difabel dan lansia\n- Penambahan tenaga medis pendamping\n- Aksesibilitas informasi dalam berbagai format\n\nMenhaj juga melakukan pertemuan bilateral dengan Duta Besar Arab Saudi untuk Indonesia, membahas kesiapan teknis dan operasional penyelenggaraan haji 2026 dengan menekankan stabilitas demi kekhusyukan ibadah.\n\nSumber: Upeks.co.id, TIMES Indonesia, Kementerian Haji dan Umrah RI',
  'pengumuman',
  E'\U0001F3DB',
  ARRAY['Rakernas', 'Kemenhaj', 'Haji 2026', 'Gus Irfan', 'Transformasi'],
  'Tim Redaksi GEZMA',
  'Editor',
  6,
  false,
  true,
  false,
  true,
  '2026-04-11T07:00:00Z',
  NULL,
  NOW(),
  NOW()
),

-- 5. Heat Safety for Hajj
(
  gen_random_uuid(),
  'tips-keselamatan-jamaah-haji-2026-hadapi-suhu-ekstrem-45-derajat',
  'Tips Keselamatan Jamaah Haji 2026: Menghadapi Suhu Ekstrem di Atas 45 Derajat Celcius',
  'Musim haji 2026 jatuh di akhir Mei saat suhu Makkah bisa melebihi 45 derajat Celcius. Saudi Arabia telah siapkan langkah keselamatan, dan PPIU wajib mempersiapkan jamaahnya.',
  E'Musim haji 2026 yang diperkirakan berlangsung 25-30 Mei akan menghadapi tantangan cuaca ekstrem, dengan suhu di Makkah yang bisa melonjak hingga di atas 45 derajat Celcius (113\u00b0F). Pemerintah Saudi Arabia telah mengambil berbagai langkah untuk melindungi jamaah, namun persiapan dari sisi PPIU dan jamaah sendiri juga sangat krusial.\n\nLangkah Keselamatan dari Saudi Arabia:\n\n1. Misting Stations \u2014 Stasiun penyemprotan kabut air diperbanyak di sepanjang jalur antara lokasi-lokasi suci (Mina, Arafah, Muzdalifah)\n2. Shaded Walkways \u2014 Penambahan jalur pejalan kaki beratap di area kritis\n3. Cooling-Coated Roads \u2014 Jalan-jalan utama di area haji dilapisi material pendingin khusus untuk menurunkan suhu permukaan\n4. Emergency Medical Teams \u2014 Tim medis darurat disiagakan 24 jam di seluruh lokasi\n\nPersiapan yang Wajib Dilakukan PPIU:\n\nSebagai penyelenggara, PPIU memiliki tanggung jawab untuk mempersiapkan jamaah menghadapi cuaca panas:\n\n1. Edukasi Pra-Keberangkatan \u2014 Berikan briefing tentang bahaya heat stroke dan dehidrasi\n2. Latihan Fisik \u2014 Anjurkan jamaah untuk mulai olahraga ringan minimal 2-3 bulan sebelum keberangkatan\n3. Perlengkapan Wajib \u2014 Pastikan jamaah membawa: garam elektrolit/oralit, sunscreen SPF 50+, payung sturdy, pakaian breathable berbahan ringan dan berwarna terang, botol air minum reusable\n4. Jadwal Ibadah \u2014 Atur jadwal thawaf dan sa''i di waktu yang lebih sejuk (dini hari atau malam)\n5. Monitoring Kesehatan \u2014 Siapkan protokol monitoring kesehatan harian untuk setiap rombongan\n\nTips untuk Jamaah:\n- Minum air minimal 3 liter per hari\n- Hindari aktivitas outdoor antara pukul 11:00-15:00\n- Kenali tanda-tanda heat stroke: pusing, mual, kulit kering panas, kebingungan\n- Segera cari pertolongan medis jika merasakan gejala di atas\n- Gunakan selalu payung saat di outdoor\n\nSumber: Saudi Ministry of Health, World Population Review, Travel Advisory',
  'tips',
  E'\U0001F321',
  ARRAY['Haji 2026', 'Cuaca Panas', 'Heat Stroke', 'Keselamatan', 'Tips'],
  'Tim Redaksi GEZMA',
  'Editor',
  7,
  false,
  false,
  false,
  true,
  '2026-04-10T11:00:00Z',
  NULL,
  NOW(),
  NOW()
),

-- 6. Peringatan Jamaah Haji Ilegal
(
  gen_random_uuid(),
  'peringatan-saudi-tindak-tegas-jamaah-haji-ilegal-deportasi-denda',
  'PERINGATAN: Saudi Tindak Tegas Jamaah Haji Ilegal - Deportasi dan Denda Berat',
  'Pemerintah Saudi Arabia memperketat pengawasan terhadap jamaah haji ilegal. Pelanggaran dapat berujung deportasi, denda, dan larangan masuk Saudi di masa depan.',
  E'Pemerintah Arab Saudi mempertegas komitmennya untuk menindak jamaah haji ilegal yang mencoba memasuki Makkah tanpa izin resmi selama musim haji 2026. Aparat keamanan telah disiagakan di seluruh checkpoint menuju kota suci.\n\nSiapa yang Dikategorikan Jamaah Haji Ilegal?\n\n1. Pemegang visa non-haji (visa kerja, visa kunjungan, visa umrah expired) yang mencoba masuk Makkah selama musim haji\n2. Penduduk Saudi yang berada di Makkah tanpa izin masuk resmi selama periode pembatasan\n3. Individu yang menyalahgunakan visa untuk tujuan ibadah haji tanpa melalui prosedur resmi\n\nSanksi yang Diberlakukan:\n\n- Deportasi langsung tanpa proses banding\n- Denda finansial hingga ribuan riyal Saudi\n- Blacklist \u2014 larangan masuk Saudi Arabia selama periode tertentu\n- Sanksi terhadap pihak yang membantu \u2014 termasuk agen perjalanan, sopir, atau penyedia akomodasi yang memfasilitasi jamaah haji ilegal\n\nStatistik:\nPada musim haji sebelumnya, Saudi Arabia mendeportasi puluhan ribu jamaah haji ilegal. Tahun ini, pengawasan semakin diperketat dengan teknologi pengenalan wajah dan pemeriksaan dokumen digital di setiap titik akses.\n\nPesan untuk Travel Agent:\n\nPPIU dan travel agent wajib mengedukasi jamaah dan calon jamaah untuk:\n- Tidak mencoba masuk Makkah dengan visa selain visa haji selama periode pembatasan\n- Memastikan seluruh dokumen perjalanan valid dan lengkap\n- Mengikuti prosedur resmi melalui Kementerian Haji dan Umrah\n- Melaporkan tawaran haji murah atau tanpa kuota resmi yang beredar di media sosial\n\nIngat: tidak ada jalan pintas untuk ibadah haji. Prosedur resmi ada untuk melindungi keselamatan seluruh jamaah.\n\nSumber: Saudi Ministry of Interior, Republika, Saudi Gazette',
  'peringatan',
  E'\u26A0\uFE0F',
  ARRAY['Haji Ilegal', 'Deportasi', 'Sanksi', 'Saudi Arabia', 'Peringatan'],
  'Tim Redaksi GEZMA',
  'Editor',
  6,
  true,
  true,
  false,
  true,
  '2026-04-13T14:00:00Z',
  NULL,
  NOW(),
  NOW()
)

ON CONFLICT DO NOTHING;
