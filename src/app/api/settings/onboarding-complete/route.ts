import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

// POST: mark user onboarding as completed
export async function POST(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    await prisma.user.update({
      where: { id: auth.userId },
      data: { onboardingCompleted: true },
    });

    return NextResponse.json({ message: 'Onboarding selesai' });
  } catch (error) {
    logger.error('POST /api/settings/onboarding-complete error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
