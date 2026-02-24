import { NextRequest, NextResponse } from 'next/server';
import { signPilgrimToken } from '@/lib/auth-pilgrim';
import { findPilgrimByBookingCode } from '@/lib/services/pilgrim-portal.service';
import { rateLimit } from '@/lib/rate-limiter';

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

    const result = await findPilgrimByBookingCode(bookingCode);

    if (!result) {
      return NextResponse.json(
        { error: 'Kode booking tidak ditemukan. Periksa kembali kode Anda.' },
        { status: 404 }
      );
    }

    const token = signPilgrimToken(result.pilgrimId, result.agencyId);

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
    console.error('Pilgrim login error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}
