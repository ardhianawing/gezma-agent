import { NextRequest, NextResponse } from 'next/server';
import { signPilgrimToken } from '@/lib/auth-pilgrim';
import { findPilgrimByBookingCode } from '@/lib/services/pilgrim-portal.service';
import { rateLimit } from '@/lib/rate-limiter';
import { checkBruteForce, recordFailedAttempt, recordSuccessfulLogin } from '@/lib/brute-force';
import { prisma } from '@/lib/prisma';
import { awardPilgrimPoints } from '@/lib/services/pilgrim-gamification.service';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const { allowed } = rateLimit(req, { limit: 5, window: 60 });
    if (!allowed) {
      return NextResponse.json({ error: 'Terlalu banyak percobaan. Silakan coba lagi nanti.' }, { status: 429 });
    }

    const body = await req.json();
    const { bookingCode } = body;

    if (!bookingCode || typeof bookingCode !== 'string') {
      return NextResponse.json(
        { error: 'Kode booking harus diisi' },
        { status: 400 }
      );
    }

    // Brute force check (per booking code)
    const bruteCheck = checkBruteForce(`pilgrim:${bookingCode}`);
    if (!bruteCheck.allowed) {
      return NextResponse.json(
        { error: `Terlalu banyak percobaan gagal. Coba lagi dalam ${Math.ceil(bruteCheck.retryAfter / 60)} menit.` },
        { status: 423 }
      );
    }

    const result = await findPilgrimByBookingCode(bookingCode);

    if (!result) {
      recordFailedAttempt(`pilgrim:${bookingCode}`);
      return NextResponse.json(
        { error: 'Kode booking tidak ditemukan. Periksa kembali kode Anda.' },
        { status: 404 }
      );
    }

    recordSuccessfulLogin(`pilgrim:${bookingCode}`);
    const token = signPilgrimToken(result.pilgrimId, result.agencyId);

    // Award daily login points (fire-and-forget)
    (async () => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const existing = await prisma.pilgrimPointEvent.findFirst({
        where: {
          pilgrimId: result.pilgrimId,
          action: 'daily_login',
          createdAt: { gte: today },
        },
      });
      if (!existing) {
        await awardPilgrimPoints(result.pilgrimId, 'daily_login', 'Login harian');
      }
    })().catch(err => logger.error('Failed to award daily login points', { error: String(err) }));

    const response = NextResponse.json({
      message: 'Login berhasil',
      data: result.data,
    });

    response.cookies.set('pilgrim_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 30 * 24 * 60 * 60, // 30 days
      path: '/',
    });

    return response;
  } catch (error) {
    logger.error('Pilgrim login error', { error: String(error) });
    return NextResponse.json(
      { error: 'Terjadi kesalahan server. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}
