import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';
import { changePasswordSchema } from '@/lib/validations/security';

export async function POST(req: NextRequest) {
  try {
    const auth = getAuthPayload(req);
    if (!auth) return unauthorizedResponse();

    const body = await req.json();
    const parsed = changePasswordSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      return NextResponse.json({ error: 'Validasi gagal', errors }, { status: 400 });
    }

    const { currentPassword, newPassword } = parsed.data;

    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { password: true },
    });

    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    const isValid = await bcrypt.compare(currentPassword, user.password);
    if (!isValid) {
      return NextResponse.json({ error: 'Password saat ini salah' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(newPassword, 12);
    await prisma.user.update({
      where: { id: auth.userId },
      data: { password: hashedPassword },
    });

    return NextResponse.json({ message: 'Password berhasil diubah' });
  } catch (error) {
    console.error('POST /api/settings/security/change-password error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
