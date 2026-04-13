import { NextRequest, NextResponse } from 'next/server';
import { mockTrips } from '@/data/mock-trips';
import { mockPilgrims } from '@/data/mock-pilgrims';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

type Context = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Context) {
  const auth = getAuthPayload(req); if (!auth) return unauthorizedResponse();
  const { id } = await params;

  try {
    // Try real DB first
    const dbTrip = await prisma.trip.findFirst({
      where: { id, agencyId: auth.agencyId, deletedAt: null },
    });

    if (dbTrip) {
      return NextResponse.json({
        ...dbTrip,
        departureDate: dbTrip.departureDate?.toISOString().split('T')[0] || '',
        returnDate: dbTrip.returnDate?.toISOString().split('T')[0] || '',
        registrationCloseDate: dbTrip.registrationCloseDate?.toISOString().split('T')[0] || null,
        createdAt: dbTrip.createdAt.toISOString().split('T')[0],
        _source: 'db',
        manifest: [], // DB trips don't have mock manifest yet
      });
    }
  } catch {
    // DB not available, fall through to mock
  }

  // Fallback: search in mock data
  const trip = mockTrips.find((t) => t.id === id);

  if (!trip) {
    return NextResponse.json({ error: 'Trip tidak ditemukan' }, { status: 404 });
  }

  // Build manifest from pilgrims assigned to this trip
  const pilgrims = mockPilgrims.filter((p) => p.tripId === id);

  const manifest = pilgrims.map((p) => ({
    pilgrimId: p.id,
    pilgrimName: p.name,
    pilgrimStatus: p.status,
    documentsComplete: p.documents.filter((d) => d.status === 'verified').length,
    documentsTotal: p.documents.length,
    roomNumber: p.roomNumber,
    roomType: p.roomType,
  }));

  return NextResponse.json({ ...trip, manifest, _source: 'mock' });
}

export async function PUT(req: NextRequest, { params }: Context) {
  const auth = getAuthPayload(req); if (!auth) return unauthorizedResponse();
  const { id } = await params;

  try {
    const body = await req.json();

    try {
      // Try updating in real DB
      const updated = await prisma.trip.update({
        where: { id },
        data: {
          ...(body.name !== undefined && { name: body.name }),
          ...(body.departureDate !== undefined && { departureDate: new Date(body.departureDate) }),
          ...(body.returnDate !== undefined && { returnDate: new Date(body.returnDate) }),
          ...(body.registrationCloseDate !== undefined && {
            registrationCloseDate: body.registrationCloseDate ? new Date(body.registrationCloseDate) : null,
          }),
          ...(body.capacity !== undefined && { capacity: parseInt(body.capacity) }),
          ...(body.status !== undefined && { status: body.status }),
          ...(body.packageId !== undefined && { packageId: body.packageId || null }),
          ...(body.muthawwifName !== undefined && { muthawwifName: body.muthawwifName || null }),
          ...(body.muthawwifPhone !== undefined && { muthawwifPhone: body.muthawwifPhone || null }),
          ...(body.flightInfo !== undefined && { flightInfo: body.flightInfo }),
          ...(body.checklist !== undefined && { checklist: body.checklist }),
        },
      });

      return NextResponse.json({
        ...updated,
        departureDate: updated.departureDate?.toISOString().split('T')[0] || '',
        returnDate: updated.returnDate?.toISOString().split('T')[0] || '',
        registrationCloseDate: updated.registrationCloseDate?.toISOString().split('T')[0] || null,
        createdAt: updated.createdAt.toISOString().split('T')[0],
        _source: 'db',
      });
    } catch {
      // DB not available — fallback to mock
      const trip = mockTrips.find((t) => t.id === id);

      if (!trip) {
        return NextResponse.json({ error: 'Trip tidak ditemukan' }, { status: 404 });
      }

      const updatedMock = {
        ...trip,
        ...body,
        id: trip.id, // prevent id override
        _source: 'mock',
      };

      return NextResponse.json(updatedMock);
    }
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Context) {
  const auth = getAuthPayload(req); if (!auth) return unauthorizedResponse();
  const { id } = await params;

  try {
    // Try soft delete in real DB
    await prisma.trip.update({
      where: { id },
      data: { deletedAt: new Date() },
    });

    return NextResponse.json({ message: 'Trip berhasil dihapus', _source: 'db' });
  } catch {
    // DB not available — fallback to mock
    const trip = mockTrips.find((t) => t.id === id);

    if (!trip) {
      return NextResponse.json({ error: 'Trip tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Trip berhasil dihapus', _source: 'mock' });
  }
}
