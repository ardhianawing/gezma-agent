import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCCAuthPayload, ccUnauthorizedResponse } from '@/lib/auth-command-center';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const auth = getCCAuthPayload(req);
  if (!auth) return ccUnauthorizedResponse();

  // DEV ONLY — bypass admin
  if (auth.adminId === 'dev-bypass-admin') {
    return NextResponse.json({
      admin: { id: 'dev-bypass-admin', name: 'Dev Admin', email: 'dev@gezma.local', role: 'super_admin' },
    });
  }

  try {
    const admin = await prisma.systemAdmin.findUnique({
      where: { id: auth.adminId },
      select: { id: true, name: true, email: true, role: true, isActive: true, createdAt: true },
    });

    if (!admin || !admin.isActive) {
      return ccUnauthorizedResponse();
    }

    return NextResponse.json({ admin });
  } catch (error) {
    logger.error('GET /api/command-center/auth/me error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
