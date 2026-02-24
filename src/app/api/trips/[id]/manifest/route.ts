import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { checkPermission } from '@/lib/auth-permissions';
import { PERMISSIONS } from '@/lib/permissions';
import { logActivity } from '@/lib/activity-logger';

type Context = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Context) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const denied = await checkPermission(auth, PERMISSIONS.TRIPS_EDIT);
  if (denied) return denied;

  const { id } = await params;

  try {
    const body = await req.json();
    const { pilgrimId } = body;

    if (!pilgrimId || typeof pilgrimId !== 'string') {
      return NextResponse.json(
        { error: 'pilgrimId wajib diisi' },
        { status: 400 }
      );
    }

    // Validate trip exists and belongs to agency
    const trip = await prisma.trip.findFirst({
      where: { id, agencyId: auth.agencyId },
    });

    if (!trip) {
      return NextResponse.json({ error: 'Trip tidak ditemukan' }, { status: 404 });
    }

    // Validate pilgrim exists and belongs to same agency
    const pilgrim = await prisma.pilgrim.findFirst({
      where: { id: pilgrimId, agencyId: auth.agencyId },
    });

    if (!pilgrim) {
      return NextResponse.json({ error: 'Jemaah tidak ditemukan' }, { status: 404 });
    }

    // Check pilgrim not already assigned to another trip
    if (pilgrim.tripId && pilgrim.tripId !== id) {
      return NextResponse.json(
        { error: 'Jemaah sudah terdaftar di trip lain' },
        { status: 409 }
      );
    }

    if (pilgrim.tripId === id) {
      return NextResponse.json(
        { error: 'Jemaah sudah terdaftar di trip ini' },
        { status: 409 }
      );
    }

    // Check capacity
    if (trip.registeredCount >= trip.capacity) {
      return NextResponse.json(
        { error: 'Kapasitas trip sudah penuh' },
        { status: 400 }
      );
    }

    // Transaction: assign pilgrim to trip + update count
    const result = await prisma.$transaction(async (tx) => {
      const updated = await tx.pilgrim.update({
        where: { id: pilgrimId },
        data: { tripId: id },
        include: { documents: true },
      });

      const count = await tx.pilgrim.count({ where: { tripId: id } });
      await tx.trip.update({
        where: { id },
        data: { registeredCount: count },
      });

      return updated;
    });

    logActivity({
      type: 'trip',
      action: 'updated',
      title: 'Jemaah ditambahkan ke manifest',
      description: `${result.name} ditambahkan ke trip "${trip.name}"`,
      userId: auth.userId,
      agencyId: auth.agencyId,
      metadata: { entityId: id, pilgrimId: result.id },
    });

    return NextResponse.json({
      pilgrimId: result.id,
      pilgrimName: result.name,
      pilgrimStatus: result.status,
      documentsComplete: result.documents.filter((d) => d.status === 'verified').length,
      documentsTotal: result.documents.length,
      roomNumber: result.roomNumber,
      roomType: result.roomType,
    });
  } catch (error) {
    console.error('POST /api/trips/[id]/manifest error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest, { params }: Context) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const denied = await checkPermission(auth, PERMISSIONS.TRIPS_EDIT);
  if (denied) return denied;

  const { id } = await params;

  try {
    const body = await req.json();
    const { pilgrimId, roomNumber, roomType } = body;

    if (!pilgrimId || typeof pilgrimId !== 'string') {
      return NextResponse.json(
        { error: 'pilgrimId wajib diisi' },
        { status: 400 }
      );
    }

    // Validate pilgrim is assigned to this trip
    const pilgrim = await prisma.pilgrim.findFirst({
      where: { id: pilgrimId, tripId: id, agencyId: auth.agencyId },
    });

    if (!pilgrim) {
      return NextResponse.json(
        { error: 'Jemaah tidak ditemukan di manifest trip ini' },
        { status: 404 }
      );
    }

    const updated = await prisma.pilgrim.update({
      where: { id: pilgrimId },
      data: {
        ...(roomNumber !== undefined && { roomNumber: roomNumber || null }),
        ...(roomType !== undefined && { roomType: roomType || null }),
      },
    });

    return NextResponse.json({
      pilgrimId: updated.id,
      roomNumber: updated.roomNumber,
      roomType: updated.roomType,
    });
  } catch (error) {
    console.error('PATCH /api/trips/[id]/manifest error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
