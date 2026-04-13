import { NextRequest, NextResponse } from 'next/server';
import { mockTrips } from '@/data/mock-trips';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req); if (!auth) return unauthorizedResponse();
  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';

  // Start with mock data (always kept as fallback / demo)
  let mockFiltered = [...mockTrips].map(t => ({ ...t, _source: 'mock' as const }));

  if (status) {
    mockFiltered = mockFiltered.filter((t) => t.status === status);
  }
  if (search) {
    const q = search.toLowerCase();
    mockFiltered = mockFiltered.filter((t) => t.name.toLowerCase().includes(q));
  }

  try {
    // Try real DB first
    const where: Record<string, unknown> = {
      agencyId: auth.agencyId,
      deletedAt: null,
    };
    if (status) where.status = status;
    if (search) where.name = { contains: search, mode: 'insensitive' };

    const dbTrips = await prisma.trip.findMany({
      where,
      orderBy: { departureDate: 'desc' },
    });

    const dbMapped = dbTrips.map(t => ({
      ...t,
      departureDate: t.departureDate?.toISOString().split('T')[0] || '',
      returnDate: t.returnDate?.toISOString().split('T')[0] || '',
      registrationCloseDate: t.registrationCloseDate?.toISOString().split('T')[0] || null,
      createdAt: t.createdAt.toISOString().split('T')[0],
      _source: 'db' as const,
    }));

    // Merge: DB trips first, then mock data
    return NextResponse.json({ data: [...dbMapped, ...mockFiltered] });
  } catch {
    // DB not available — return mock only
    return NextResponse.json({ data: mockFiltered });
  }
}

export async function POST(req: NextRequest) {
  const auth = getAuthPayload(req); if (!auth) return unauthorizedResponse();
  try {
    const body = await req.json();

    // Validate required fields
    if (!body.name || !body.departureDate || !body.returnDate) {
      return NextResponse.json(
        { error: 'Field name, departureDate, dan returnDate wajib diisi' },
        { status: 400 }
      );
    }

    try {
      // Try creating in real DB
      const trip = await prisma.trip.create({
        data: {
          name: body.name,
          departureDate: new Date(body.departureDate),
          returnDate: new Date(body.returnDate),
          registrationCloseDate: body.registrationCloseDate ? new Date(body.registrationCloseDate) : null,
          capacity: parseInt(body.capacity) || 45,
          status: body.status || 'open',
          packageId: body.packageId || null,
          muthawwifName: body.muthawwifName || null,
          muthawwifPhone: body.muthawwifPhone || null,
          flightInfo: body.flightInfo || null,
          checklist: body.checklist || null,
          agencyId: auth.agencyId,
        },
      });

      return NextResponse.json(
        {
          ...trip,
          departureDate: trip.departureDate?.toISOString().split('T')[0] || '',
          returnDate: trip.returnDate?.toISOString().split('T')[0] || '',
          registrationCloseDate: trip.registrationCloseDate?.toISOString().split('T')[0] || null,
          createdAt: trip.createdAt.toISOString().split('T')[0],
          _source: 'db',
        },
        { status: 201 }
      );
    } catch {
      // DB not available — fallback to mock response
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
        _source: 'mock',
      };

      return NextResponse.json(newTrip, { status: 201 });
    }
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
