import { NextRequest, NextResponse } from 'next/server';
import { mockTrips } from '@/data/mock-trips';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';

  let filtered = [...mockTrips];

  if (status) {
    filtered = filtered.filter((t) => t.status === status);
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter((t) => t.name.toLowerCase().includes(q));
  }

  // Sort by departure date descending
  filtered.sort((a, b) => new Date(b.departureDate).getTime() - new Date(a.departureDate).getTime());

  return NextResponse.json({ data: filtered });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const newTrip = {
      id: `trip-${Date.now()}`,
      name: body.name || '',
      departureDate: body.departureDate || '',
      returnDate: body.returnDate || '',
      capacity: body.capacity || 45,
      registeredCount: 0,
      confirmedCount: 0,
      status: 'open' as const,
      hotel: body.hotel || '',
      airline: body.airline || '',
      muthawwifName: body.muthawwifName || '',
      muthawwifPhone: body.muthawwifPhone || '',
      flightInfo: body.flightInfo || { departure: '', arrival: '', flightNo: '' },
      packageId: body.packageId || '',
      registrationCloseDate: body.registrationCloseDate || null,
      checklist: {
        allPilgrimsConfirmed: false,
        manifestComplete: false,
        roomingListFinalized: false,
        flightTicketsIssued: false,
        hotelConfirmed: false,
        guideAssigned: false,
        insuranceProcessed: false,
        departureBriefingDone: false,
      },
      createdAt: new Date().toISOString().split('T')[0],
    };

    return NextResponse.json(newTrip, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
