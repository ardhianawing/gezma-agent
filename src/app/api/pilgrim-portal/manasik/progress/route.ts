import { NextRequest, NextResponse } from 'next/server';
import { getPilgrimPayload } from '@/lib/auth-pilgrim';
import { prisma } from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const payload = getPilgrimPayload(req);
    if (!payload) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    const { lessonId, completed } = await req.json();

    if (!lessonId || typeof completed !== 'boolean') {
      return NextResponse.json({ error: 'lessonId dan completed diperlukan' }, { status: 400 });
    }

    if (completed) {
      await prisma.pilgrimManasikProgress.upsert({
        where: {
          pilgrimId_lessonId: {
            pilgrimId: payload.pilgrimId,
            lessonId,
          },
        },
        create: {
          pilgrimId: payload.pilgrimId,
          lessonId,
        },
        update: {},
      });
    } else {
      await prisma.pilgrimManasikProgress.deleteMany({
        where: {
          pilgrimId: payload.pilgrimId,
          lessonId,
        },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Manasik progress error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
