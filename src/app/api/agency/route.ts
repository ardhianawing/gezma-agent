import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const agency = await prisma.agency.findFirst({
      where: { id: auth.agencyId },
    });

    if (!agency) {
      return NextResponse.json({ error: 'Agency tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(agency);
  } catch (error) {
    console.error('GET /api/agency error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const body = await req.json();

    const existing = await prisma.agency.findFirst({
      where: { id: auth.agencyId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Agency tidak ditemukan' }, { status: 404 });
    }

    const allowedFields = [
      'name', 'legalName', 'tagline', 'description',
      'phone', 'whatsapp', 'website',
      'address', 'city', 'province', 'postalCode',
    ] as const;

    const updateData: Record<string, unknown> = {};
    for (const field of allowedFields) {
      if (body[field] !== undefined) {
        updateData[field] = body[field];
      }
    }

    const agency = await prisma.agency.update({
      where: { id: auth.agencyId },
      data: updateData,
    });

    return NextResponse.json(agency);
  } catch (error) {
    console.error('PUT /api/agency error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
