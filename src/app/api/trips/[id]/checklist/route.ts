import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { checkPermission } from '@/lib/auth-permissions';
import { PERMISSIONS } from '@/lib/permissions';

type Context = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Context) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const denied = await checkPermission(auth, PERMISSIONS.TRIPS_EDIT);
  if (denied) return denied;

  const { id } = await params;

  try {
    const body = await req.json();

    const existing = await prisma.trip.findFirst({
      where: { id, agencyId: auth.agencyId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Trip tidak ditemukan' }, { status: 404 });
    }

    const currentChecklist = (existing.checklist as Record<string, unknown>) || {};
    const updatedChecklist = { ...currentChecklist, ...body };

    const trip = await prisma.trip.update({
      where: { id },
      data: { checklist: updatedChecklist },
    });

    return NextResponse.json(trip);
  } catch (error) {
    console.error('PATCH /api/trips/[id]/checklist error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
