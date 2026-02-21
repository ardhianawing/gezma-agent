import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { pilgrimFormSchema } from '@/lib/validations/pilgrim';

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

    const pilgrim = await prisma.pilgrim.update({
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
      },
      include: { documents: true, payments: true },
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

  const { id } = await params;

  try {
    const existing = await prisma.pilgrim.findFirst({
      where: { id, agencyId: auth.agencyId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Jemaah tidak ditemukan' }, { status: 404 });
    }

    await prisma.pilgrim.delete({ where: { id } });

    return NextResponse.json({ message: 'Jemaah berhasil dihapus' });
  } catch (error) {
    console.error('DELETE /api/pilgrims/[id] error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
