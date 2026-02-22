import { prisma } from '@/lib/prisma';
import { AppError } from '@/lib/errors';
import { pilgrimFormSchema, pilgrimStatusSchema } from '@/lib/validations/pilgrim';
import { logActivity } from '@/lib/activity-logger';

interface ListPilgrimsParams {
  agencyId: string;
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  tripId?: string;
}

export async function listPilgrims({ agencyId, page = 1, limit = 20, search, status, tripId }: ListPilgrimsParams) {
  const where: Record<string, unknown> = { agencyId };

  if (status) where.status = status;
  if (tripId) where.tripId = tripId;
  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { nik: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ];
  }

  const [data, total] = await Promise.all([
    prisma.pilgrim.findMany({
      where,
      include: { documents: true },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.pilgrim.count({ where }),
  ]);

  return {
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  };
}

export async function getPilgrimById(id: string, agencyId: string) {
  const pilgrim = await prisma.pilgrim.findFirst({
    where: { id, agencyId },
    include: {
      documents: { orderBy: { createdAt: 'desc' } },
      payments: { orderBy: { date: 'desc' } },
    },
  });

  if (!pilgrim) throw new AppError('NOT_FOUND', 'Jemaah tidak ditemukan');
  return pilgrim;
}

interface CreatePilgrimParams {
  body: unknown;
  userId: string;
  agencyId: string;
}

export async function createPilgrim({ body, userId, agencyId }: CreatePilgrimParams) {
  const data = pilgrimFormSchema.parse(body);

  const existing = await prisma.pilgrim.findFirst({
    where: { nik: data.nik, agencyId },
  });
  if (existing) throw new AppError('CONFLICT', 'NIK sudah terdaftar di agency ini');

  const defaultChecklist = {
    ktpUploaded: false,
    passportUploaded: false,
    passportValid: false,
    photoUploaded: false,
    dpPaid: false,
    fullPayment: false,
    visaSubmitted: false,
    visaReceived: false,
    healthCertificate: false,
  };

  const pilgrim = await prisma.pilgrim.create({
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
      checklist: defaultChecklist,
      status: 'lead',
      notes: data.notes || null,
      createdBy: userId,
      agencyId,
    },
    include: { documents: true, payments: true },
  });

  logActivity({
    type: 'pilgrim',
    action: 'created',
    title: 'Jemaah baru ditambahkan',
    description: `${pilgrim.name} ditambahkan sebagai jemaah baru`,
    userId,
    agencyId,
    metadata: { entityId: pilgrim.id },
  });

  return pilgrim;
}

interface UpdatePilgrimParams {
  id: string;
  body: Record<string, unknown>;
  userId: string;
  agencyId: string;
}

export async function updatePilgrim({ id, body, userId, agencyId }: UpdatePilgrimParams) {
  const data = pilgrimFormSchema.parse(body);

  const existing = await prisma.pilgrim.findFirst({ where: { id, agencyId } });
  if (!existing) throw new AppError('NOT_FOUND', 'Jemaah tidak ditemukan');

  if (data.nik !== existing.nik) {
    const nikConflict = await prisma.pilgrim.findFirst({
      where: { nik: data.nik, agencyId, id: { not: id } },
    });
    if (nikConflict) throw new AppError('CONFLICT', 'NIK sudah terdaftar di agency ini');
  }

  const newTripId = body.tripId !== undefined ? (body.tripId || null) as string | null : existing.tripId;
  const oldTripId = existing.tripId;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const pilgrim = await prisma.$transaction(async (tx: any) => {
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
        ...(body.roomNumber !== undefined && { roomNumber: (body.roomNumber || null) as string | null }),
        ...(body.roomType !== undefined && { roomType: (body.roomType || null) as string | null }),
        ...(body.tripId !== undefined && { tripId: newTripId }),
      },
      include: { documents: true, payments: true },
    });

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
    userId,
    agencyId,
    metadata: { entityId: pilgrim.id },
  });

  return pilgrim;
}

export async function deletePilgrim(id: string, userId: string, agencyId: string) {
  const existing = await prisma.pilgrim.findFirst({ where: { id, agencyId } });
  if (!existing) throw new AppError('NOT_FOUND', 'Jemaah tidak ditemukan');

  await prisma.pilgrim.delete({ where: { id } });

  logActivity({
    type: 'pilgrim',
    action: 'deleted',
    title: 'Jemaah dihapus',
    description: `${existing.name} telah dihapus`,
    userId,
    agencyId,
    metadata: { entityId: id },
  });

  return { message: 'Jemaah berhasil dihapus' };
}

interface UpdatePilgrimStatusParams {
  id: string;
  body: unknown;
  userId: string;
  agencyId: string;
}

export async function updatePilgrimStatus({ id, body, userId, agencyId }: UpdatePilgrimStatusParams) {
  const parsed = pilgrimStatusSchema.parse(body);

  const existing = await prisma.pilgrim.findFirst({ where: { id, agencyId } });
  if (!existing) throw new AppError('NOT_FOUND', 'Jemaah tidak ditemukan');

  const pilgrim = await prisma.pilgrim.update({
    where: { id },
    data: { status: parsed.status },
  });

  logActivity({
    type: 'pilgrim',
    action: 'updated',
    title: 'Status jemaah diubah',
    description: `${existing.name} - Status diubah dari "${existing.status}" ke "${parsed.status}"`,
    userId,
    agencyId,
    metadata: { entityId: id, oldStatus: existing.status, newStatus: parsed.status },
  });

  return pilgrim;
}
