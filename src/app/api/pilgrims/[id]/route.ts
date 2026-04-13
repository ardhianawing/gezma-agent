import { NextRequest, NextResponse } from 'next/server';
import { mockPilgrims } from '@/data/mock-pilgrims';
import { prisma } from '@/lib/prisma';
import { getAuthPayload } from '@/lib/auth-server';

type Context = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Context) {
  const { id } = await params;

  // 1. Try real DB first
  try {
    const auth = getAuthPayload(req);
    if (auth) {
      const pilgrim = await prisma.pilgrim.findFirst({
        where: { id, agencyId: auth.agencyId, deletedAt: null },
        include: {
          documents: true,
          payments: { orderBy: { date: 'desc' } },
        },
      });
      if (pilgrim) {
        return NextResponse.json({
          ...pilgrim,
          gender: pilgrim.gender === 'male' ? 'L' : 'P',
          checklist: pilgrim.checklist ?? {},
          registeredAt: pilgrim.createdAt.toISOString().split('T')[0],
        });
      }
    }
  } catch {
    // DB not available
  }

  // 2. Fallback to mock
  const pilgrim = mockPilgrims.find((p) => p.id === id);
  if (!pilgrim) {
    return NextResponse.json({ error: 'Jemaah tidak ditemukan' }, { status: 404 });
  }
  return NextResponse.json(pilgrim);
}

export async function PUT(req: NextRequest, { params }: Context) {
  const { id } = await params;

  try {
    const body = await req.json();
    const auth = getAuthPayload(req);

    // Real DB update
    if (auth) {
      const existing = await prisma.pilgrim.findFirst({
        where: { id, agencyId: auth.agencyId, deletedAt: null },
      });

      if (existing) {
        const updated = await prisma.pilgrim.update({
          where: { id },
          data: {
            ...(body.name !== undefined && { name: body.name }),
            ...(body.nik !== undefined && { nik: body.nik }),
            ...(body.email !== undefined && { email: body.email }),
            ...(body.phone !== undefined && { phone: body.phone }),
            ...(body.gender !== undefined && { gender: body.gender === 'P' ? 'female' : 'male' }),
            ...(body.birthDate !== undefined && { birthDate: body.birthDate }),
            ...(body.birthPlace !== undefined && { birthPlace: body.birthPlace }),
            ...(body.address !== undefined && { address: body.address }),
            ...(body.city !== undefined && { city: body.city }),
            ...(body.province !== undefined && { province: body.province }),
            ...(body.postalCode !== undefined && { postalCode: body.postalCode }),
            ...(body.whatsapp !== undefined && { whatsapp: body.whatsapp }),
            ...(body.notes !== undefined && { notes: body.notes }),
            ...(body.status !== undefined && { status: body.status }),
            ...(body.tripId !== undefined && { tripId: body.tripId || null }),
            ...(body.roomNumber !== undefined && { roomNumber: body.roomNumber }),
            ...(body.roomType !== undefined && { roomType: body.roomType }),
          },
        });
        return NextResponse.json(updated);
      }
    }

    // Fallback to mock
    const pilgrim = mockPilgrims.find((p) => p.id === id);
    if (!pilgrim) {
      return NextResponse.json({ error: 'Jemaah tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json({ ...pilgrim, ...body, id: pilgrim.id });
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Context) {
  const { id } = await params;

  try {
    const auth = getAuthPayload(req);

    // Real DB soft delete
    if (auth) {
      const existing = await prisma.pilgrim.findFirst({
        where: { id, agencyId: auth.agencyId, deletedAt: null },
      });

      if (existing) {
        await prisma.pilgrim.update({
          where: { id },
          data: { deletedAt: new Date() },
        });
        return NextResponse.json({ message: 'Jemaah berhasil dihapus' });
      }
    }

    // Fallback to mock
    const pilgrim = mockPilgrims.find((p) => p.id === id);
    if (!pilgrim) {
      return NextResponse.json({ error: 'Jemaah tidak ditemukan' }, { status: 404 });
    }
    return NextResponse.json({ message: 'Jemaah berhasil dihapus' });
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
