import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { id } = await params;

  const entries = await prisma.waitingList.findMany({
    where: { tripId: id, agencyId: auth.agencyId },
    orderBy: { createdAt: 'asc' },
  });

  return NextResponse.json({ data: entries });
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { id } = await params;

  // Verify trip belongs to agency
  const trip = await prisma.trip.findFirst({
    where: { id, agencyId: auth.agencyId },
  });

  if (!trip) {
    return NextResponse.json({ error: 'Trip tidak ditemukan' }, { status: 404 });
  }

  const body = await req.json();
  const { pilgrimName, phone, email, notes } = body;

  if (!pilgrimName || !phone) {
    return NextResponse.json(
      { error: 'Nama dan nomor telepon wajib diisi' },
      { status: 400 }
    );
  }

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

  return NextResponse.json(entry, { status: 201 });
}
