import { NextRequest, NextResponse } from 'next/server';
import { getPilgrimPayload } from '@/lib/auth-pilgrim';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const payload = getPilgrimPayload(req);
    if (!payload) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    const [lessons, progress] = await Promise.all([
      prisma.manasikLesson.findMany({
        where: { agencyId: payload.agencyId },
        orderBy: { order: 'asc' },
      }),
      prisma.pilgrimManasikProgress.findMany({
        where: { pilgrimId: payload.pilgrimId },
        select: { lessonId: true },
      }),
    ]);

    const completedIds = progress.map(p => p.lessonId);

    return NextResponse.json({
      lessons: lessons.map(l => ({
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
      completedIds,
    });
  } catch (error) {
    console.error('Manasik fetch error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
