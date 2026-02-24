import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { checkPermission } from '@/lib/auth-permissions';
import { PERMISSIONS } from '@/lib/permissions';
import { tripFormSchema } from '@/lib/validations/trip';
import { logActivity } from '@/lib/activity-logger';

type Context = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Context) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { id } = await params;

  try {
    const trip = await prisma.trip.findFirst({
      where: { id, agencyId: auth.agencyId },
    });

    if (!trip) {
      return NextResponse.json({ error: 'Trip tidak ditemukan' }, { status: 404 });
    }

    // Get pilgrims assigned to this trip for manifest
    const pilgrims = await prisma.pilgrim.findMany({
      where: { tripId: id, agencyId: auth.agencyId },
      include: { documents: true },
    });

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
  } catch (error) {
    console.error('GET /api/trips/[id] error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Context) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = tripFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validasi gagal', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const existing = await prisma.trip.findFirst({
      where: { id, agencyId: auth.agencyId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Trip tidak ditemukan' }, { status: 404 });
    }

    const data = parsed.data;

    const trip = await prisma.trip.update({
      where: { id },
      data: {
        name: data.name,
        packageId: data.packageId,
        departureDate: new Date(data.departureDate),
        returnDate: new Date(data.returnDate),
        registrationCloseDate: data.registrationCloseDate ? new Date(data.registrationCloseDate) : null,
        capacity: data.capacity,
        flightInfo: JSON.parse(JSON.stringify(data.flightInfo)),
        muthawwifName: data.muthawwifName || null,
        muthawwifPhone: data.muthawwifPhone || null,
      },
    });

    logActivity({
      type: 'trip',
      action: 'updated',
      title: 'Trip diperbarui',
      description: `Trip "${trip.name}" telah diperbarui`,
      userId: auth.userId,
      agencyId: auth.agencyId,
      metadata: { entityId: trip.id },
    });

    return NextResponse.json(trip);
  } catch (error) {
    console.error('PUT /api/trips/[id] error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Context) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const denied = await checkPermission(auth, PERMISSIONS.TRIPS_DELETE);
  if (denied) return denied;

  const { id } = await params;

  try {
    const existing = await prisma.trip.findFirst({
      where: { id, agencyId: auth.agencyId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Trip tidak ditemukan' }, { status: 404 });
    }

    await prisma.trip.delete({ where: { id } });

    logActivity({
      type: 'trip',
      action: 'deleted',
      title: 'Trip dihapus',
      description: `Trip "${existing.name}" telah dihapus`,
      userId: auth.userId,
      agencyId: auth.agencyId,
      metadata: { entityId: id },
    });

    return NextResponse.json({ message: 'Trip berhasil dihapus' });
  } catch (error) {
    console.error('DELETE /api/trips/[id] error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
