// Mock data for Manasik Digital (Umrah learning content)

export type ManasikCategory = 'all' | 'persiapan' | 'ihram' | 'tawaf' | 'sai' | 'tahallul' | 'sunnah';

export interface ManasikLesson {
  id: string;
  title: string;
  description: string;
  category: Exclude<ManasikCategory, 'all'>;
  order: number;
  duration: number; // minutes
  videoUrl: string | null; // YouTube embed URL (mock)
  content: string; // Rich text content
  tips: string[];
  isImportant: boolean;
  emoji: string;
}

export const manasikCategories = [
  { id: 'all' as ManasikCategory, label: 'Semua', icon: '📚', color: '#6B7280' },
  { id: 'persiapan' as ManasikCategory, label: 'Persiapan', icon: '🧳', color: '#2563EB' },
  { id: 'ihram' as ManasikCategory, label: 'Ihram', icon: '🕌', color: '#7C3AED' },
  { id: 'tawaf' as ManasikCategory, label: 'Tawaf', icon: '🕋', color: '#059669' },
  { id: 'sai' as ManasikCategory, label: "Sa'i", icon: '🏃', color: '#D97706' },
  { id: 'tahallul' as ManasikCategory, label: 'Tahallul', icon: '✂️', color: '#DC2626' },
  { id: 'sunnah' as ManasikCategory, label: 'Sunnah', icon: '⭐', color: '#0891B2' },
];

export const manasikLessons: ManasikLesson[] = [
  {
    id: '1',
    title: 'Niat dan Persiapan Sebelum Berangkat',
    description: 'Panduan lengkap persiapan umrah mulai dari niat, perlengkapan, hingga tips kesehatan.',
    category: 'persiapan',
    order: 1,
    duration: 15,
    videoUrl: null,
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
    id: '2',
    title: 'Miqat dan Tata Cara Ihram',
    description: 'Panduan berihram dari miqat, niat, dan larangan selama ihram.',
    category: 'ihram',
    order: 2,
    duration: 20,
    videoUrl: null,
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
    id: '3',
    title: 'Tawaf: Mengelilingi Ka\'bah',
    description: 'Tata cara tawaf 7 putaran mengelilingi Ka\'bah beserta doa-doanya.',
    category: 'tawaf',
    order: 3,
    duration: 25,
    videoUrl: null,
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
      'Jangan memaksakan diri untuk mencium Hajar Aswad jika sangat ramai',
      'Bawa botol air minum, tawaf bisa memakan waktu 1-2 jam',
    ],
    isImportant: true,
    emoji: '🕋',
  },
  {
    id: '4',
    title: "Sa'i: Antara Shafa dan Marwah",
    description: "Tata cara sa'i 7 kali perjalanan antara bukit Shafa dan Marwah.",
    category: 'sai',
    order: 4,
    duration: 20,
    videoUrl: null,
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
      'Bawa air minum, tersedia juga air zamzam di area sa\'i',
    ],
    isImportant: true,
    emoji: '🏃',
  },
  {
    id: '5',
    title: 'Tahallul: Mencukur/Memotong Rambut',
    description: 'Panduan tahallul sebagai penutup ibadah umrah.',
    category: 'tahallul',
    order: 5,
    duration: 10,
    videoUrl: null,
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
    id: '6',
    title: 'Shalat di Masjidil Haram',
    description: 'Keutamaan dan panduan shalat di Masjidil Haram.',
    category: 'sunnah',
    order: 6,
    duration: 12,
    videoUrl: null,
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
    id: '7',
    title: 'Ziarah ke Masjid Nabawi',
    description: 'Panduan ziarah ke Masjid Nabawi di Madinah dan adab-adabnya.',
    category: 'sunnah',
    order: 7,
    duration: 15,
    videoUrl: null,
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
    id: '8',
    title: 'Minum Air Zamzam',
    description: 'Keutamaan dan doa saat minum air zamzam.',
    category: 'sunnah',
    order: 8,
    duration: 8,
    videoUrl: null,
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
      'Bawa botol untuk diisi air zamzam saat tawaf/sa\'i',
    ],
    isImportant: false,
    emoji: '💧',
  },
];
