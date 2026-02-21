import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ code: string }> }
) {
  try {
    const { code } = await params;

    if (!code) {
      return NextResponse.json(
        { error: 'Kode verifikasi tidak valid' },
        { status: 400 }
      );
    }

    // Find user by verification code
    const user = await prisma.user.findUnique({
      where: { verificationCode: code },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Kode verifikasi tidak ditemukan atau sudah digunakan' },
        { status: 404 }
      );
    }

    // Check expiry
    if (user.verificationExpiry && user.verificationExpiry < new Date()) {
      return NextResponse.json(
        { error: 'Kode verifikasi sudah kadaluarsa. Silakan daftar ulang.' },
        { status: 410 }
      );
    }

    // Check if already verified
    if (user.isVerified) {
      return NextResponse.json(
        { message: 'Akun sudah terverifikasi. Silakan login.' },
        { status: 200 }
      );
    }

    // Verify user
    await prisma.user.update({
      where: { id: user.id },
      data: {
        isVerified: true,
        verificationCode: null,
        verificationExpiry: null,
      },
    });

    return NextResponse.json(
      { message: 'Email berhasil diverifikasi! Silakan login.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}
