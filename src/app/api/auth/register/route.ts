import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-me';

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

    // Create agency + user in transaction (auto-verified, no email verification needed)
    const result = await prisma.$transaction(async (tx) => {
      const agency = await tx.agency.create({
        data: {
          name: agencyName,
          legalName,
          ppiuNumber: ppiuNumber || null,
          email: picEmail,
          phone: agencyPhone,
          isVerified: true,
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
          isVerified: true,
        },
      });

      return { agency, user };
    });

    // Update last login
    await prisma.user.update({
      where: { id: result.user.id },
      data: { lastLoginAt: new Date() },
    });

    // Generate JWT token (auto-login after register)
    const token = jwt.sign(
      {
        userId: result.user.id,
        email: result.user.email,
        role: result.user.role,
        agencyId: result.user.agencyId,
      },
      JWT_SECRET,
      { expiresIn: 60 * 60 * 24 * 7 } // 7 days
    );

    const response = NextResponse.json(
      {
        message: 'Registrasi berhasil!',
        user: {
          id: result.user.id,
          name: result.user.name,
          email: result.user.email,
          role: result.user.role,
          position: result.user.position,
          agency: {
            id: result.agency.id,
            name: result.agency.name,
          },
        },
      },
      { status: 201 }
    );

    response.cookies.set('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/',
    });

    return response;
  } catch (error) {
    console.error('Register error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server. Silakan coba lagi.' },
      { status: 500 }
    );
  }
}
