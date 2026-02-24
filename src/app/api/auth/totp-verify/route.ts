import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { verifyToken } from '@/lib/services/totp.service';

const JWT_SECRET = process.env.JWT_SECRET!;

interface TotpPendingPayload {
  userId: string;
  email: string;
  type: string;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { tempToken, token: totpCode } = body;

    if (!tempToken || !totpCode) {
      return NextResponse.json(
        { error: 'Token dan kode TOTP harus diisi.' },
        { status: 400 }
      );
    }

    // Decode and verify the temp token
    let payload: TotpPendingPayload;
    try {
      payload = jwt.verify(tempToken, JWT_SECRET) as TotpPendingPayload;
    } catch {
      return NextResponse.json(
        { error: 'Token tidak valid atau sudah kadaluarsa.' },
        { status: 401 }
      );
    }

    // Ensure this is a totp_pending token
    if (payload.type !== 'totp_pending') {
      return NextResponse.json(
        { error: 'Token tidak valid.' },
        { status: 401 }
      );
    }

    // Fetch user with TOTP secret
    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      include: { agency: true },
    });

    if (!user || !user.totpEnabled || !user.totpSecret) {
      return NextResponse.json(
        { error: 'TOTP tidak dikonfigurasi untuk akun ini.' },
        { status: 400 }
      );
    }

    // Verify the TOTP code
    const isValid = await verifyToken(user.totpSecret, totpCode);
    if (!isValid) {
      return NextResponse.json(
        { error: 'Kode TOTP tidak valid.' },
        { status: 400 }
      );
    }

    // Issue full JWT token
    const fullToken = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        agencyId: user.agencyId,
      },
      JWT_SECRET,
      { expiresIn: 60 * 60 * 24 * 7 } // 7 days
    );

    // Generate session token and record login
    const sessionToken = crypto.randomUUID();
    const ipAddress = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || null;
    const userAgent = req.headers.get('user-agent') || null;

    await Promise.all([
      prisma.user.update({
        where: { id: user.id },
        data: { lastLoginAt: new Date() },
      }),
      prisma.loginHistory.create({
        data: {
          userId: user.id,
          ipAddress,
          userAgent,
          sessionToken,
        },
      }),
    ]);

    // Set cookie and return user data
    const response = NextResponse.json({
      message: 'Login berhasil',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        position: user.position,
        avatarUrl: user.avatarUrl,
        agency: {
          id: user.agency.id,
          name: user.agency.name,
          logoUrl: user.agency.logoUrl,
        },
      },
    });

    response.cookies.set('token', fullToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60,
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('TOTP verify error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}
