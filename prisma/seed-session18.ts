/**
 * Session 18 Seed: Academy (Sertifikasi Mutawwif), GezmaPay, Tabungan Umrah, PayLater
 *
 * Seeds new academy courses, lessons, quizzes, GezmaPay wallet/transactions,
 * Umrah savings plan/deposits, and PayLater applications/installments.
 */

import type { PrismaClient } from '../src/generated/prisma/client';

const AGENCY_ID = '00000000-0000-4000-a000-000000000001';

const S18_IDS = {
  courses: [
    '00000000-0000-4000-a000-000000000502',
    '00000000-0000-4000-a000-000000000503',
    '00000000-0000-4000-a000-000000000504',
  ],
  lessons: [
    '00000000-0000-4000-a000-000000000604',
    '00000000-0000-4000-a000-000000000605',
    '00000000-0000-4000-a000-000000000606',
    '00000000-0000-4000-a000-000000000607',
    '00000000-0000-4000-a000-000000000608',
    '00000000-0000-4000-a000-000000000609',
  ],
  quizzes: [
    '00000000-0000-4000-a000-000000000702',
    '00000000-0000-4000-a000-000000000703',
    '00000000-0000-4000-a000-000000000704',
  ],
  wallet: '00000000-0000-4000-a000-000000000800',
  transactions: [
    '00000000-0000-4000-a000-000000000810',
    '00000000-0000-4000-a000-000000000811',
    '00000000-0000-4000-a000-000000000812',
    '00000000-0000-4000-a000-000000000813',
    '00000000-0000-4000-a000-000000000814',
    '00000000-0000-4000-a000-000000000815',
    '00000000-0000-4000-a000-000000000816',
    '00000000-0000-4000-a000-000000000817',
    '00000000-0000-4000-a000-000000000818',
    '00000000-0000-4000-a000-000000000819',
  ],
  savings: '00000000-0000-4000-a000-000000000820',
  deposits: [
    '00000000-0000-4000-a000-000000000830',
    '00000000-0000-4000-a000-000000000831',
    '00000000-0000-4000-a000-000000000832',
    '00000000-0000-4000-a000-000000000833',
    '00000000-0000-4000-a000-000000000834',
    '00000000-0000-4000-a000-000000000835',
    '00000000-0000-4000-a000-000000000836',
    '00000000-0000-4000-a000-000000000837',
  ],
  paylaterApps: [
    '00000000-0000-4000-a000-000000000840',
    '00000000-0000-4000-a000-000000000841',
  ],
  installments: [
    '00000000-0000-4000-a000-000000000850',
    '00000000-0000-4000-a000-000000000851',
    '00000000-0000-4000-a000-000000000852',
    '00000000-0000-4000-a000-000000000853',
    '00000000-0000-4000-a000-000000000854',
    '00000000-0000-4000-a000-000000000855',
    '00000000-0000-4000-a000-000000000856',
    '00000000-0000-4000-a000-000000000857',
    '00000000-0000-4000-a000-000000000858',
    '00000000-0000-4000-a000-000000000859',
    '00000000-0000-4000-a000-00000000085A',
    '00000000-0000-4000-a000-00000000085B',
  ],
};

async function seedAcademyCourses(prisma: any) {
  console.log('Seeding academy courses (Sertifikasi Mutawwif)...');

  const courses = [
    {
      id: S18_IDS.courses[0],
      title: 'Sertifikasi Mutawwif Level 1',
      description: 'Program sertifikasi dasar untuk calon mutawwif. Pelajari fondasi pembimbingan jamaah umrah.',
      category: 'manasik',
      level: 'pemula',
      duration: '8 jam',
      instructorName: 'Syeikh Abdullah',
      totalLessons: 3,
      order: 3,
    },
    {
      id: S18_IDS.courses[1],
      title: 'Sertifikasi Mutawwif Level 2',
      description: 'Program sertifikasi lanjutan untuk mutawwif berpengalaman. Tingkatkan kompetensi penanganan situasi kompleks.',
      category: 'manasik',
      level: 'menengah',
      duration: '10 jam',
      instructorName: 'Dr. Fatimah Hassan',
      totalLessons: 3,
      order: 4,
    },
    {
      id: S18_IDS.courses[2],
      title: 'Manajemen Bisnis Travel Modern',
      description: 'Kuasai strategi bisnis travel modern termasuk digital marketing, financial management, dan teknologi terkini.',
      category: 'bisnis',
      level: 'lanjutan',
      duration: '12 jam',
      instructorName: 'Prof. Ahmad Ridwan',
      totalLessons: 3,
      order: 5,
    },
  ];

  for (const course of courses) {
    const existing = await prisma.academyCourse.findUnique({ where: { id: course.id } });
    if (!existing) {
      await prisma.academyCourse.create({ data: course });
    }
  }
  console.log('  Created 3 academy courses');
}

