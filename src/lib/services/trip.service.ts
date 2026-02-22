import { prisma } from '@/lib/prisma';
import { AppError } from '@/lib/errors';
import { tripFormSchema } from '@/lib/validations/trip';
import { logActivity } from '@/lib/activity-logger';

interface ListTripsParams {
  agencyId: string;
  search?: string;
  status?: string;
}

export async function listTrips({ agencyId, search, status }: ListTripsParams) {
  const where: Record<string, unknown> = { agencyId };

  if (status) where.status = status;
  if (search) {
    where.OR = [{ name: { contains: search, mode: 'insensitive' } }];
  }

  const data = await prisma.trip.findMany({
    where,
    orderBy: { departureDate: 'desc' },
  });

  return { data };
}

export async function getTripById(id: string, agencyId: string) {
  const trip = await prisma.trip.findFirst({ where: { id, agencyId } });
  if (!trip) throw new AppError('NOT_FOUND', 'Trip tidak ditemukan');

  const pilgrims = await prisma.pilgrim.findMany({
    where: { tripId: id, agencyId },
    include: { documents: true },
  });

  const manifest = pilgrims.map((p: { id: string; name: string; status: string; documents: { status: string }[]; roomNumber: string | null; roomType: string | null }) => ({
    pilgrimId: p.id,
    pilgrimName: p.name,
    pilgrimStatus: p.status,
    documentsComplete: p.documents.filter((d: { status: string }) => d.status === 'verified').length,
    documentsTotal: p.documents.length,
    roomNumber: p.roomNumber,
    roomType: p.roomType,
  }));

  return { ...trip, manifest };
}

interface CreateTripParams {
  body: unknown;
  userId: string;
  agencyId: string;
}

export async function createTrip({ body, userId, agencyId }: CreateTripParams) {
  const data = tripFormSchema.parse(body);

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
      checklist: defaultChecklist,
      status: 'open',
      registeredCount: 0,
      confirmedCount: 0,
      agencyId,
    },
  });

  logActivity({
    type: 'trip',
    action: 'created',
    title: 'Trip baru dibuat',
    description: `Trip "${trip.name}" telah dibuat`,
    userId,
    agencyId,
    metadata: { entityId: trip.id },
  });

  return trip;
}

interface UpdateTripParams {
  id: string;
  body: unknown;
  userId: string;
  agencyId: string;
}

export async function updateTrip({ id, body, userId, agencyId }: UpdateTripParams) {
  const data = tripFormSchema.parse(body);

  const existing = await prisma.trip.findFirst({ where: { id, agencyId } });
  if (!existing) throw new AppError('NOT_FOUND', 'Trip tidak ditemukan');

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
    },
  });

  logActivity({
    type: 'trip',
    action: 'updated',
    title: 'Trip diperbarui',
    description: `Trip "${trip.name}" telah diperbarui`,
    userId,
    agencyId,
    metadata: { entityId: trip.id },
  });

  return trip;
}

export async function deleteTrip(id: string, userId: string, agencyId: string) {
  const existing = await prisma.trip.findFirst({ where: { id, agencyId } });
  if (!existing) throw new AppError('NOT_FOUND', 'Trip tidak ditemukan');

  await prisma.trip.delete({ where: { id } });

  logActivity({
    type: 'trip',
    action: 'deleted',
    title: 'Trip dihapus',
    description: `Trip "${existing.name}" telah dihapus`,
    userId,
    agencyId,
    metadata: { entityId: id },
  });

  return { message: 'Trip berhasil dihapus' };
}

export async function updateChecklist(id: string, body: Record<string, unknown>, agencyId: string) {
  const existing = await prisma.trip.findFirst({ where: { id, agencyId } });
  if (!existing) throw new AppError('NOT_FOUND', 'Trip tidak ditemukan');

  const currentChecklist = (existing.checklist as Record<string, unknown>) || {};
  const updatedChecklist = { ...currentChecklist, ...body };

  return prisma.trip.update({
    where: { id },
    data: { checklist: updatedChecklist as object },
  });
}
