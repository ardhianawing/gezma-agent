import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { createWaitingListSchema } from '@/lib/validations/waiting-list';
import { logActivity } from '@/lib/activity-logger';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { id } = await params;

  try {
    const entries = await prisma.waitingList.findMany({
      where: { tripId: id, agencyId: auth.agencyId },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ data: entries });
  } catch (error) {
    console.error('[WAITING_LIST_GET] error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { id } = await params;

  try {
    // Verify trip belongs to agency
    const trip = await prisma.trip.findFirst({
      where: { id, agencyId: auth.agencyId },
    });

    if (!trip) {
      return NextResponse.json({ error: 'Trip tidak ditemukan' }, { status: 404 });
    }

    const body = await req.json();
    const parsed = createWaitingListSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      return NextResponse.json({ error: 'Validasi gagal', errors }, { status: 400 });
    }

    const { pilgrimName, phone, email, notes } = parsed.data;

    const entry = await prisma.waitingList.create({
      data: {
        tripId: id,
        pilgrimName,
        phone,
        email: email || null,
        notes: notes || null,
        agencyId: auth.agencyId,
      },
    });

    logActivity({
      type: 'pilgrim',
      action: 'created',
      title: 'Waiting list ditambahkan',
      description: `${pilgrimName} ditambahkan ke waiting list trip`,
      userId: auth.userId,
      agencyId: auth.agencyId,
      metadata: { entityId: entry.id, tripId: id },
    });

    return NextResponse.json(entry, { status: 201 });
  } catch (error) {
    console.error('[WAITING_LIST_POST] error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
