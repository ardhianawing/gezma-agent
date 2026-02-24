import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET!;

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
      include: { agency: true },
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

    // Verify user and agency
    await prisma.$transaction([
      prisma.user.update({
        where: { id: user.id },
        data: {
          isVerified: true,
          verificationCode: null,
          verificationExpiry: null,
          lastLoginAt: new Date(),
        },
      }),
      prisma.agency.update({
        where: { id: user.agencyId },
        data: { isVerified: true },
      }),
    ]);

    // Auto-login: generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        agencyId: user.agencyId,
      },
      JWT_SECRET,
      { expiresIn: 60 * 60 * 24 * 7 }
    );

    const response = NextResponse.json({
      message: 'Email berhasil diverifikasi!',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        agency: {
          id: user.agency.id,
          name: user.agency.name,
        },
      },
    });

    // Set auth cookie
    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Verification error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}
