import { NextRequest, NextResponse } from 'next/server';
import { mockPilgrims } from '@/data/mock-pilgrims';
import { prisma } from '@/lib/prisma';
import { getAuthPayload } from '@/lib/auth-server';
import crypto from 'crypto';

function generateBookingCode(): string {
  const year = new Date().getFullYear();
  const random = crypto.randomBytes(3).toString('hex').toUpperCase(); // 6 chars
  return `GZM-${year}-${random}`;
}

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const tripId = searchParams.get('tripId') || '';
  const available = searchParams.get('available');

  // 1. Real DB data
  let dbPilgrims: typeof mockPilgrims = [];
  try {
    const auth = getAuthPayload(req);
    if (auth) {
      const where: Record<string, unknown> = { agencyId: auth.agencyId, deletedAt: null };
      if (status) where.status = status;
      if (tripId) where.tripId = tripId;
      if (available === '1') where.tripId = null;
      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { nik: { contains: search } },
          { email: { contains: search, mode: 'insensitive' } },
          { phone: { contains: search } },
          { bookingCode: { contains: search, mode: 'insensitive' } },
        ];
      }

      const dbResults = await prisma.pilgrim.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        include: {
          documents: { select: { type: true, status: true } },
          payments: { select: { amount: true, type: true, date: true } },
        },
      });

      dbPilgrims = dbResults.map((p) => ({
        id: p.id,
        name: p.name,
        nik: p.nik,
        email: p.email,
        phone: p.phone,
        gender: p.gender === 'male' ? 'L' : 'P',
        birthDate: p.birthDate,
        birthPlace: p.birthPlace,
        address: p.address,
        city: p.city,
        province: p.province,
        postalCode: p.postalCode || '',
        whatsapp: p.whatsapp || '',
        emergencyContact: typeof p.emergencyContact === 'string' ? p.emergencyContact : JSON.stringify(p.emergencyContact),
        status: p.status as 'lead' | 'dp' | 'lunas' | 'dokumen' | 'visa' | 'ready' | 'departed' | 'completed',
        tripId: p.tripId,
        tripName: null,
        packageName: null,
        totalCost: p.remainingBalance + p.totalPaid,
        totalPaid: p.totalPaid,
        documents: p.documents.map((d) => ({ type: d.type, status: d.status })),
        payments: p.payments.map((pay) => ({ amount: pay.amount, type: pay.type, date: pay.date.toISOString().split('T')[0] })),
        checklist: typeof p.checklist === 'object' && p.checklist !== null ? p.checklist : {},
        registeredAt: p.createdAt.toISOString().split('T')[0],
        notes: p.notes || '',
        roomNumber: p.roomNumber,
        roomType: p.roomType,
        bookingCode: p.bookingCode,
        _source: 'db' as const,
      }));
    }
  } catch {
    // DB not available, continue with mock
  }

  // 2. Mock data
  let mockData = mockPilgrims.map((p) => ({ ...p, bookingCode: null as string | null, _source: 'mock' as const }));

  if (status) mockData = mockData.filter((p) => p.status === status);
  if (tripId) mockData = mockData.filter((p) => p.tripId === tripId);
  if (available === '1') mockData = mockData.filter((p) => p.tripId === null);
  if (search) {
    const q = search.toLowerCase();
    mockData = mockData.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.nik.includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.phone.includes(q)
    );
  }

  // 3. Merge: DB first, then mock
  const all = [...dbPilgrims, ...mockData];
  const total = all.length;
  const start = (page - 1) * limit;
  const data = all.slice(start, start + limit);

  return NextResponse.json({
    data,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
}

export async function POST(req: NextRequest) {
  const auth = getAuthPayload(req);

  try {
    const body = await req.json();

    if (!body.name || !body.nik || !body.phone || !body.email) {
      return NextResponse.json({ error: 'Nama, NIK, phone, dan email wajib diisi' }, { status: 400 });
    }

    // If authenticated, save to real DB
    if (auth) {
      // Generate unique booking code
      let bookingCode = generateBookingCode();
      let attempts = 0;
      while (attempts < 5) {
        const existing = await prisma.pilgrim.findFirst({
          where: { agencyId: auth.agencyId, bookingCode },
        });
        if (!existing) break;
        bookingCode = generateBookingCode();
        attempts++;
      }

      const pilgrim = await prisma.pilgrim.create({
        data: {
          name: body.name,
          nik: body.nik,
          email: body.email,
          phone: body.phone,
          gender: body.gender === 'P' ? 'female' : 'male',
          birthDate: body.birthDate || '',
          birthPlace: body.birthPlace || '',
          address: body.address || '',
          city: body.city || '',
          province: body.province || '',
          postalCode: body.postalCode || null,
          whatsapp: body.whatsapp || null,
          emergencyContact: body.emergencyContact ? JSON.parse(body.emergencyContact) : {},
          status: 'lead',
          notes: body.notes || null,
          bookingCode,
          agencyId: auth.agencyId,
          createdBy: auth.userId,
          checklist: {},
        },
      });

      return NextResponse.json({
        ...pilgrim,
        bookingCode: pilgrim.bookingCode,
        message: `Jamaah berhasil ditambahkan. Kode booking: ${pilgrim.bookingCode}`,
      }, { status: 201 });
    }

    // Fallback: mock response (unauthenticated)
    const newPilgrim = {
      id: `plg-${Date.now()}`,
      name: body.name || '',
      nik: body.nik || '',
      email: body.email || '',
      phone: body.phone || '',
      gender: body.gender || 'L',
      birthDate: body.birthDate || '',
      birthPlace: body.birthPlace || '',
      address: body.address || '',
      city: body.city || '',
      province: body.province || '',
      postalCode: body.postalCode || '',
      whatsapp: body.whatsapp || '',
      emergencyContact: body.emergencyContact || '',
      status: 'lead' as const,
      tripId: null,
      tripName: null,
      packageName: null,
      totalCost: 0,
      totalPaid: 0,
      documents: [],
      payments: [],
      checklist: {},
      registeredAt: new Date().toISOString().split('T')[0],
      notes: body.notes || '',
      roomNumber: null,
      roomType: null,
      bookingCode: null,
    };

    return NextResponse.json(newPilgrim, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
