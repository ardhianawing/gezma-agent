import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    if (!code) {
      return NextResponse.json({ error: 'Kode tidak valid' }, { status: 400 });
    }

    const trip = await prisma.trip.findUnique({
      where: { shareCode: code },
      select: {
        id: true,
        name: true,
        departureDate: true,
        returnDate: true,
        status: true,
        muthawwifName: true,
        packageId: true,
        agency: {
          select: {
            name: true,
          },
        },
      },
    });

    if (!trip) {
      return NextResponse.json({ error: 'Itinerary tidak ditemukan' }, { status: 404 });
    }

    // Fetch package itinerary if available
    let itinerary: unknown[] = [];
    let packageName = '';
    let airline = '';
    let makkahHotel = '';
    let madinahHotel = '';

    if (trip.packageId) {
      const pkg = await prisma.package.findUnique({
        where: { id: trip.packageId },
        select: {
          name: true,
          itinerary: true,
          airline: true,
          makkahHotel: true,
          madinahHotel: true,
        },
      });
      if (pkg) {
        itinerary = (pkg.itinerary as unknown[]) || [];
        packageName = pkg.name;
        airline = pkg.airline;
        makkahHotel = pkg.makkahHotel;
        madinahHotel = pkg.madinahHotel;
      }
    }

    return NextResponse.json({
      tripName: trip.name,
      departureDate: trip.departureDate,
      returnDate: trip.returnDate,
      status: trip.status,
      agencyName: trip.agency.name,
      packageName,
      airline,
      makkahHotel,
      madinahHotel,
      itinerary,
    });
  } catch (error) {
    console.error('Share itinerary GET error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
