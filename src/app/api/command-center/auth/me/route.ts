import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCCAuthPayload, ccUnauthorizedResponse } from '@/lib/auth-command-center';

export async function GET(req: NextRequest) {
  const auth = getCCAuthPayload(req);
  if (!auth) return ccUnauthorizedResponse();

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
    console.error('GET /api/command-center/auth/me error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
