import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const auth = getAuthPayload(req);
    if (!auth) return unauthorizedResponse();

    const body = await req.json();
    const { password } = body;

    if (!password) {
      return NextResponse.json(
        { error: 'Password harus diisi untuk menonaktifkan 2FA.' },
        { status: 400 }
      );
    }

    // Verify password
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
    });

    if (!user) {
      return unauthorizedResponse();
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Password salah.' },
        { status: 400 }
      );
    }

    // Disable TOTP
    await prisma.user.update({
      where: { id: auth.userId },
      data: {
        totpSecret: null,
        totpEnabled: false,
      },
    });

    return NextResponse.json({
      message: 'Two-Factor Authentication berhasil dinonaktifkan.',
    });
  } catch (error) {
    logger.error('TOTP disable error', { error: String(error) });
    return NextResponse.json(
      { error: 'Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}
