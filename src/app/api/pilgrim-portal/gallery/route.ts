import { NextRequest, NextResponse } from 'next/server';
import { getPilgrimPayload } from '@/lib/auth-pilgrim';
import { prisma } from '@/lib/prisma';
import { z } from 'zod';

const galleryUploadSchema = z.object({
  url: z.string().url('URL foto tidak valid'),
  caption: z.string().max(500).optional(),
});

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
    const parsed = galleryUploadSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      return NextResponse.json({ error: 'Validasi gagal', errors }, { status: 400 });
    }

    const { url, caption } = parsed.data;

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