async function seedAcademyLessons(prisma: any) {
  console.log('Seeding academy lessons...');

  const lessons = [
    {
      id: S18_IDS.lessons[0],
      courseId: S18_IDS.courses[0],
      title: 'Dasar-dasar Pembimbingan Jamaah',
      content: '## Dasar-dasar Pembimbingan Jamaah\n\nSeorang mutawwif harus memahami prinsip dasar dalam membimbing jamaah umrah. Mulai dari persiapan sebelum keberangkatan, selama di Tanah Suci, hingga kepulangan.\n\n### Kompetensi Utama\n1. Komunikasi efektif dengan jamaah\n2. Penguasaan manasik umrah\n3. Pengetahuan lokasi dan navigasi\n4. Penanganan keluhan jamaah',
      order: 1,
      duration: '60 menit',
    },
    {
      id: S18_IDS.lessons[1],
      courseId: S18_IDS.courses[0],
      title: 'Etika dan Adab Mutawwif',
      content: '## Etika dan Adab Mutawwif\n\nMutawwif tidak hanya bertugas sebagai pemandu, tetapi juga sebagai teladan bagi jamaah. Etika dan adab yang baik akan menciptakan pengalaman ibadah yang bermakna.\n\n### Prinsip Etika\n1. Sabar dan lemah lembut\n2. Menjaga amanah jamaah\n3. Bersikap adil dan tidak diskriminatif\n4. Menjaga kehormatan dan privasi jamaah',
      order: 2,
      duration: '45 menit',
    },
    {
      id: S18_IDS.lessons[2],
      courseId: S18_IDS.courses[1],
      title: 'Penanganan Situasi Darurat',
      content: '## Penanganan Situasi Darurat\n\nMutawwif harus siap menghadapi berbagai situasi darurat yang mungkin terjadi selama perjalanan umrah.\n\n### Jenis Situasi Darurat\n1. Jamaah tersesat di Masjidil Haram\n2. Kondisi kesehatan darurat\n3. Kehilangan dokumen penting\n4. Masalah akomodasi atau transportasi\n5. Bencana alam atau keadaan force majeure',
      order: 1,
      duration: '75 menit',
    },
    {
      id: S18_IDS.lessons[3],
      courseId: S18_IDS.courses[1],
      title: 'Komunikasi Lintas Budaya',
      content: '## Komunikasi Lintas Budaya\n\nJamaah umrah berasal dari berbagai latar belakang budaya dan suku di Indonesia. Mutawwif perlu memahami perbedaan budaya untuk komunikasi yang efektif.\n\n### Aspek Penting\n1. Memahami keragaman budaya jamaah\n2. Adaptasi gaya komunikasi\n3. Sensitivitas terhadap adat istiadat lokal\n4. Penggunaan bahasa yang inklusif',
      order: 2,
      duration: '60 menit',
    },
    {
      id: S18_IDS.lessons[4],
      courseId: S18_IDS.courses[2],
      title: 'Digital Marketing untuk Travel',
      content: '## Digital Marketing untuk Travel Umrah\n\nEra digital membuka peluang besar bagi biro travel umrah untuk menjangkau lebih banyak calon jamaah melalui platform online.\n\n### Strategi Utama\n1. Social media marketing (Instagram, TikTok, Facebook)\n2. Search engine optimization (SEO)\n3. Content marketing dan storytelling\n4. Email marketing dan WhatsApp broadcast\n5. Paid advertising dan retargeting',
      order: 1,
      duration: '90 menit',
    },
    {
      id: S18_IDS.lessons[5],
      courseId: S18_IDS.courses[2],
      title: 'Financial Management Biro Umrah',
      content: '## Financial Management Biro Umrah\n\nManajemen keuangan yang sehat adalah fondasi bisnis travel umrah yang berkelanjutan.\n\n### Topik Pembahasan\n1. Struktur HPP (Harga Pokok Penjualan) paket umrah\n2. Cash flow management dan forecasting\n3. Margin dan pricing strategy\n4. Pengelolaan dana jamaah (trust account)\n5. Pelaporan keuangan dan pajak',
      order: 2,
      duration: '90 menit',
    },
  ];

  for (const lesson of lessons) {
    const existing = await prisma.academyLesson.findUnique({ where: { id: lesson.id } });
    if (!existing) {
      await prisma.academyLesson.create({ data: lesson });
    }
  }
  console.log('  Created 6 academy lessons');
}

