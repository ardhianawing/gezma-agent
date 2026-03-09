import { NextRequest, NextResponse } from 'next/server';
import { manasikLessons } from '@/data/mock-manasik';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const category = searchParams.get('category');

  let lessons = manasikLessons;

  if (category && category !== 'all') {
    lessons = lessons.filter((l) => l.category === category);
  }

  return NextResponse.json({
    lessons: lessons.map((l) => ({
      id: l.id,
      title: l.title,
      description: l.description,
      category: l.category,
      order: l.order,
      duration: l.duration,
      videoUrl: l.videoUrl,
      content: l.content,
      tips: l.tips,
      isImportant: l.isImportant,
      emoji: l.emoji,
    })),
    completedIds: [],
  });
}
