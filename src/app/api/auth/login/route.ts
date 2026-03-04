import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { rateLimit } from '@/lib/rate-limiter';
import { logger } from '@/lib/logger';
import { JWT_SECRET } from '@/lib/auth-server';

export async function POST(req: NextRequest) {
  try {
    // Rate limiting: 5 attempts per 60 seconds
    const { allowed } = rateLimit(req, { limit: 5, window: 60 });
    if (!allowed) {
      return NextResponse.json(
        { error: 'Terlalu banyak percobaan login. Silakan coba lagi nanti.' },
        { status: 429 }
      );
    }

    const body = await req.json();
    const { email, password } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email dan password harus diisi' },
        { status: 400 }
      );
    }

    // Find user with agency
    const user = await prisma.user.findUnique({
      where: { email },
      include: { agency: true },
    });

    if (!user) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      );
    }

    // Check password
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json(
        { error: 'Email atau password salah' },
        { status: 401 }
      );
    }

    // Check if user is verified
    if (!user.isVerified) {
      return NextResponse.json(
        { error: 'Akun belum diverifikasi. Silakan cek email Anda.' },
        { status: 403 }
      );
    }

    // Check if user is active
    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Akun Anda telah dinonaktifkan. Hubungi admin.' },
        { status: 403 }
      );
    }

    // If TOTP is enabled, return tempToken for 2FA verification
    if (user.totpEnabled) {
      const tempToken = jwt.sign(
        {
          userId: user.id,
          email: user.email,
          type: 'totp_pending',
        },
        JWT_SECRET,
        { expiresIn: 15 * 60 } // 15 minutes
      );

      return NextResponse.json({
        requiresTOTP: true,
        tempToken,
      });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: user.id,
        email: user.email,
        role: user.role,
        agencyId: user.agencyId,
      },
      JWT_SECRET,
      { expiresIn: 60 * 60 * 24 * 7 } // 7 days in seconds
    );

    // Generate session token
    const sessionToken = crypto.randomUUID();

    // Update last login + record login history
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

    // Set token in cookie
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

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    logger.error('Login error', { error: String(error) });
    const { captureException } = await import('@/lib/error-monitor');
    captureException(error, { route: '/api/auth/login', action: 'login' });
    return NextResponse.json(
      { error: 'Terjadi kesalahan server. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}
