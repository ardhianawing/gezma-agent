import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { checkPermission } from '@/lib/auth-permissions';
import { PERMISSIONS } from '@/lib/permissions';
import { tripFormSchema } from '@/lib/validations/trip';
import { logActivity } from '@/lib/activity-logger';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';

  const where: Record<string, unknown> = { agencyId: auth.agencyId };

  if (status) {
    where.status = status;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
    ];
  }

  try {
    const data = await prisma.trip.findMany({
      where,
      orderBy: { departureDate: 'desc' },
    });

    return NextResponse.json({ data });
  } catch (error) {
    logger.error('GET /api/trips error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const denied = await checkPermission(auth, PERMISSIONS.TRIPS_CREATE);
  if (denied) return denied;

  try {
    const body = await req.json();
    const parsed = tripFormSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validasi gagal', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const defaultChecklist = {
      allPilgrimsConfirmed: false,
      manifestComplete: false,
      roomingListFinalized: false,
      flightTicketsIssued: false,
      hotelConfirmed: false,
      guideAssigned: false,
      insuranceProcessed: false,
      departureBriefingDone: false,
    };

    const trip = await prisma.trip.create({
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
        checklist: defaultChecklist,
        status: 'open',
        registeredCount: 0,
        confirmedCount: 0,
        agencyId: auth.agencyId,
      },
    });

    logActivity({
      type: 'trip',
      action: 'created',
      title: 'Trip baru dibuat',
      description: `Trip "${trip.name}" telah dibuat`,
      userId: auth.userId,
      agencyId: auth.agencyId,
      metadata: { entityId: trip.id },
    });

    return NextResponse.json(trip, { status: 201 });
  } catch (error) {
    logger.error('POST /api/trips error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
