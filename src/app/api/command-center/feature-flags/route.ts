import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCCAuthPayload, ccUnauthorizedResponse } from '@/lib/auth-command-center';
import { invalidateFlagCache } from '@/lib/feature-flags';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const createFlagSchema = z.object({
  key: z.string().min(1).max(50).regex(/^[a-z_]+$/, 'Key harus lowercase + underscore'),
  name: z.string().min(1).max(100),
  description: z.string().max(500).optional(),
  isEnabled: z.boolean().default(false),
});

const updateFlagSchema = z.object({
  isEnabled: z.boolean().optional(),
  agencyOverrides: z.record(z.boolean()).optional(),
});

/**
 * GET /api/command-center/feature-flags — List all feature flags
 */
export async function GET(req: NextRequest) {
  const auth = getCCAuthPayload(req);
  if (!auth) return ccUnauthorizedResponse();

  try {
    const flags = await prisma.featureFlag.findMany({
      orderBy: { key: 'asc' },
    });

    return NextResponse.json({ flags });
  } catch (error) {
    logger.error('GET /api/command-center/feature-flags error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

/**
 * POST /api/command-center/feature-flags — Create a new feature flag
 */
export async function POST(req: NextRequest) {
  const auth = getCCAuthPayload(req);
  if (!auth) return ccUnauthorizedResponse();

  try {
    const body = await req.json();
    const parsed = createFlagSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Data tidak valid', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const existing = await prisma.featureFlag.findUnique({ where: { key: parsed.data.key } });
    if (existing) {
      return NextResponse.json({ error: 'Feature flag key sudah ada' }, { status: 409 });
    }

    const flag = await prisma.featureFlag.create({
      data: {
        ...parsed.data,
        createdBy: auth.adminId,
      },
    });

    invalidateFlagCache();
    return NextResponse.json({ flag }, { status: 201 });
  } catch (error) {
    logger.error('POST /api/command-center/feature-flags error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

/**
 * PATCH /api/command-center/feature-flags — Update a feature flag
 * Body: { key: string, isEnabled?: boolean, agencyOverrides?: Record<string, boolean> }
 */
export async function PATCH(req: NextRequest) {
  const auth = getCCAuthPayload(req);
  if (!auth) return ccUnauthorizedResponse();

  try {
    const body = await req.json();
    const { key, ...updates } = body;

    if (!key) {
      return NextResponse.json({ error: 'key wajib diisi' }, { status: 400 });
    }

    const parsed = updateFlagSchema.safeParse(updates);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 });
    }

    const existing = await prisma.featureFlag.findUnique({ where: { key } });
    if (!existing) {
      return NextResponse.json({ error: 'Feature flag tidak ditemukan' }, { status: 404 });
    }

    const updateData: Record<string, unknown> = {};
    if (parsed.data.isEnabled !== undefined) {
      updateData.isEnabled = parsed.data.isEnabled;
    }
    if (parsed.data.agencyOverrides) {
      // Merge with existing overrides
      const currentOverrides = (existing.agencyOverrides as Record<string, boolean>) || {};
      updateData.agencyOverrides = { ...currentOverrides, ...parsed.data.agencyOverrides };
    }

    const flag = await prisma.featureFlag.update({
      where: { key },
      data: updateData,
    });

    invalidateFlagCache();
    return NextResponse.json({ flag });
  } catch (error) {
    logger.error('PATCH /api/command-center/feature-flags error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
