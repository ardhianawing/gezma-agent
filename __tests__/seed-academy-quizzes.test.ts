import { describe, it, expect } from 'vitest';

// Quiz data structure validation (mirrors seed-academy-quizzes.ts)
interface QuizQuestion {
  question: string;
  options: string[];
  correctIndex: number;
  order: number;
}

const QUIZ_SAMPLES: { title: string; passScore: number; questions: QuizQuestion[] }[] = [
  {
    title: 'Quiz: Dasar Manajemen Umrah',
    passScore: 70,
    questions: [
      { question: 'Apa dokumen utama yang wajib dimiliki jemaah untuk berangkat umrah?', options: ['KTP saja', 'Paspor dengan masa berlaku minimal 6 bulan', 'SIM Internasional', 'Kartu keluarga'], correctIndex: 1, order: 1 },
      { question: 'Siapa pihak yang berwenang mengeluarkan izin PPIU di Indonesia?', options: ['Kemenlu', 'Kemenag', 'Kemenkumham', 'Kemenhub'], correctIndex: 1, order: 2 },
      { question: 'Berapa jumlah minimal peserta?', options: ['5 orang', '10 orang', '15 orang', '20 orang'], correctIndex: 0, order: 3 },
      { question: 'Apa fungsi manifest?', options: ['Daftar harga paket', 'Daftar nama jemaah', 'Laporan keuangan', 'Daftar vendor'], correctIndex: 1, order: 4 },
      { question: 'Apa yang dimaksud dengan muthawwif?', options: ['Supir bus', 'Pembimbing ibadah jemaah', 'Petugas bandara', 'Agen tiket'], correctIndex: 1, order: 5 },
    ],
  },
  {
    title: 'Quiz: Panduan Manasik',
    passScore: 70,
    questions: [
      { question: 'Apa rukun umrah yang pertama?', options: ['Tawaf', 'Ihram', "Sa'i", 'Tahallul'], correctIndex: 1, order: 1 },
      { question: 'Berapa kali putaran tawaf?', options: ['3', '5', '7', '9'], correctIndex: 2, order: 2 },
      { question: "Sa'i antara bukit?", options: ['Tursina dan Uhud', 'Shafa dan Marwa', 'Arafah dan Mina', 'Nur dan Rahmah'], correctIndex: 1, order: 3 },
      { question: 'Apa tahallul?', options: ['Membaca talbiyah', 'Mencukur rambut', 'Memakai ihram', "Berdo'a di Multazam"], correctIndex: 1, order: 4 },
      { question: 'Miqat dari Madinah?', options: ['Yalamlam', 'Qarnul Manazil', 'Dzul Hulaifah', 'Juhfah'], correctIndex: 2, order: 5 },
    ],
  },
];

describe('Academy Quiz Data Validation', () => {
  it('should have valid quiz structure', () => {
    for (const quiz of QUIZ_SAMPLES) {
      expect(quiz.title).toBeTruthy();
      expect(quiz.passScore).toBeGreaterThan(0);
      expect(quiz.passScore).toBeLessThanOrEqual(100);
    }
  });

  it('should have exactly 5 questions per quiz', () => {
    for (const quiz of QUIZ_SAMPLES) {
      expect(quiz.questions.length).toBe(5);
    }
  });

  it('should have exactly 4 options per question', () => {
    for (const quiz of QUIZ_SAMPLES) {
      for (const q of quiz.questions) {
        expect(q.options.length).toBe(4);
      }
    }
  });

  it('should have valid correctIndex (0-3)', () => {
    for (const quiz of QUIZ_SAMPLES) {
      for (const q of quiz.questions) {
        expect(q.correctIndex).toBeGreaterThanOrEqual(0);
        expect(q.correctIndex).toBeLessThanOrEqual(3);
      }
    }
  });

  it('should have sequential order values', () => {
    for (const quiz of QUIZ_SAMPLES) {
      const orders = quiz.questions.map(q => q.order);
      expect(orders).toEqual([1, 2, 3, 4, 5]);
    }
  });

  it('should have non-empty question text', () => {
    for (const quiz of QUIZ_SAMPLES) {
      for (const q of quiz.questions) {
        expect(q.question.length).toBeGreaterThan(10);
      }
    }
  });

  it('should have non-empty option text', () => {
    for (const quiz of QUIZ_SAMPLES) {
      for (const q of quiz.questions) {
        for (const opt of q.options) {
          expect(opt.length).toBeGreaterThan(0);
        }
      }
    }
  });

  it('should have pass score of 70', () => {
    for (const quiz of QUIZ_SAMPLES) {
      expect(quiz.passScore).toBe(70);
    }
  });
});
