import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { encryptSecret, verifyTokenPlain } from '@/lib/services/totp.service';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const auth = getAuthPayload(req);
    if (!auth) return unauthorizedResponse();

    const body = await req.json();
    const { token, secret } = body;

    if (!token || !secret) {
      return NextResponse.json(
        { error: 'Token dan secret harus diisi.' },
        { status: 400 }
      );
    }

    // Verify the TOTP token against the plain secret (from setup step)
    const isValid = await verifyTokenPlain(secret, token);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Kode verifikasi tidak valid. Silakan coba lagi.' },
        { status: 400 }
      );
    }

    // Encrypt and store the secret, enable TOTP
    const encryptedSecret = encryptSecret(secret);

    await prisma.user.update({
      where: { id: auth.userId },
      data: {
        totpSecret: encryptedSecret,
        totpEnabled: true,
      },
    });

    return NextResponse.json({
      message: 'Two-Factor Authentication berhasil diaktifkan.',
    });
  } catch (error) {
    logger.error('TOTP verify error', { error: String(error) });
    return NextResponse.json(
      { error: 'Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}