async function seedAcademyQuizzes(prisma: any) {
  console.log('Seeding academy quizzes...');

  const quizzes = [
    {
      id: S18_IDS.quizzes[0],
      courseId: S18_IDS.courses[0],
      title: 'Quiz: Sertifikasi Mutawwif Level 1',
      passScore: 70,
      questions: [
        {
          question: 'Apa tugas utama seorang mutawwif?',
          options: ['Menjual paket umrah', 'Membimbing jamaah dalam ibadah umrah', 'Mengurus dokumen perjalanan', 'Menyediakan akomodasi'],
          correctIndex: 1,
          order: 1,
        },
        {
          question: 'Apa yang harus dilakukan mutawwif saat jamaah tersesat?',
          options: ['Menunggu jamaah kembali sendiri', 'Segera melakukan koordinasi dan pencarian', 'Melaporkan ke polisi setempat saja', 'Mengabaikan dan melanjutkan jadwal'],
          correctIndex: 1,
          order: 2,
        },
        {
          question: 'Berapa jumlah putaran tawaf yang benar saat umrah?',
          options: ['5 putaran', '6 putaran', '7 putaran', '9 putaran'],
          correctIndex: 2,
          order: 3,
        },
        {
          question: 'Sikap yang TIDAK sesuai dengan etika mutawwif adalah?',
          options: ['Sabar menghadapi jamaah', 'Membeda-bedakan jamaah berdasarkan status', 'Menjaga amanah jamaah', 'Bersikap lemah lembut'],
          correctIndex: 1,
          order: 4,
        },
        {
          question: 'Miqat untuk jamaah yang berangkat dari Madinah ke Makkah adalah?',
          options: ['Yalamlam', 'Qarnul Manazil', 'Dzul Hulaifah (Bir Ali)', 'Juhfah'],
          correctIndex: 2,
          order: 5,
        },
      ],
    },
    {
      id: S18_IDS.quizzes[1],
      courseId: S18_IDS.courses[1],
      title: 'Quiz: Sertifikasi Mutawwif Level 2',
      passScore: 70,
      questions: [
        {
          question: 'Apa langkah pertama saat menghadapi jamaah yang sakit di Tanah Suci?',
          options: ['Langsung bawa ke rumah sakit', 'Lakukan pertolongan pertama dan evaluasi kondisi', 'Hubungi keluarga di Indonesia', 'Biarkan jamaah istirahat di hotel'],
          correctIndex: 1,
          order: 1,
        },
        {
          question: 'Bagaimana cara menangani jamaah yang kehilangan paspor?',
          options: ['Suruh jamaah mengurus sendiri', 'Koordinasi dengan KJRI dan siapkan dokumen pengganti', 'Beli tiket baru untuk jamaah', 'Tunggu sampai paspor ditemukan'],
          correctIndex: 1,
          order: 2,
        },
        {
          question: 'Apa yang dimaksud dengan komunikasi lintas budaya dalam konteks umrah?',
          options: ['Berbicara dalam bahasa Arab', 'Kemampuan berkomunikasi efektif dengan jamaah dari berbagai latar belakang', 'Menggunakan penerjemah profesional', 'Hanya berbicara bahasa Indonesia baku'],
          correctIndex: 1,
          order: 3,
        },
        {
          question: 'Saat terjadi stampede di area Masjidil Haram, apa yang harus dilakukan mutawwif?',
          options: ['Ikut bergerak dengan kerumunan', 'Arahkan jamaah ke area aman dan hindari kerumunan', 'Menunggu situasi reda', 'Membubarkan jamaah sendiri-sendiri'],
          correctIndex: 1,
          order: 4,
        },
        {
          question: 'Bagaimana cara efektif menangani keluhan jamaah yang beragam budaya?',
          options: ['Abaikan keluhan minor', 'Dengarkan aktif, pahami konteks budaya, dan berikan solusi yang sesuai', 'Samakan perlakuan tanpa memperhatikan budaya', 'Serahkan ke pihak hotel'],
          correctIndex: 1,
          order: 5,
        },
      ],
    },
    {
      id: S18_IDS.quizzes[2],
      courseId: S18_IDS.courses[2],
      title: 'Quiz: Manajemen Bisnis Travel Modern',
      passScore: 70,
      questions: [
        {
          question: 'Apa komponen terbesar dalam HPP paket umrah biasanya?',
          options: ['Visa', 'Tiket pesawat', 'Hotel', 'Transportasi lokal'],
          correctIndex: 1,
          order: 1,
        },
        {
          question: 'Platform mana yang paling efektif untuk pemasaran digital travel umrah saat ini?',
          options: ['LinkedIn saja', 'Kombinasi Instagram, TikTok, dan WhatsApp', 'Email marketing saja', 'Website saja'],
          correctIndex: 1,
          order: 2,
        },
        {
          question: 'Apa fungsi trust account dalam bisnis travel umrah?',
          options: ['Menyimpan gaji karyawan', 'Memisahkan dana jamaah dari dana operasional perusahaan', 'Membayar pajak perusahaan', 'Investasi perusahaan'],
          correctIndex: 1,
          order: 3,
        },
        {
          question: 'Berapa margin yang umumnya sehat untuk paket umrah reguler?',
          options: ['1-3%', '5-15%', '25-30%', '40-50%'],
          correctIndex: 1,
          order: 4,
        },
        {
          question: 'Apa keuntungan utama SEO untuk bisnis travel umrah?',
          options: ['Hasil instan dalam satu hari', 'Traffic organik jangka panjang dari calon jamaah yang aktif mencari', 'Tidak perlu website', 'Menggantikan semua channel marketing lainnya'],
          correctIndex: 1,
          order: 5,
        },
      ],
    },
  ];

  for (const quiz of quizzes) {
    const existing = await prisma.academyQuiz.findUnique({ where: { id: quiz.id } });
    if (!existing) {
      await prisma.academyQuiz.create({
        data: {
          id: quiz.id,
          courseId: quiz.courseId,
          title: quiz.title,
          passScore: quiz.passScore,
          questions: {
            create: quiz.questions,
          },
        },
      });
    }
  }
  console.log('  Created 3 quizzes with 5 questions each');
}

