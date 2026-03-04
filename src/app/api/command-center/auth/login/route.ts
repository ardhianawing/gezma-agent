import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signCCToken, setCCTokenCookie } from '@/lib/auth-command-center';
import { ccLoginSchema } from '@/lib/validations/command-center';
import { rateLimit } from '@/lib/rate-limiter';
import { checkBruteForce, recordFailedAttempt, recordSuccessfulLogin } from '@/lib/brute-force';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const { allowed } = rateLimit(req, { limit: 5, window: 60 });
    if (!allowed) {
      return NextResponse.json({ error: 'Terlalu banyak percobaan. Silakan coba lagi nanti.' }, { status: 429 });
    }

    const body = await req.json();
    const parsed = ccLoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Data tidak valid', fields: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { email, password } = parsed.data;

    // Brute force check
    const bruteCheck = checkBruteForce(`cc:${email}`);
    if (!bruteCheck.allowed) {
      return NextResponse.json(
        { error: `Akun terkunci. Coba lagi dalam ${Math.ceil(bruteCheck.retryAfter / 60)} menit.` },
        { status: 423 }
      );
    }

    const admin = await prisma.systemAdmin.findUnique({ where: { email } });

    if (!admin || !admin.isActive) {
      recordFailedAttempt(`cc:${email}`);
      return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      recordFailedAttempt(`cc:${email}`);
      return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 });
    }

    recordSuccessfulLogin(`cc:${email}`);

    const token = signCCToken({
      adminId: admin.id,
      email: admin.email,
      role: 'super_admin',
    });

    const response = NextResponse.json({
      admin: { id: admin.id, name: admin.name, email: admin.email, role: admin.role },
    });

    return setCCTokenCookie(response, token);
  } catch (error) {
    logger.error('POST /api/command-center/auth/login error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
