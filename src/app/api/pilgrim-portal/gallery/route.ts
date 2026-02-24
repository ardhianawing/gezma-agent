import { NextRequest, NextResponse } from 'next/server';
import { getPilgrimPayload } from '@/lib/auth-pilgrim';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const payload = getPilgrimPayload(req);
    if (!payload) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    const photos = await prisma.pilgrimPhoto.findMany({
      where: {
        pilgrimId: payload.pilgrimId,
        agencyId: payload.agencyId,
      },
      orderBy: { uploadedAt: 'desc' },
    });

    return NextResponse.json({ photos });
  } catch (error) {
    console.error('Gallery GET error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const payload = getPilgrimPayload(req);
    if (!payload) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    const body = await req.json();
    const { url, caption } = body;

    if (!url || typeof url !== 'string') {
      return NextResponse.json({ error: 'URL foto diperlukan' }, { status: 400 });
    }

    // Get pilgrim's tripId
    const pilgrim = await prisma.pilgrim.findUnique({
      where: { id: payload.pilgrimId },
      select: { tripId: true },
    });

    const photo = await prisma.pilgrimPhoto.create({
      data: {
        pilgrimId: payload.pilgrimId,
        agencyId: payload.agencyId,
        url: url.trim(),
        caption: caption?.trim() || null,
        tripId: pilgrim?.tripId || null,
      },
    });

    return NextResponse.json({ photo }, { status: 201 });
  } catch (error) {
    console.error('Gallery POST error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
