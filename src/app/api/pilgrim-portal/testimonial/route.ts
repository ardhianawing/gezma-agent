import { NextRequest, NextResponse } from 'next/server';
import { getPilgrimPayload } from '@/lib/auth-pilgrim';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const payload = getPilgrimPayload(req);
    if (!payload) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    // Get pilgrim's tripId
    const pilgrim = await prisma.pilgrim.findUnique({
      where: { id: payload.pilgrimId },
      select: { tripId: true, status: true },
    });

    if (!pilgrim) {
      return NextResponse.json({ error: 'Jemaah tidak ditemukan' }, { status: 404 });
    }

    // Find existing testimonial for this pilgrim's trip
    const testimonial = pilgrim.tripId
      ? await prisma.pilgrimTestimonial.findUnique({
          where: {
            pilgrimId_tripId: {
              pilgrimId: payload.pilgrimId,
              tripId: pilgrim.tripId,
            },
          },
        })
      : null;

    return NextResponse.json({
      testimonial,
      canReview: pilgrim.status === 'completed' && !testimonial && !!pilgrim.tripId,
      pilgrimStatus: pilgrim.status,
      hasTripId: !!pilgrim.tripId,
    });
  } catch (error) {
    console.error('Testimonial GET error:', error);
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
    const { rating, comment } = body;

    // Validate
    if (!rating || typeof rating !== 'number' || rating < 1 || rating > 5) {
      return NextResponse.json({ error: 'Rating harus antara 1-5' }, { status: 400 });
    }
    if (!comment || typeof comment !== 'string' || comment.trim().length === 0) {
      return NextResponse.json({ error: 'Komentar diperlukan' }, { status: 400 });
    }

    // Check pilgrim status
    const pilgrim = await prisma.pilgrim.findUnique({
      where: { id: payload.pilgrimId },
      select: { tripId: true, status: true },
    });

    if (!pilgrim) {
      return NextResponse.json({ error: 'Jemaah tidak ditemukan' }, { status: 404 });
    }

    if (pilgrim.status !== 'completed') {
      return NextResponse.json({ error: 'Ulasan hanya bisa diberikan setelah trip selesai' }, { status: 400 });
    }

    if (!pilgrim.tripId) {
      return NextResponse.json({ error: 'Belum terdaftar di trip manapun' }, { status: 400 });
    }

    // Check for existing testimonial
    const existing = await prisma.pilgrimTestimonial.findUnique({
      where: {
        pilgrimId_tripId: {
          pilgrimId: payload.pilgrimId,
          tripId: pilgrim.tripId,
        },
      },
    });

    if (existing) {
      return NextResponse.json({ error: 'Anda sudah memberikan ulasan untuk trip ini' }, { status: 400 });
    }

    const testimonial = await prisma.pilgrimTestimonial.create({
      data: {
        pilgrimId: payload.pilgrimId,
        agencyId: payload.agencyId,
        tripId: pilgrim.tripId,
        rating: Math.round(rating),
        comment: comment.trim(),
      },
    });

    return NextResponse.json({ testimonial }, { status: 201 });
  } catch (error) {
    console.error('Testimonial POST error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
