import { NextRequest, NextResponse } from 'next/server';
import { mockTrips } from '@/data/mock-trips';
import { mockPilgrims } from '@/data/mock-pilgrims';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';

type Context = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Context) {
  const auth = getAuthPayload(req); if (!auth) return unauthorizedResponse();
  const { id } = await params;

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

  return NextResponse.json({ ...trip, manifest });
}

export async function PUT(req: NextRequest, { params }: Context) {
  const auth = getAuthPayload(req); if (!auth) return unauthorizedResponse();
  const { id } = await params;

  const trip = mockTrips.find((t) => t.id === id);

  if (!trip) {
    return NextResponse.json({ error: 'Trip tidak ditemukan' }, { status: 404 });
  }

  try {
    const body = await req.json();

    const updated = {
      ...trip,
      ...body,
      id: trip.id, // prevent id override
    };

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Context) {
  const auth = getAuthPayload(req); if (!auth) return unauthorizedResponse();
  const { id } = await params;

  const trip = mockTrips.find((t) => t.id === id);

  if (!trip) {
    return NextResponse.json({ error: 'Trip tidak ditemukan' }, { status: 404 });
  }

  return NextResponse.json({ message: 'Trip berhasil dihapus' });
}