async function seedGezmaPayWallet(prisma: any) {
  console.log('Seeding GezmaPay wallet & transactions...');

  const existingWallet = await prisma.gezmaPayWallet.findUnique({ where: { agencyId: AGENCY_ID } });
  if (existingWallet) {
    console.log('  Skipping GezmaPay wallet (already exists)');
    return;
  }

  await prisma.gezmaPayWallet.create({
    data: {
      id: S18_IDS.wallet,
      agencyId: AGENCY_ID,
      balance: 2500000,
      currency: 'IDR',
      isActive: true,
    },
  });

  const transactions = [
    { id: S18_IDS.transactions[0], type: 'topup', amount: 5000000, description: 'Top up saldo awal', reference: 'TU-20260101-001', status: 'completed', balanceAfter: 5000000, createdAt: new Date('2026-01-05T08:00:00Z') },
    { id: S18_IDS.transactions[1], type: 'payment', amount: -1200000, description: 'Pembayaran visa umrah - Hasan Abdullah', reference: 'PY-20260110-001', status: 'completed', balanceAfter: 3800000, createdAt: new Date('2026-01-10T10:30:00Z') },
    { id: S18_IDS.transactions[2], type: 'payment', amount: -550000, description: 'Pembayaran visa umrah - Fatimah Zahra', reference: 'PY-20260112-002', status: 'completed', balanceAfter: 3250000, createdAt: new Date('2026-01-12T14:00:00Z') },
    { id: S18_IDS.transactions[3], type: 'topup', amount: 3000000, description: 'Top up saldo via bank transfer', reference: 'TU-20260115-002', status: 'completed', balanceAfter: 6250000, createdAt: new Date('2026-01-15T09:00:00Z') },
    { id: S18_IDS.transactions[4], type: 'payment', amount: -2500000, description: 'Pembayaran handling bandara group', reference: 'PY-20260120-003', status: 'completed', balanceAfter: 3750000, createdAt: new Date('2026-01-20T11:15:00Z') },
    { id: S18_IDS.transactions[5], type: 'refund', amount: 550000, description: 'Refund visa - Fatimah Zahra (batal)', reference: 'RF-20260125-001', status: 'completed', balanceAfter: 4300000, createdAt: new Date('2026-01-25T16:00:00Z') },
    { id: S18_IDS.transactions[6], type: 'payment', amount: -1800000, description: 'Pembayaran hotel tambahan Makkah', reference: 'PY-20260201-004', status: 'completed', balanceAfter: 2500000, createdAt: new Date('2026-02-01T13:30:00Z') },
    { id: S18_IDS.transactions[7], type: 'topup', amount: 2000000, description: 'Top up saldo via QRIS', reference: 'TU-20260205-003', status: 'completed', balanceAfter: 4500000, createdAt: new Date('2026-02-05T08:45:00Z') },
    { id: S18_IDS.transactions[8], type: 'payment', amount: -1500000, description: 'Pembayaran mutawwif - Trip Maret', reference: 'PY-20260210-005', status: 'completed', balanceAfter: 3000000, createdAt: new Date('2026-02-10T10:00:00Z') },
    { id: S18_IDS.transactions[9], type: 'payment', amount: -500000, description: 'Pembayaran asuransi perjalanan group', reference: 'PY-20260215-006', status: 'completed', balanceAfter: 2500000, createdAt: new Date('2026-02-15T15:20:00Z') },
  ];

  for (const tx of transactions) {
    await prisma.gezmaPayTransaction.create({
      data: {
        ...tx,
        walletId: S18_IDS.wallet,
      },
    });
  }
  console.log('  Created 1 wallet + 10 transactions');
}

