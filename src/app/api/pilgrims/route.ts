import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { pilgrimFormSchema } from '@/lib/validations/pilgrim';
import { logActivity } from '@/lib/activity-logger';

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const tripId = searchParams.get('tripId') || '';

  const where: Record<string, unknown> = { agencyId: auth.agencyId };

  if (status) {
    where.status = status;
  }

  if (tripId) {
    where.tripId = tripId;
  }

  const available = searchParams.get('available');
  if (available === '1') {
    where.tripId = null;
  }

  if (search) {
    where.OR = [
      { name: { contains: search, mode: 'insensitive' } },
      { nik: { contains: search, mode: 'insensitive' } },
      { email: { contains: search, mode: 'insensitive' } },
      { phone: { contains: search, mode: 'insensitive' } },
    ];
  }

  try {
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

    return NextResponse.json({
      data,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GET /api/pilgrims error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

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

    // Check NIK uniqueness within agency
    const existing = await prisma.pilgrim.findFirst({
      where: { nik: data.nik, agencyId: auth.agencyId },
    });

    if (existing) {
      return NextResponse.json(
        { error: 'NIK sudah terdaftar di agency ini' },
        { status: 409 }
      );
    }

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
        createdBy: auth.userId,
        agencyId: auth.agencyId,
      },
      include: { documents: true, payments: true },
    });

    logActivity({
      type: 'pilgrim',
      action: 'created',
      title: 'Jemaah baru ditambahkan',
      description: `${pilgrim.name} ditambahkan sebagai jemaah baru`,
      userId: auth.userId,
      agencyId: auth.agencyId,
      metadata: { entityId: pilgrim.id },
    });

    return NextResponse.json(pilgrim, { status: 201 });
  } catch (error) {
    console.error('POST /api/pilgrims error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
