import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { logActivity } from '@/lib/activity-logger';
import { logger } from '@/lib/logger';

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
    logger.error('GET /api/agency error', { error: String(error) });
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
      'primaryColor', 'secondaryColor', 'faviconUrl',
      'logoLightUrl', 'logoDarkUrl', 'appTitle',
    ] as const;

    // Validate critical string fields if provided
    for (const field of ['name', 'phone', 'email'] as const) {
      if (body[field] !== undefined) {
        if (typeof body[field] !== 'string' || body[field].trim() === '') {
          return NextResponse.json({ error: `Field "${field}" harus berupa teks dan tidak boleh kosong` }, { status: 400 });
        }
      }
    }

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

    logActivity({
      type: 'agency',
      action: 'updated',
      title: 'Profil agency diperbarui',
      description: `Agency ${agency.name} diperbarui`,
      userId: auth.userId,
      agencyId: auth.agencyId,
    });

    return NextResponse.json(agency);
  } catch (error) {
    logger.error('PUT /api/agency error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
