import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { checkPermission } from '@/lib/auth-permissions';
import { PERMISSIONS } from '@/lib/permissions';
import { pilgrimFormSchema } from '@/lib/validations/pilgrim';
import { logActivity } from '@/lib/activity-logger';

type Context = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Context) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { id } = await params;

  try {
    const pilgrim = await prisma.pilgrim.findFirst({
      where: { id, agencyId: auth.agencyId },
      include: {
        documents: { orderBy: { createdAt: 'desc' } },
        payments: { orderBy: { date: 'desc' } },
      },
    });

    if (!pilgrim) {
      return NextResponse.json({ error: 'Jemaah tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(pilgrim);
  } catch (error) {
    console.error('GET /api/pilgrims/[id] error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Context) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const denied = await checkPermission(auth, PERMISSIONS.PILGRIMS_EDIT);
  if (denied) return denied;

  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = pilgrimFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validasi gagal', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const existing = await prisma.pilgrim.findFirst({
      where: { id, agencyId: auth.agencyId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Jemaah tidak ditemukan' }, { status: 404 });
    }

    if (data.nik !== existing.nik) {
      const nikConflict = await prisma.pilgrim.findFirst({
        where: { nik: data.nik, agencyId: auth.agencyId, id: { not: id } },
      });
      if (nikConflict) {
        return NextResponse.json(
          { error: 'NIK sudah terdaftar di agency ini' },
          { status: 409 }
        );
      }
    }

    const newTripId = body.tripId !== undefined ? (body.tripId || null) : existing.tripId;
    const oldTripId = existing.tripId;

    const pilgrim = await prisma.$transaction(async (tx) => {
      const updated = await tx.pilgrim.update({
        where: { id },
        data: {
          nik: data.nik,
          name: data.name,
          gender: data.gender,
          birthPlace: data.birthPlace,
          birthDate: data.birthDate,
          address: data.address,
          city: data.city,
          province: data.province,
          postalCode: data.postalCode || null,
          phone: data.phone,
          email: data.email,
          whatsapp: data.whatsapp || null,
          emergencyContact: data.emergencyContact,
          notes: data.notes || null,
          ...(body.roomNumber !== undefined && { roomNumber: body.roomNumber || null }),
          ...(body.roomType !== undefined && { roomType: body.roomType || null }),
          ...(body.tripId !== undefined && { tripId: newTripId }),
        },
        include: { documents: true, payments: true },
      });

      // Update trip registeredCount when trip assignment changes
      if (oldTripId !== newTripId) {
        if (oldTripId) {
          const oldCount = await tx.pilgrim.count({ where: { tripId: oldTripId } });
          await tx.trip.update({ where: { id: oldTripId }, data: { registeredCount: oldCount } });
        }
        if (newTripId) {
          const newCount = await tx.pilgrim.count({ where: { tripId: newTripId } });
          await tx.trip.update({ where: { id: newTripId }, data: { registeredCount: newCount } });
        }
      }

      return updated;
    });

    logActivity({
      type: 'pilgrim',
      action: 'updated',
      title: 'Data jemaah diperbarui',
      description: `Data ${pilgrim.name} telah diperbarui`,
      userId: auth.userId,
      agencyId: auth.agencyId,
      metadata: { entityId: pilgrim.id },
    });

    return NextResponse.json(pilgrim);
  } catch (error) {
    console.error('PUT /api/pilgrims/[id] error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Context) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const denied = await checkPermission(auth, PERMISSIONS.PILGRIMS_DELETE);
  if (denied) return denied;

  const { id } = await params;

  try {
    const existing = await prisma.pilgrim.findFirst({
      where: { id, agencyId: auth.agencyId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Jemaah tidak ditemukan' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.pilgrim.delete({ where: { id } });

      // Decrement trip registeredCount if pilgrim was assigned to a trip
      if (existing.tripId) {
        const count = await tx.pilgrim.count({ where: { tripId: existing.tripId } });
        await tx.trip.update({ where: { id: existing.tripId }, data: { registeredCount: count } });
      }
    });

    logActivity({
      type: 'pilgrim',
      action: 'deleted',
      title: 'Jemaah dihapus',
      description: `${existing.name} telah dihapus`,
      userId: auth.userId,
      agencyId: auth.agencyId,
      metadata: { entityId: id },
    });

    return NextResponse.json({ message: 'Jemaah berhasil dihapus' });
  } catch (error) {
    console.error('DELETE /api/pilgrims/[id] error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
