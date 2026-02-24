import { NextRequest, NextResponse } from 'next/server';
import { getPilgrimPayload } from '@/lib/auth-pilgrim';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
    const payload = getPilgrimPayload(req);
    if (!payload) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    // Get pilgrim to find tripId
    const pilgrim = await prisma.pilgrim.findUnique({
      where: { id: payload.pilgrimId },
      select: { tripId: true, agencyId: true },
    });

    if (!pilgrim || !pilgrim.tripId) {
      return NextResponse.json({ error: 'Belum terdaftar di trip manapun' }, { status: 400 });
    }

    // Check if trip already has a shareCode
    const trip = await prisma.trip.findUnique({
      where: { id: pilgrim.tripId },
      select: { id: true, shareCode: true },
    });

    if (!trip) {
      return NextResponse.json({ error: 'Trip tidak ditemukan' }, { status: 404 });
    }

    let shareCode = trip.shareCode;

    if (!shareCode) {
      // Generate new share code
      shareCode = crypto.randomBytes(8).toString('hex');

      await prisma.trip.update({
        where: { id: trip.id },
        data: { shareCode },
      });
    }

    const baseUrl = req.nextUrl.origin;
    const shareUrl = baseUrl + '/share/itinerary/' + shareCode;

    return NextResponse.json({ shareCode, shareUrl });
  } catch (error) {
    console.error('Share itinerary error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
