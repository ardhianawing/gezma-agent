/**
 * Seed script: populate manasik_lessons and doa_prayers for all agencies.
 *
 * Usage:
 *   npx tsx prisma/seed-manasik-doa.ts
 *
 * Safe to run multiple times — checks if data already exists per agency.
 */

import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const MANASIK_LESSONS = [
  {
    title: 'Niat dan Persiapan Sebelum Berangkat',
    description: 'Panduan lengkap persiapan umrah mulai dari niat, perlengkapan, hingga tips kesehatan.',
    category: 'persiapan',
    order: 1,
    duration: 15,
    content: `## Niat Umrah

Niat adalah syarat sah ibadah umrah. Niatkan di dalam hati bahwa Anda akan melaksanakan ibadah umrah karena Allah SWT.

## Persiapan Fisik
- Periksa kesehatan ke dokter minimal 1 bulan sebelum berangkat
- Vaksinasi meningitis (wajib) dan vaksin flu
- Bawa obat-obatan pribadi yang cukup
- Latihan jalan kaki minimal 30 menit/hari

## Perlengkapan yang Harus Dibawa
1. Pakaian ihram (2 set untuk pria)
2. Mukena (untuk wanita)
3. Sandal yang nyaman untuk berjalan jauh
4. Botol air minum portable
5. Payung lipat
6. Obat-obatan pribadi
7. Fotokopi dokumen penting

## Dokumen Penting
- Paspor (masa berlaku min. 6 bulan)
- Visa umrah
- Tiket pesawat
- Kartu vaksinasi
- Asuransi perjalanan`,
    tips: [
      'Mulai latihan jalan kaki 1 bulan sebelum keberangkatan',
      'Bawa obat-obatan pribadi dalam carry-on bag',
      'Fotokopi semua dokumen dan simpan di tempat terpisah',
    ],
    isImportant: true,
    emoji: '🧳',
  },
  {
    title: 'Miqat dan Tata Cara Ihram',
    description: 'Panduan berihram dari miqat, niat, dan larangan selama ihram.',
    category: 'ihram',
    order: 2,
    duration: 20,
    content: `## Pengertian Miqat

Miqat adalah batas tempat di mana jamaah umrah wajib memulai ihram. Untuk jamaah yang datang dari Indonesia melalui udara, biasanya berihram di atas pesawat sebelum melewati batas miqat.

## Jenis-jenis Miqat
1. **Dzulhulaifah (Bir Ali)** — untuk penduduk Madinah
2. **Al-Juhfah** — untuk penduduk Syam (Suriah, Yordania, dll)
3. **Yalamlam** — untuk penduduk Yaman dan Indonesia (jalur laut)
4. **Qarnul Manazil** — untuk penduduk Najd
5. **Dzatu Irq** — untuk penduduk Iraq

## Tata Cara Ihram
1. Mandi sunnah (ghusl)
2. Memakai pakaian ihram (pria: 2 kain putih tanpa jahitan)
3. Shalat sunnah ihram 2 rakaat
4. Mengucapkan niat umrah: **"Labbaika Allahumma 'Umratan"**
5. Membaca talbiyah

## Bacaan Talbiyah
> لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لاَ شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لاَ شَرِيكَ لَكَ

**Artinya:** "Aku penuhi panggilan-Mu ya Allah, aku penuhi panggilan-Mu. Aku penuhi panggilan-Mu, tiada sekutu bagi-Mu, aku penuhi panggilan-Mu. Sesungguhnya segala puji, nikmat, dan kerajaan milik-Mu. Tiada sekutu bagi-Mu."

## Larangan Selama Ihram
- Memotong rambut atau kuku
- Memakai wangi-wangian
- Menikah atau melamar
- Berburu binatang darat
- Pria: menutupi kepala, memakai pakaian berjahit
- Wanita: menutup wajah (cadar) dan memakai sarung tangan`,
    tips: [
      'Berihram sebelum pesawat melewati batas miqat',
      'Bawa sabun tanpa pewangi selama ihram',
      'Wanita boleh memakai pakaian biasa yang menutup aurat',
    ],
    isImportant: true,
    emoji: '🕌',
  },
  {
    title: "Tawaf: Mengelilingi Ka'bah",
    description: "Tata cara tawaf 7 putaran mengelilingi Ka'bah beserta doa-doanya.",
    category: 'tawaf',
    order: 3,
    duration: 25,
    content: `## Pengertian Tawaf

Tawaf adalah mengelilingi Ka'bah sebanyak 7 kali putaran, dimulai dan diakhiri di Hajar Aswad.

## Syarat Tawaf
1. Suci dari hadats besar dan kecil
2. Menutup aurat
3. Ka'bah berada di sebelah kiri
4. Dimulai dari Hajar Aswad
5. Dilakukan di dalam Masjidil Haram
6. Sebanyak 7 kali putaran

## Tata Cara Tawaf
1. **Posisi awal:** Berdiri menghadap Hajar Aswad
2. **Istilam:** Mengangkat tangan kanan ke arah Hajar Aswad sambil berkata "Bismillahi Allahu Akbar"
3. **Berjalan:** Mengelilingi Ka'bah ke arah kanan (berlawanan arah jarum jam)
4. **Putaran 1-3:** Untuk pria, disunnahkan berlari-lari kecil (raml) pada 3 putaran pertama
5. **Putaran 4-7:** Berjalan biasa
6. **Setiap melewati Hajar Aswad:** Istilam kembali
7. **Setelah 7 putaran:** Shalat 2 rakaat di belakang Maqam Ibrahim

## Doa Selama Tawaf
Boleh berdoa dengan doa apa saja. Disunnahkan membaca:
- Antara Rukun Yamani dan Hajar Aswad: **"Rabbana atina fid-dunya hasanah wa fil-akhirati hasanah wa qina 'adzaban-nar"**

## Idhtiba' (Khusus Pria)
Menyingkap bahu kanan dengan meletakkan tengah kain ihram di bawah ketiak kanan. Dilakukan hanya saat tawaf qudum.`,
    tips: [
      'Jaga wudhu sebelum memulai tawaf',
      'Pilih waktu yang tidak terlalu ramai jika memungkinkan',
      "Jangan memaksakan diri untuk mencium Hajar Aswad jika sangat ramai",
      'Bawa botol air minum, tawaf bisa memakan waktu 1-2 jam',
    ],
    isImportant: true,
    emoji: '🕋',
  },
  {
    title: "Sa'i: Antara Shafa dan Marwah",
    description: "Tata cara sa'i 7 kali perjalanan antara bukit Shafa dan Marwah.",
    category: 'sai',
    order: 4,
    duration: 20,
    content: `## Pengertian Sa'i

Sa'i adalah berjalan dari bukit Shafa ke bukit Marwah dan sebaliknya sebanyak 7 kali perjalanan.

## Tata Cara Sa'i
1. **Mulai dari Shafa:** Setelah selesai tawaf dan shalat 2 rakaat
2. **Di atas Shafa:** Menghadap Ka'bah, mengangkat tangan, dan berdoa
3. **Berjalan ke Marwah:** Berjalan biasa, pria berlari kecil di antara tanda hijau
4. **Di atas Marwah:** Menghadap Ka'bah, mengangkat tangan, dan berdoa
5. Ulangi hingga 7 kali (Shafa→Marwah = 1, Marwah→Shafa = 2, dst)
6. Perjalanan terakhir (ke-7) berakhir di Marwah

## Hitungan Sa'i
| Perjalanan | Dari | Ke |
|------------|------|-----|
| 1 | Shafa | Marwah |
| 2 | Marwah | Shafa |
| 3 | Shafa | Marwah |
| 4 | Marwah | Shafa |
| 5 | Shafa | Marwah |
| 6 | Marwah | Shafa |
| 7 | Shafa | Marwah |

## Doa di Shafa dan Marwah
Di kedua bukit, disunnahkan membaca:
> إِنَّ الصَّفَا وَالْمَرْوَةَ مِنْ شَعَائِرِ اللَّهِ

**Artinya:** "Sesungguhnya Shafa dan Marwah termasuk syi'ar-syi'ar Allah."

Kemudian berdoa dengan doa apa saja yang diinginkan.

## Tips Penting
- Sa'i boleh dilakukan dalam keadaan tidak berwudhu (tapi lebih utama berwudhu)
- Boleh beristirahat di tengah-tengah jika lelah
- Saat ini ada AC dan eskalator di area sa'i`,
    tips: [
      "Sa'i tidak mensyaratkan wudhu, tapi lebih utama dalam keadaan suci",
      'Gunakan lantai atas jika lantai bawah terlalu ramai',
      'Manfaatkan eskalator yang tersedia',
      "Bawa air minum, tersedia juga air zamzam di area sa'i",
    ],
    isImportant: true,
    emoji: '🏃',
  },
  {
    title: 'Tahallul: Mencukur/Memotong Rambut',
    description: 'Panduan tahallul sebagai penutup ibadah umrah.',
    category: 'tahallul',
    order: 5,
    duration: 10,
    content: `## Pengertian Tahallul

Tahallul adalah mencukur atau memotong rambut setelah selesai melakukan sa'i. Dengan tahallul, seluruh larangan ihram telah selesai.

## Jenis Tahallul
1. **Halq (Mencukur habis)** — lebih utama untuk pria
2. **Taqshir (Memotong sebagian)** — minimal sepanjang ujung jari

## Ketentuan
- **Pria:** Disunnahkan mencukur habis (halq), boleh juga memotong sebagian (taqshir)
- **Wanita:** Hanya memotong ujung rambut sepanjang ujung jari (± 1-2 cm). TIDAK boleh mencukur habis.

## Setelah Tahallul
Setelah tahallul, semua larangan ihram telah berakhir:
- Boleh memakai pakaian biasa
- Boleh memakai wangi-wangian
- Boleh memotong kuku
- Hubungan suami istri kembali halal

## Tempat Tahallul
- Di sekitar Masjidil Haram banyak tukang cukur
- Harga cukur ± 10-20 SAR
- Bisa juga dilakukan sendiri di hotel

## Urutan Lengkap Umrah
1. ✅ Ihram dari Miqat
2. ✅ Tawaf (7 putaran)
3. ✅ Shalat 2 rakaat di Maqam Ibrahim
4. ✅ Sa'i (7 perjalanan Shafa-Marwah)
5. ✅ Tahallul (potong/cukur rambut)
6. 🎉 Umrah selesai!`,
    tips: [
      'Pria disunnahkan mencukur habis untuk pahala lebih besar',
      'Wanita cukup memotong ujung rambut 1-2 cm',
      'Siapkan uang SAR kecil untuk tukang cukur',
    ],
    isImportant: true,
    emoji: '✂️',
  },
  {
    title: 'Shalat di Masjidil Haram',
    description: 'Keutamaan dan panduan shalat di Masjidil Haram.',
    category: 'sunnah',
    order: 6,
    duration: 12,
    content: `## Keutamaan Shalat di Masjidil Haram

Shalat di Masjidil Haram nilainya **100.000 kali lipat** dibanding shalat di masjid biasa (HR. Ibnu Majah).

## Tips Shalat di Masjidil Haram
1. Datang lebih awal untuk mendapat tempat yang baik
2. Area dekat Ka'bah sangat ramai, pilih lantai atas jika ingin lebih tenang
3. Shalat 5 waktu, tahajjud, dan dhuha sangat dianjurkan
4. Jangan lupa shalat sunnah tahiyyatul masjid saat masuk

## Shalat Sunnah yang Dianjurkan
- **Tahiyyatul Masjid:** 2 rakaat saat masuk masjid
- **Sunnah Rawatib:** Sebelum/sesudah shalat fardhu
- **Tahajjud:** Sepertiga malam terakhir
- **Dhuha:** Setelah matahari naik
- **Witir:** Sebelum tidur atau setelah tahajjud

## Waktu Terlarang Shalat Sunnah
- Setelah Subuh hingga matahari terbit
- Saat matahari tepat di atas kepala (menjelang Dzuhur)
- Setelah Ashar hingga matahari terbenam

*Catatan: Para ulama berbeda pendapat tentang waktu terlarang di Masjidil Haram. Sebagian ulama membolehkan shalat sunnah kapan saja di Masjidil Haram.*`,
    tips: [
      'Shalat 1 kali di Masjidil Haram = 100.000 shalat di tempat lain',
      'Datang minimal 30 menit sebelum adzan untuk mendapat tempat',
      'Bawa sajadah tipis untuk kenyamanan di lantai marmer',
    ],
    isImportant: false,
    emoji: '🤲',
  },
  {
    title: 'Ziarah ke Masjid Nabawi',
    description: 'Panduan ziarah ke Masjid Nabawi di Madinah dan adab-adabnya.',
    category: 'sunnah',
    order: 7,
    duration: 15,
    content: `## Keutamaan Masjid Nabawi

Shalat di Masjid Nabawi nilainya **1.000 kali lipat** dibanding shalat di masjid biasa (HR. Bukhari & Muslim).

## Tempat-tempat Penting
1. **Raudhah:** Area antara mimbar dan rumah Nabi ﷺ. Disebut "taman surga."
2. **Makam Rasulullah ﷺ:** Tempat dimakamkannya Nabi Muhammad ﷺ
3. **Makam Abu Bakar & Umar:** Di sebelah makam Rasulullah
4. **Taman Kurma:** Di halaman masjid
5. **Masjid Quba:** Masjid pertama dalam Islam

## Adab Ziarah
1. Shalat 2 rakaat tahiyyatul masjid
2. Berjalan dengan tenang menuju makam Rasulullah ﷺ
3. Mengucapkan salam: **"Assalamu'alaika ya Rasulullah"**
4. Kemudian salam kepada Abu Bakar: **"Assalamu'alaika ya Abu Bakar"**
5. Kemudian salam kepada Umar: **"Assalamu'alaika ya Umar"**
6. Berdoa dengan doa yang baik

## Ziarah ke Raudhah
- Raudhah ditandai dengan karpet hijau
- Sangat ramai, terutama setelah shalat
- Ada jadwal khusus untuk wanita
- Dianjurkan shalat dan berdoa di area ini

## Tempat Ziarah Lain di Madinah
- **Masjid Quba:** Shalat 2 rakaat = pahala umrah
- **Pemakaman Baqi:** Tempat para sahabat dimakamkan
- **Jabal Uhud:** Lokasi Perang Uhud
- **Masjid Qiblatain:** Masjid perpindahan arah kiblat`,
    tips: [
      'Shalat di Raudhah sangat dianjurkan, datang di waktu sepi',
      'Masjid Quba bisa dikunjungi dengan bus/taksi dari Madinah',
      'Jangan lupa shalat 2 rakaat di Masjid Quba (pahalanya seperti umrah)',
    ],
    isImportant: false,
    emoji: '🕌',
  },
  {
    title: 'Minum Air Zamzam',
    description: 'Keutamaan dan doa saat minum air zamzam.',
    category: 'sunnah',
    order: 8,
    duration: 8,
    content: `## Keutamaan Air Zamzam

Air zamzam adalah air terbaik di muka bumi. Rasulullah ﷺ bersabda: "Air zamzam sesuai dengan niat peminumnya" (HR. Ibnu Majah).

## Adab Minum Air Zamzam
1. Menghadap kiblat
2. Membaca "Bismillah"
3. Minum dengan tangan kanan
4. Minum sambil duduk (lebih utama)
5. Minum dalam 3 tegukan
6. Berdoa setelah minum

## Doa Saat Minum Zamzam
> اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا وَرِزْقًا وَاسِعًا وَشِفَاءً مِنْ كُلِّ دَاءٍ

**Artinya:** "Ya Allah, aku memohon kepada-Mu ilmu yang bermanfaat, rezeki yang luas, dan kesembuhan dari segala penyakit."

## Lokasi Air Zamzam
- Tersedia di seluruh area Masjidil Haram (dispenser)
- Di area Masjid Nabawi juga tersedia
- Bisa dibeli di toko-toko sekitar Makkah untuk oleh-oleh
- Aturan Saudi: max 5 liter per orang untuk dibawa pulang`,
    tips: [
      'Berdoa sungguh-sungguh saat minum zamzam, doa insya Allah dikabulkan',
      'Air zamzam gratis di dalam Masjidil Haram',
      "Bawa botol untuk diisi air zamzam saat tawaf/sa'i",
    ],
    isImportant: false,
    emoji: '💧',
  },
];

