import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/mailer';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { rateLimit } from '@/lib/rate-limiter';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const { allowed } = rateLimit(req, { limit: 3, window: 60 });
    if (!allowed) {
      return NextResponse.json({ error: 'Terlalu banyak percobaan. Silakan coba lagi nanti.' }, { status: 429 });
    }

    const body = await req.json();

    const {
      // Step 1 - Agency
      agencyName,
      legalName,
      ppiuNumber,
      agencyPhone,
      // Step 2 - PIC
      picName,
      picEmail,
      picPhone,
      picPosition,
      // Step 3 - Password
      password,
    } = body;

    // Validate required fields
    if (!agencyName || !legalName || !agencyPhone || !picName || !picEmail || !password) {
      return NextResponse.json(
        { error: 'Semua field wajib harus diisi' },
        { status: 400 }
      );
    }

    // Validate string types and max lengths
    if (typeof password !== 'string' || typeof picEmail !== 'string' || typeof agencyName !== 'string') {
      return NextResponse.json({ error: 'Data tidak valid' }, { status: 400 });
    }
    if (agencyName.length > 200 || legalName.length > 200 || picName.length > 100 || picEmail.length > 254) {
      return NextResponse.json({ error: 'Input melebihi batas maksimal' }, { status: 400 });
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(picEmail)) {
      return NextResponse.json(
        { error: 'Format email tidak valid' },
        { status: 400 }
      );
    }

    // Validate password length (min 8, max 72 — bcrypt truncates at 72 bytes)
    if (password.length < 8 || password.length > 72) {
      return NextResponse.json(
        { error: 'Password harus 8-72 karakter' },
        { status: 400 }
      );
    }

    // Check if email already exists (anti-enumeration: same message for both)
    const existingUser = await prisma.user.findUnique({
      where: { email: picEmail },
    });

    const existingAgency = await prisma.agency.findUnique({
      where: { email: picEmail },
    });

    if (existingUser || existingAgency) {
      return NextResponse.json(
        { error: 'Registrasi tidak dapat diproses. Silakan gunakan email lain atau hubungi admin.' },
        { status: 409 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Generate verification code (24 hour expiry)
    const verificationCode = crypto.randomBytes(32).toString('hex');
    const verificationExpiry = new Date(Date.now() + 24 * 60 * 60 * 1000);

    // Create agency + user in transaction (unverified, requires email verification)
    const result = await prisma.$transaction(async (tx) => {
      const agency = await tx.agency.create({
        data: {
          name: agencyName,
          legalName,
          ppiuNumber: ppiuNumber || null,
          email: picEmail,
          phone: agencyPhone,
          isVerified: false,
        },
      });

      const user = await tx.user.create({
        data: {
          name: picName,
          email: picEmail,
          password: hashedPassword,
          phone: picPhone || null,
          position: picPosition || 'Direktur',
          role: 'owner',
          agencyId: agency.id,
          isVerified: false,
          verificationCode,
          verificationExpiry,
        },
      });

      return { agency, user };
    });

    // Send verification email
    try {
      await sendVerificationEmail(picEmail, verificationCode);
    } catch (emailError) {
      logger.error('Failed to send verification email', { error: String(emailError) });
    }

    return NextResponse.json(
      {
        message: 'Registrasi berhasil! Silakan cek email untuk verifikasi akun.',
        requireVerification: true,
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('Register error', { error: String(error) });
    return NextResponse.json(
      { error: 'Terjadi kesalahan server. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}
