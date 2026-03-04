import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCCAuthPayload, ccUnauthorizedResponse } from '@/lib/auth-command-center';
import { logger } from '@/lib/logger';

/**
 * GET /api/command-center/deleted-records
 * List soft-deleted records across all agencies (CC only).
 */
export async function GET(req: NextRequest) {
  const auth = getCCAuthPayload(req);
  if (!auth) return ccUnauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const type = searchParams.get('type') || 'pilgrim'; // pilgrim, user, package, trip
  const limit = Math.min(50, Math.max(1, parseInt(searchParams.get('limit') || '20')));

  try {
    let records: unknown[] = [];

    if (type === 'pilgrim') {
      records = await prisma.pilgrim.findMany({
        where: { deletedAt: { not: null } },
        select: { id: true, name: true, nik: true, agencyId: true, deletedAt: true },
        orderBy: { deletedAt: 'desc' },
        take: limit,
      });
    } else if (type === 'user') {
      records = await prisma.user.findMany({
        where: { deletedAt: { not: null } },
        select: { id: true, name: true, email: true, agencyId: true, deletedAt: true },
        orderBy: { deletedAt: 'desc' },
        take: limit,
      });
    } else if (type === 'package') {
      records = await prisma.package.findMany({
        where: { deletedAt: { not: null } },
        select: { id: true, name: true, agencyId: true, deletedAt: true },
        orderBy: { deletedAt: 'desc' },
        take: limit,
      });
    } else if (type === 'trip') {
      records = await prisma.trip.findMany({
        where: { deletedAt: { not: null } },
        select: { id: true, name: true, agencyId: true, deletedAt: true },
        orderBy: { deletedAt: 'desc' },
        take: limit,
      });
    }

    return NextResponse.json({ type, records });
  } catch (error) {
    logger.error('GET /api/command-center/deleted-records error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

/**
 * POST /api/command-center/deleted-records
 * Restore a soft-deleted record.
 * Body: { type: "pilgrim"|"user"|"package"|"trip", id: string }
 */
export async function POST(req: NextRequest) {
  const auth = getCCAuthPayload(req);
  if (!auth) return ccUnauthorizedResponse();

  try {
    const { type, id } = await req.json();

    if (!type || !id) {
      return NextResponse.json({ error: 'type dan id wajib diisi' }, { status: 400 });
    }

    const restoreData = { deletedAt: null };

    if (type === 'pilgrim') {
      await prisma.pilgrim.update({ where: { id }, data: restoreData });
    } else if (type === 'user') {
      await prisma.user.update({ where: { id }, data: { ...restoreData, isActive: true } });
    } else if (type === 'package') {
      await prisma.package.update({ where: { id }, data: restoreData });
    } else if (type === 'trip') {
      await prisma.trip.update({ where: { id }, data: { ...restoreData, status: 'open' } });
    } else {
      return NextResponse.json({ error: 'Type tidak valid' }, { status: 400 });
    }

    return NextResponse.json({ message: `${type} berhasil di-restore`, id });
  } catch (error) {
    logger.error('POST /api/command-center/deleted-records error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