async function seedUmrahSavings(prisma: any) {
  console.log('Seeding Tabungan Umrah...');

  const existing = await prisma.umrahSavings.findUnique({ where: { id: S18_IDS.savings } });
  if (existing) {
    console.log('  Skipping Tabungan Umrah (already exists)');
    return;
  }

  await prisma.umrahSavings.create({
    data: {
      id: S18_IDS.savings,
      agencyId: AGENCY_ID,
      pilgrimName: 'Hasan Abdullah',
      targetAmount: 25000000,
      currentAmount: 15000000,
      targetDate: new Date('2026-12-31'),
      packageName: 'Paket Reguler 9 Hari',
      status: 'active',
    },
  });

  const deposits = [
    { id: S18_IDS.deposits[0], amount: 3000000, method: 'transfer', notes: 'Setoran awal', balanceAfter: 3000000, createdAt: new Date('2026-01-05T08:00:00Z') },
    { id: S18_IDS.deposits[1], amount: 2000000, method: 'transfer', notes: 'Setoran bulanan Januari', balanceAfter: 5000000, createdAt: new Date('2026-01-20T10:00:00Z') },
    { id: S18_IDS.deposits[2], amount: 2000000, method: 'auto_debit', notes: 'Auto debit Februari', balanceAfter: 7000000, createdAt: new Date('2026-02-01T00:05:00Z') },
    { id: S18_IDS.deposits[3], amount: 1500000, method: 'cash', notes: 'Setoran tunai di kantor', balanceAfter: 8500000, createdAt: new Date('2026-02-10T14:30:00Z') },
    { id: S18_IDS.deposits[4], amount: 2000000, method: 'transfer', notes: 'Setoran bulanan Februari', balanceAfter: 10500000, createdAt: new Date('2026-02-20T09:00:00Z') },
    { id: S18_IDS.deposits[5], amount: 2000000, method: 'auto_debit', notes: 'Auto debit Maret', balanceAfter: 12500000, createdAt: new Date('2026-03-01T00:05:00Z') },
    { id: S18_IDS.deposits[6], amount: 1500000, method: 'transfer', notes: 'Setoran tambahan', balanceAfter: 14000000, createdAt: new Date('2026-03-05T11:00:00Z') },
    { id: S18_IDS.deposits[7], amount: 1000000, method: 'cash', notes: 'Setoran tunai', balanceAfter: 15000000, createdAt: new Date('2026-03-10T15:00:00Z') },
  ];

  for (const deposit of deposits) {
    await prisma.umrahSavingsDeposit.create({
      data: {
        ...deposit,
        savingsId: S18_IDS.savings,
      },
    });
  }
  console.log('  Created 1 savings plan + 8 deposits');
}

