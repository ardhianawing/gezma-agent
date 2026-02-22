import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { sendVerificationEmail } from '@/lib/mailer';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function POST(req: NextRequest) {
  try {
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

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(picEmail)) {
      return NextResponse.json(
        { error: 'Format email tidak valid' },
        { status: 400 }
      );
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password minimal 8 karakter' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: picEmail },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 409 }
      );
    }

    // Check if agency email already exists
    const existingAgency = await prisma.agency.findUnique({
      where: { email: picEmail },
    });

    if (existingAgency) {
      return NextResponse.json(
        { error: 'Agency dengan email ini sudah terdaftar' },
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
      console.error('Failed to send verification email:', emailError);
    }

    return NextResponse.json(
      {
        message: 'Registrasi berhasil! Silakan cek email untuk verifikasi akun.',
        requireVerification: true,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}
