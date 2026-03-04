import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCCAuthPayload, ccUnauthorizedResponse } from '@/lib/auth-command-center';
import { logger } from '@/lib/logger';

/**
 * GET /api/command-center/audit-trail — View audit trail logs
 * Query params: entityType, entityId, performedBy, agencyId, page, limit
 */
export async function GET(req: NextRequest) {
  const auth = getCCAuthPayload(req);
  if (!auth) return ccUnauthorizedResponse();

  try {
    const { searchParams } = req.nextUrl;
    const entityType = searchParams.get('entityType');
    const entityId = searchParams.get('entityId');
    const performedBy = searchParams.get('performedBy');
    const agencyId = searchParams.get('agencyId');
    const action = searchParams.get('action');
    const page = Math.max(1, Number(searchParams.get('page')) || 1);
    const limit = Math.min(100, Math.max(1, Number(searchParams.get('limit')) || 20));

    const where: Record<string, unknown> = {};
    if (entityType) where.entityType = entityType;
    if (entityId) where.entityId = entityId;
    if (performedBy) where.performedBy = performedBy;
    if (agencyId) where.agencyId = agencyId;
    if (action) where.action = action;

    const [trails, total] = await Promise.all([
      prisma.auditTrail.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.auditTrail.count({ where }),
    ]);

    return NextResponse.json({
      trails,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    logger.error('GET /api/command-center/audit-trail error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