async function seedPayLater(prisma: any) {
  console.log('Seeding PayLater Syariah...');

  // Application 1: Approved, 25jt, 12 months
  const existing1 = await prisma.payLaterApplication.findUnique({ where: { id: S18_IDS.paylaterApps[0] } });
  if (!existing1) {
    const monthlyAmount1 = Math.round((25000000 * 1.10) / 12); // 10% margin, 12 months
    await prisma.payLaterApplication.create({
      data: {
        id: S18_IDS.paylaterApps[0],
        agencyId: AGENCY_ID,
        pilgrimName: 'Muhammad Rizki',
        pilgrimPhone: '081234567812',
        totalAmount: 25000000,
        tenorMonths: 12,
        monthlyAmount: monthlyAmount1,
        akadType: 'murabahah',
        marginRate: 10,
        status: 'approved',
        notes: 'Paket Reguler 9 Hari - disetujui setelah verifikasi dokumen',
      },
    });

    // Create 12 installments
    for (let i = 0; i < 12; i++) {
      const dueDate = new Date(2026, i, 15); // 15th of each month
      const isPaid = i < 2; // First 2 installments paid
      await prisma.payLaterInstallment.create({
        data: {
          id: S18_IDS.installments[i],
          applicationId: S18_IDS.paylaterApps[0],
          installmentNo: i + 1,
          amount: monthlyAmount1,
          dueDate,
          paidAt: isPaid ? new Date(2026, i, 14) : null,
          status: isPaid ? 'paid' : 'pending',
        },
      });
    }
    console.log('  Created PayLater application 1 (approved) + 12 installments');
  }

  // Application 2: Pending, 38jt, 6 months
  const existing2 = await prisma.payLaterApplication.findUnique({ where: { id: S18_IDS.paylaterApps[1] } });
  if (!existing2) {
    const monthlyAmount2 = Math.round((38000000 * 1.08) / 6); // 8% margin, 6 months
    await prisma.payLaterApplication.create({
      data: {
        id: S18_IDS.paylaterApps[1],
        agencyId: AGENCY_ID,
        pilgrimName: 'Aisyah Putri',
        pilgrimPhone: '081234567813',
        totalAmount: 38000000,
        tenorMonths: 6,
        monthlyAmount: monthlyAmount2,
        akadType: 'murabahah',
        marginRate: 8,
        status: 'pending',
        notes: 'Paket VIP 12 Hari - menunggu verifikasi dokumen',
      },
    });
    console.log('  Created PayLater application 2 (pending)');
  }
}

export async function seedSession18(prisma: any) {
  console.log('\n--- Session 18 Seed: Academy, GezmaPay, Tabungan, PayLater ---\n');
  await seedAcademyCourses(prisma);
  await seedAcademyLessons(prisma);
  await seedAcademyQuizzes(prisma);
  await seedGezmaPayWallet(prisma);
  await seedUmrahSavings(prisma);
  await seedPayLater(prisma);
}
