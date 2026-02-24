import { NextRequest, NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import { prisma } from '@/lib/prisma';
import { signCCToken, setCCTokenCookie } from '@/lib/auth-command-center';
import { ccLoginSchema } from '@/lib/validations/command-center';

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = ccLoginSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Data tidak valid', fields: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { email, password } = parsed.data;
    const admin = await prisma.systemAdmin.findUnique({ where: { email } });

    if (!admin || !admin.isActive) {
      return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 });
    }

    const valid = await bcrypt.compare(password, admin.password);
    if (!valid) {
      return NextResponse.json({ error: 'Email atau password salah' }, { status: 401 });
    }

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
    console.error('POST /api/command-center/auth/login error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
