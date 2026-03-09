import { NextRequest, NextResponse } from 'next/server';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;

  const mockQuestions = [
    {
      id: `${courseId}-q1`,
      question: 'Apa langkah pertama dalam proses ini?',
      options: ['Perencanaan', 'Pelaksanaan', 'Evaluasi', 'Dokumentasi'],
      order: 0,
    },
    {
      id: `${courseId}-q2`,
      question: 'Manakah yang termasuk komponen utama?',
      options: ['Semua benar', 'Hanya A dan B', 'Hanya C', 'Tidak ada yang benar'],
      order: 1,
    },
    {
      id: `${courseId}-q3`,
      question: 'Bagaimana cara terbaik mengelola proses ini?',
      options: ['Secara bertahap', 'Sekaligus', 'Tidak perlu dikelola', 'Tergantung situasi'],
      order: 2,
    },
    {
      id: `${courseId}-q4`,
      question: 'Apa tujuan utama dari materi ini?',
      options: ['Meningkatkan kompetensi', 'Menambah biaya', 'Mengurangi waktu', 'Semua salah'],
      order: 3,
    },
    {
      id: `${courseId}-q5`,
      question: 'Kapan waktu terbaik untuk melakukan evaluasi?',
      options: ['Setelah selesai', 'Sebelum mulai', 'Saat berlangsung', 'Tidak perlu evaluasi'],
      order: 4,
    },
  ];

  return NextResponse.json({
    id: `quiz-${courseId}`,
    courseId,
    title: 'Quiz Akhir Kursus',
    passScore: 70,
    questions: mockQuestions,
    totalQuestions: mockQuestions.length,
    bestAttempt: null,
  });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ courseId: string }> }
) {
  const { courseId } = await params;
  const body = await req.json();
  const { title, passScore, questions } = body;

  if (!title || !questions || !Array.isArray(questions) || questions.length === 0) {
    return NextResponse.json({ error: 'title dan questions wajib diisi' }, { status: 400 });
  }

  return NextResponse.json(
    {
      id: `quiz-${courseId}`,
      courseId,
      title,
      passScore: passScore ?? 70,
      questions: questions.map((q: { question: string; options: string[]; correctIndex: number }, idx: number) => ({
        id: `${courseId}-q${idx + 1}`,
        question: q.question,
        options: q.options,
        correctIndex: q.correctIndex,
        order: idx,
      })),
    },
    { status: 201 }
  );
}
