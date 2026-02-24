import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { checkPermission } from '@/lib/auth-permissions';
import { PERMISSIONS } from '@/lib/permissions';
import { logActivity } from '@/lib/activity-logger';

type Context = { params: Promise<{ id: string; pilgrimId: string }> };

export async function DELETE(req: NextRequest, { params }: Context) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const denied = await checkPermission(auth, PERMISSIONS.TRIPS_EDIT);
  if (denied) return denied;

  const { id, pilgrimId } = await params;

  try {
    // Validate pilgrim exists and is assigned to this trip
    const pilgrim = await prisma.pilgrim.findFirst({
      where: { id: pilgrimId, tripId: id, agencyId: auth.agencyId },
    });

    if (!pilgrim) {
      return NextResponse.json(
        { error: 'Jemaah tidak ditemukan di manifest trip ini' },
        { status: 404 }
      );
    }

    const trip = await prisma.trip.findFirst({
      where: { id, agencyId: auth.agencyId },
    });

    if (!trip) {
      return NextResponse.json({ error: 'Trip tidak ditemukan' }, { status: 404 });
    }

    // Transaction: remove pilgrim from trip + update count
    await prisma.$transaction(async (tx) => {
      await tx.pilgrim.update({
        where: { id: pilgrimId },
        data: {
          tripId: null,
          roomNumber: null,
          roomType: null,
        },
      });

      const count = await tx.pilgrim.count({ where: { tripId: id } });
      await tx.trip.update({
        where: { id },
        data: { registeredCount: count },
      });
    });

    logActivity({
      type: 'trip',
      action: 'updated',
      title: 'Jemaah dihapus dari manifest',
      description: `${pilgrim.name} dihapus dari trip "${trip.name}"`,
      userId: auth.userId,
      agencyId: auth.agencyId,
      metadata: { entityId: id, pilgrimId },
    });

    return NextResponse.json({ message: 'Jemaah berhasil dihapus dari manifest' });
  } catch (error) {
    console.error('DELETE /api/trips/[id]/manifest/[pilgrimId] error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