const DOA_PRAYERS = [
  { title: 'Talbiyah', category: 'umrah', arabic: 'لَبَّيْكَ اللَّهُمَّ لَبَّيْكَ، لَبَّيْكَ لاَ شَرِيكَ لَكَ لَبَّيْكَ، إِنَّ الْحَمْدَ وَالنِّعْمَةَ لَكَ وَالْمُلْكَ، لاَ شَرِيكَ لَكَ', latin: "Labbaikallahumma labbaik, labbaika laa syariika laka labbaik, innal hamda wan ni'mata laka wal mulk, laa syariika lak", translation: 'Aku penuhi panggilan-Mu ya Allah, aku penuhi panggilan-Mu. Aku penuhi panggilan-Mu, tiada sekutu bagi-Mu, aku penuhi panggilan-Mu. Sesungguhnya segala puji, nikmat, dan kerajaan milik-Mu. Tiada sekutu bagi-Mu.', occasion: 'Dibaca setelah niat ihram, terus diulang-ulang sampai tiba di Masjidil Haram', source: 'HR. Bukhari & Muslim', emoji: '🕋', order: 1 },
  { title: "Doa Melihat Ka'bah Pertama Kali", category: 'umrah', arabic: 'اللَّهُمَّ زِدْ هَذَا الْبَيْتَ تَشْرِيفًا وَتَعْظِيمًا وَتَكْرِيمًا وَمَهَابَةً، وَزِدْ مَنْ شَرَّفَهُ وَكَرَّمَهُ مِمَّنْ حَجَّهُ أَوِ اعْتَمَرَهُ تَشْرِيفًا وَتَكْرِيمًا وَتَعْظِيمًا وَبِرًّا', latin: "Allahumma zid hadhal baita tasyriifan wa ta'zhiiman wa takriiman wa mahaabatan, wa zid man syarrafahu wa karramahu mimman hajjahu awi'tamarahu tasyriifan wa takriiman wa ta'zhiiman wa birran", translation: "Ya Allah, tambahkanlah kemuliaan, keagungan, kehormatan, dan kewibawaan pada rumah ini (Ka'bah). Dan tambahkanlah kemuliaan, kehormatan, keagungan, dan kebaikan pada orang yang memuliakannya dan menghormatinya dari orang yang menghaji atau berumrah.", occasion: "Dibaca saat pertama kali melihat Ka'bah", source: 'HR. Baihaqi', emoji: '✨', order: 2 },
  { title: 'Doa Saat Istilam Hajar Aswad', category: 'umrah', arabic: 'بِسْمِ اللَّهِ وَاللَّهُ أَكْبَرُ، اللَّهُمَّ إِيمَانًا بِكَ وَتَصْدِيقًا بِكِتَابِكَ وَوَفَاءً بِعَهْدِكَ وَاتِّبَاعًا لِسُنَّةِ نَبِيِّكَ مُحَمَّدٍ ﷺ', latin: "Bismillahi wallahu akbar, Allahumma imaanan bika wa tashdiiqan bikitaabika wa wafaa'an bi'ahdika wattibaa'an lisunnati nabiyyika Muhammadin shallallahu 'alaihi wa sallam", translation: 'Dengan nama Allah, Allah Maha Besar. Ya Allah, dengan beriman kepada-Mu, membenarkan kitab-Mu, memenuhi janji-Mu, dan mengikuti sunnah Nabi-Mu Muhammad ﷺ.', occasion: 'Dibaca setiap kali melewati Hajar Aswad saat tawaf', source: 'HR. Baihaqi', emoji: '🪨', order: 3 },
  { title: 'Doa Antara Rukun Yamani dan Hajar Aswad', category: 'umrah', arabic: 'رَبَّنَا آتِنَا فِي الدُّنْيَا حَسَنَةً وَفِي الْآخِرَةِ حَسَنَةً وَقِنَا عَذَابَ النَّارِ', latin: "Rabbana aatina fid-dunya hasanatan wa fil-aakhirati hasanatan wa qina 'adzaban-naar", translation: 'Ya Tuhan kami, berikanlah kami kebaikan di dunia dan kebaikan di akhirat, dan lindungilah kami dari siksa api neraka.', occasion: 'Dibaca antara Rukun Yamani dan Hajar Aswad saat tawaf', source: 'QS. Al-Baqarah: 201', emoji: '🤲', order: 4 },
  { title: 'Doa di Bukit Shafa dan Marwah', category: 'umrah', arabic: 'إِنَّ الصَّفَا وَالْمَرْوَةَ مِنْ شَعَائِرِ اللَّهِ. أَبْدَأُ بِمَا بَدَأَ اللَّهُ بِهِ. لاَ إِلَهَ إِلاَّ اللَّهُ وَحْدَهُ لاَ شَرِيكَ لَهُ، لَهُ الْمُلْكُ وَلَهُ الْحَمْدُ وَهُوَ عَلَى كُلِّ شَيْءٍ قَدِيرٌ', latin: "Innash-shafaa wal marwata min sya'aa'irillah. Abda'u bimaa bada'allahu bihi. Laa ilaaha illallahu wahdahu laa syariika lahu, lahul mulku wa lahul hamdu wa huwa 'alaa kulli syai'in qadiir", translation: "Sesungguhnya Shafa dan Marwah termasuk syi'ar-syi'ar Allah. Aku mulai dengan apa yang Allah mulai. Tiada Tuhan selain Allah semata, tidak ada sekutu bagi-Nya. Milik-Nya kerajaan dan pujian, dan Dia Maha Kuasa atas segala sesuatu.", occasion: "Dibaca saat tiba di bukit Shafa dan Marwah pada sa'i", source: 'QS. Al-Baqarah: 158, HR. Muslim', emoji: '⛰️', order: 5 },
  { title: 'Doa Minum Air Zamzam', category: 'umrah', arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ عِلْمًا نَافِعًا وَرِزْقًا وَاسِعًا وَشِفَاءً مِنْ كُلِّ دَاءٍ', latin: "Allahumma innii as'aluka 'ilman naafi'an wa rizqan waasi'an wa syifaa'an min kulli daa'", translation: 'Ya Allah, aku memohon kepada-Mu ilmu yang bermanfaat, rezeki yang luas, dan kesembuhan dari segala penyakit.', occasion: 'Dibaca saat minum air zamzam', source: 'HR. Ibnu Majah', emoji: '💧', order: 6 },
  { title: 'Doa Naik Kendaraan / Pesawat', category: 'perjalanan', arabic: 'سُبْحَانَ الَّذِي سَخَّرَ لَنَا هَذَا وَمَا كُنَّا لَهُ مُقْرِنِينَ وَإِنَّا إِلَى رَبِّنَا لَمُنْقَلِبُونَ', latin: "Subhaanal-ladzi sakhkhara lanaa haadza wa maa kunnaa lahu muqriniin, wa innaa ilaa rabbinaa lamunqalibuun", translation: 'Maha Suci Dzat yang telah menundukkan untuk kami (kendaraan) ini, padahal kami tidak mampu menguasainya. Dan sesungguhnya kami akan kembali kepada Tuhan kami.', occasion: 'Dibaca saat naik kendaraan atau pesawat', source: 'QS. Az-Zukhruf: 13-14', emoji: '✈️', order: 7 },
  { title: 'Doa Bepergian', category: 'perjalanan', arabic: 'اللَّهُمَّ إِنَّا نَسْأَلُكَ فِي سَفَرِنَا هَذَا الْبِرَّ وَالتَّقْوَى وَمِنَ الْعَمَلِ مَا تَرْضَى، اللَّهُمَّ هَوِّنْ عَلَيْنَا سَفَرَنَا هَذَا وَاطْوِ عَنَّا بُعْدَهُ', latin: "Allahumma innaa nas'aluka fii safarinaa hadal-birra wat-taqwaa wa minal 'amali maa tardhaa. Allahumma hawwin 'alainaa safaranaa haadza wathwi 'annaa bu'dahu", translation: 'Ya Allah, kami mohon dalam perjalanan ini kebaikan, ketakwaan, dan amalan yang Engkau ridhai. Ya Allah, mudahkanlah perjalanan ini bagi kami dan dekatkanlah jaraknya.', occasion: 'Dibaca saat memulai perjalanan umrah', source: 'HR. Muslim', emoji: '🧭', order: 8 },
  { title: 'Doa Masuk Masjid', category: 'masjid', arabic: 'اللَّهُمَّ افْتَحْ لِي أَبْوَابَ رَحْمَتِكَ', latin: 'Allahummaf-tah lii abwaaba rahmatik', translation: 'Ya Allah, bukakanlah untukku pintu-pintu rahmat-Mu.', occasion: 'Dibaca saat melangkah masuk masjid (masuk kaki kanan dahulu)', source: 'HR. Muslim', emoji: '🚪', order: 9 },
  { title: 'Doa Keluar Masjid', category: 'masjid', arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ مِنْ فَضْلِكَ', latin: "Allahumma innii as'aluka min fadhlika", translation: 'Ya Allah, sesungguhnya aku memohon keutamaan dari-Mu.', occasion: 'Dibaca saat keluar masjid (keluar kaki kiri dahulu)', source: 'HR. Muslim', emoji: '🚶', order: 10 },
  { title: 'Doa Sebelum Tidur', category: 'harian', arabic: 'بِاسْمِكَ اللَّهُمَّ أَمُوتُ وَأَحْيَا', latin: 'Bismika Allahumma amuutu wa ahyaa', translation: 'Dengan nama-Mu ya Allah, aku mati dan aku hidup.', occasion: 'Dibaca sebelum tidur', source: 'HR. Bukhari', emoji: '🌙', order: 11 },
  { title: 'Doa Bangun Tidur', category: 'harian', arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَحْيَانَا بَعْدَ مَا أَمَاتَنَا وَإِلَيْهِ النُّشُورُ', latin: "Alhamdu lillaahil-ladzii ahyaanaa ba'da maa amaatanaa wa ilaihin-nusyuur", translation: 'Segala puji bagi Allah yang telah menghidupkan kami setelah mematikan kami, dan kepada-Nya kami dikembalikan.', occasion: 'Dibaca saat bangun tidur', source: 'HR. Bukhari', emoji: '☀️', order: 12 },
  { title: 'Doa Sebelum Makan', category: 'harian', arabic: 'بِسْمِ اللَّهِ وَبِبَرَكَةِ اللَّهِ', latin: 'Bismillahi wa bibarakatillah', translation: 'Dengan nama Allah dan dengan berkah Allah.', occasion: 'Dibaca sebelum makan', source: 'HR. Abu Dawud', emoji: '🍽️', order: 13 },
  { title: 'Doa Sesudah Makan', category: 'harian', arabic: 'الْحَمْدُ لِلَّهِ الَّذِي أَطْعَمَنَا وَسَقَانَا وَجَعَلَنَا مُسْلِمِينَ', latin: "Alhamdu lillaahil-ladzi ath'amanaa wa saqaanaa wa ja'alanaa muslimiin", translation: 'Segala puji bagi Allah yang telah memberi makan dan minum kepada kami, dan menjadikan kami sebagai orang-orang muslim.', occasion: 'Dibaca setelah selesai makan', source: 'HR. Abu Dawud & Tirmidzi', emoji: '✅', order: 14 },
  { title: 'Doa Mohon Keselamatan', category: 'munajat', arabic: 'اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَافِيَةَ فِي الدُّنْيَا وَالْآخِرَةِ، اللَّهُمَّ إِنِّي أَسْأَلُكَ الْعَفْوَ وَالْعَافِيَةَ فِي دِينِي وَدُنْيَايَ وَأَهْلِي وَمَالِي', latin: "Allahumma innii as'alukal-'aafiyata fid-dunya wal-aakhirah. Allahumma innii as'alukal-'afwa wal-'aafiyata fii diinii wa dunyaaya wa ahlii wa maalii", translation: 'Ya Allah, aku memohon keselamatan di dunia dan akhirat. Ya Allah, aku memohon ampunan dan keselamatan dalam agamaku, duniaku, keluargaku, dan hartaku.', occasion: 'Dibaca kapan saja, terutama di Multazam atau saat sujud', source: 'HR. Abu Dawud & Ibnu Majah', emoji: '🛡️', order: 15 },
  { title: 'Doa Sayyidul Istighfar', category: 'munajat', arabic: 'اللَّهُمَّ أَنْتَ رَبِّي لاَ إِلَهَ إِلاَّ أَنْتَ، خَلَقْتَنِي وَأَنَا عَبْدُكَ، وَأَنَا عَلَى عَهْدِكَ وَوَعْدِكَ مَا اسْتَطَعْتُ، أَعُوذُ بِكَ مِنْ شَرِّ مَا صَنَعْتُ، أَبُوءُ لَكَ بِنِعْمَتِكَ عَلَيَّ وَأَبُوءُ بِذَنْبِي فَاغْفِرْ لِي فَإِنَّهُ لاَ يَغْفِرُ الذُّنُوبَ إِلاَّ أَنْتَ', latin: "Allahumma anta rabbii laa ilaaha illaa anta, khalaqtanii wa ana 'abduka, wa ana 'alaa 'ahdika wa wa'dika mastatho'tu, a'udzu bika min syarri maa shona'tu, abuu'u laka bini'matika 'alayya wa abuu'u bidzanbii faghfirlii fa innahu laa yaghfirudz-dzunuuba illaa anta", translation: 'Ya Allah, Engkau Tuhanku, tiada Tuhan selain Engkau. Engkau menciptakanku dan aku hamba-Mu. Aku berpegang pada janji-Mu semampuku. Aku berlindung dari keburukan perbuatanku. Aku mengakui nikmat-Mu dan mengakui dosaku, maka ampunilah aku karena tiada yang mengampuni dosa selain Engkau.', occasion: 'Penghulu istighfar, dibaca pagi dan sore hari', source: 'HR. Bukhari', emoji: '💎', order: 16 },
];

async function main() {
  const agencies = await prisma.agency.findMany({ select: { id: true, name: true } });

  if (agencies.length === 0) {
    console.log('No agencies found. Skipping seed.');
    return;
  }

  for (const agency of agencies) {
    // Check if already seeded
    const existingLessons = await prisma.manasikLesson.count({ where: { agencyId: agency.id } });
    const existingDoas = await prisma.doaPrayer.count({ where: { agencyId: agency.id } });

    if (existingLessons === 0) {
      console.log(`Seeding manasik lessons for agency: ${agency.name}`);
      await prisma.manasikLesson.createMany({
        data: MANASIK_LESSONS.map(l => ({ ...l, agencyId: agency.id })),
      });
      console.log(`  → ${MANASIK_LESSONS.length} lessons created`);
    } else {
      console.log(`Agency "${agency.name}" already has ${existingLessons} lessons, skipping.`);
    }

    if (existingDoas === 0) {
      console.log(`Seeding doa prayers for agency: ${agency.name}`);
      await prisma.doaPrayer.createMany({
        data: DOA_PRAYERS.map(d => ({ ...d, agencyId: agency.id })),
      });
      console.log(`  → ${DOA_PRAYERS.length} doas created`);
    } else {
      console.log(`Agency "${agency.name}" already has ${existingDoas} doas, skipping.`);
    }
  }

  console.log('\nSeed complete!');
}

main()
  .catch(console.error)
  .finally(() => {
    pool.end();
  });
