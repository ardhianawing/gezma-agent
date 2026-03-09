import { NextRequest, NextResponse } from 'next/server';
import { courses } from '@/data/mock-academy';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; lessonId: string }> }
) {
  const { id, lessonId } = await params;

  const course = courses.find((c) => c.id === id);
  if (!course) {
    return NextResponse.json({ error: 'Kursus tidak ditemukan' }, { status: 404 });
  }

  // Extract lesson order from lessonId pattern: course-XXX-lesson-N
  const lessonMatch = lessonId.match(/lesson-(\d+)$/);
  const lessonOrder = lessonMatch ? parseInt(lessonMatch[1], 10) : 1;

  if (lessonOrder < 1 || lessonOrder > course.lessonCount) {
    return NextResponse.json({ error: 'Pelajaran tidak ditemukan' }, { status: 404 });
  }

  const lessonTitle = `Pelajaran ${lessonOrder}: ${course.title} - Bagian ${lessonOrder}`;

  const content = `# ${lessonTitle}

## Pendahuluan

Selamat datang di pelajaran ${lessonOrder} dari kursus **${course.title}**. Pada bagian ini, kita akan membahas konsep-konsep penting yang berkaitan dengan materi kursus.

## Tujuan Pembelajaran

- Memahami konsep dasar bagian ${lessonOrder}
- Mampu mengaplikasikan teori ke dalam praktik
- Menyelesaikan latihan dan evaluasi

## Materi

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.

### Sub-topik ${lessonOrder}.1

Penjelasan detail tentang sub-topik pertama. Dalam konteks ${course.category}, hal ini sangat penting untuk dipahami.

### Sub-topik ${lessonOrder}.2

Pembahasan lanjutan yang mengintegrasikan konsep sebelumnya dengan materi baru.

## Rangkuman

Pada pelajaran ini, kita telah mempelajari poin-poin penting terkait bagian ${lessonOrder} dari ${course.title}. Pastikan untuk mengerjakan latihan sebelum melanjutkan ke pelajaran berikutnya.

---

*Kursus oleh ${course.instructor} - ${course.instructorRole}*
`;

  return NextResponse.json({
    id: lessonId,
    courseId: id,
    title: lessonTitle,
    content,
    videoUrl: course.videoUrl,
    order: lessonOrder,
    duration: `${Math.floor(Math.random() * 20 + 10)} menit`,
  });
}
