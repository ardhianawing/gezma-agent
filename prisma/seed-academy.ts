import { PrismaClient } from '../src/generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { courses } from '../src/data/mock-academy';
import 'dotenv/config';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

// Generate lesson titles per category
const lessonTemplates: Record<string, string[]> = {
  operasional: [
    'Pengantar & Dasar-Dasar',
    'Proses dan Prosedur Standar',
    'Manajemen Tim Operasional',
  ],
  manasik: [
    'Dasar-Dasar Ibadah',
    'Tata Cara Pelaksanaan',
    'Doa dan Dzikir Terkait',
  ],
  bisnis: [
    'Analisis dan Strategi',
    'Implementasi Praktis',
    'Studi Kasus dan Evaluasi',
  ],
  tutorial: [
    'Memulai dengan Fitur Ini',
    'Fitur Lanjutan',
    'Tips dan Trik',
  ],
};

function generateLessonContent(lessonTitle: string, courseTitle: string): string {
  return `# ${lessonTitle}

Bagian dari kursus: **${courseTitle}**

## Pendahuluan

Pada pelajaran ini, Anda akan mempelajari konsep-konsep penting terkait ${lessonTitle.toLowerCase()}. Materi ini dirancang untuk memberikan pemahaman yang komprehensif dan praktis.

## Poin Penting

- Memahami dasar-dasar ${lessonTitle.toLowerCase()}
- Menerapkan konsep dalam konteks nyata
- Mengevaluasi hasil dan melakukan perbaikan

## Materi Inti

Lorem ipsum dolor sit amet, consectetur adipiscing elit. Pelajaran ini mencakup berbagai aspek yang relevan dengan topik utama. Setiap bagian dirancang agar mudah dipahami dan langsung dapat diterapkan.

### Sub-topik 1

Penjelasan detail mengenai sub-topik pertama. Disertai contoh-contoh praktis yang relevan dengan industri travel haji dan umrah.

### Sub-topik 2

Pembahasan mendalam mengenai sub-topik kedua. Termasuk best practices dan tips dari para praktisi berpengalaman.

## Rangkuman

- Poin utama pertama dari pelajaran ini
- Poin utama kedua yang perlu diingat
- Poin utama ketiga untuk diterapkan

## Tugas Praktik

Coba terapkan apa yang telah Anda pelajari dengan melakukan latihan berikut sesuai konteks pekerjaan Anda.
`;
}

async function main() {
  console.log('Seeding Academy courses and lessons...');

  // Delete existing data
  await prisma.academyLesson.deleteMany({});
  await prisma.academyCourseProgress.deleteMany({});
  await prisma.academyCourse.deleteMany({});

  for (let i = 0; i < courses.length; i++) {
    const mock = courses[i];
    const templates = lessonTemplates[mock.category] || lessonTemplates['operasional'];

    // Determine number of lessons (2-3)
    const lessonCount = Math.min(templates.length, mock.lessonCount >= 3 ? 3 : 2);

    const course = await prisma.academyCourse.create({
      data: {
        title: mock.title,
        description: mock.description,
        category: mock.category,
        level: mock.level,
        duration: mock.duration,
        instructorName: mock.instructor,
        totalLessons: lessonCount,
        isPublished: true,
        order: i,
      },
    });

    console.log(`  Created course: ${course.title} (${course.id})`);

    for (let j = 0; j < lessonCount; j++) {
      const lessonTitle = `${templates[j]}`;
      const lesson = await prisma.academyLesson.create({
        data: {
          courseId: course.id,
          title: lessonTitle,
          content: generateLessonContent(lessonTitle, mock.title),
          order: j + 1,
          duration: `${20 + j * 10} menit`,
        },
      });
      console.log(`    Lesson ${j + 1}: ${lesson.title}`);
    }
  }

  console.log('\nSeeding complete!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
