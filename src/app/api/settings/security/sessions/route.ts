import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  try {
    const auth = getAuthPayload(req);
    if (!auth) return unauthorizedResponse();

    const sessions = await prisma.loginHistory.findMany({
      where: {
        userId: auth.userId,
        isActive: true,
      },
      orderBy: { loginAt: 'desc' },
      select: {
        id: true,
        ipAddress: true,
        userAgent: true,
        loginAt: true,
      },
    });

    return NextResponse.json({ sessions });
  } catch (error) {
    logger.error('Sessions list error', { error: String(error) });
    return NextResponse.json(
      { error: 'Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  try {
    const auth = getAuthPayload(req);
    if (!auth) return unauthorizedResponse();

    const body = await req.json();
    const { sessionId } = body;

    if (!sessionId) {
      return NextResponse.json(
        { error: 'Session ID harus diisi.' },
        { status: 400 }
      );
    }

    // Verify the session belongs to this user
    const session = await prisma.loginHistory.findFirst({
      where: {
        id: sessionId,
        userId: auth.userId,
        isActive: true,
      },
    });

    if (!session) {
      return NextResponse.json(
        { error: 'Session tidak ditemukan.' },
        { status: 404 }
      );
    }

    // Deactivate the session
    await prisma.loginHistory.update({
      where: { id: sessionId },
      data: {
        isActive: false,
        logoutAt: new Date(),
      },
    });

    return NextResponse.json({
      message: 'Session berhasil diakhiri.',
    });
  } catch (error) {
    logger.error('Session revoke error', { error: String(error) });
    return NextResponse.json(
      { error: 'Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}
