import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { rateLimit } from '@/lib/rate-limiter';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const { allowed } = rateLimit(req, { limit: 5, window: 60 });
    if (!allowed) {
      return NextResponse.json({ error: 'Terlalu banyak percobaan. Silakan coba lagi nanti.' }, { status: 429 });
    }

    const { code, newPassword } = await req.json();

    if (!code || !newPassword) {
      return NextResponse.json({ error: 'Kode dan password baru harus diisi' }, { status: 400 });
    }

    if (typeof newPassword !== 'string' || newPassword.length < 8 || newPassword.length > 72) {
      return NextResponse.json({ error: 'Password harus 8-72 karakter' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: {
        verificationCode: code,
        verificationExpiry: { gt: new Date() },
      },
    });

    if (!user) {
      return NextResponse.json({ error: 'Kode reset tidak valid atau sudah kedaluwarsa' }, { status: 400 });
    }

    const hashed = await bcrypt.hash(newPassword, 12);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        password: hashed,
        verificationCode: null,
        verificationExpiry: null,
      },
    });

    return NextResponse.json({ message: 'Password berhasil direset. Silakan login.' });
  } catch (error) {
    logger.error('Reset password error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
