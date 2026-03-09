import { NextRequest, NextResponse } from 'next/server';
import { mockPilgrims } from '@/data/mock-pilgrims';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const page = Math.max(1, parseInt(searchParams.get('page') || '1'));
  const limit = Math.min(100, Math.max(1, parseInt(searchParams.get('limit') || '20')));
  const search = searchParams.get('search') || '';
  const status = searchParams.get('status') || '';
  const tripId = searchParams.get('tripId') || '';
  const available = searchParams.get('available');

  let filtered = [...mockPilgrims];

  if (status) {
    filtered = filtered.filter((p) => p.status === status);
  }

  if (tripId) {
    filtered = filtered.filter((p) => p.tripId === tripId);
  }

  if (available === '1') {
    filtered = filtered.filter((p) => p.tripId === null);
  }

  if (search) {
    const q = search.toLowerCase();
    filtered = filtered.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.nik.includes(q) ||
        p.email.toLowerCase().includes(q) ||
        p.phone.includes(q)
    );
  }

  const total = filtered.length;
  const start = (page - 1) * limit;
  const data = filtered.slice(start, start + limit);

  return NextResponse.json({
    data,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

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
      checklist: {
        ktpUploaded: false,
        passportUploaded: false,
        passportValid: false,
        photoUploaded: false,
        dpPaid: false,
        fullPayment: false,
        visaSubmitted: false,
        visaReceived: false,
        healthCertificate: false,
      },
      registeredAt: new Date().toISOString().split('T')[0],
      notes: body.notes || '',
      roomNumber: null,
      roomType: null,
    };

    return NextResponse.json(newPilgrim, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
