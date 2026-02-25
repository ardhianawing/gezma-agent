import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { checkPermission } from '@/lib/auth-permissions';
import { PERMISSIONS, VALID_ROLES } from '@/lib/permissions';
import bcrypt from 'bcryptjs';
import { createUserSchema } from '@/lib/validations/user';
import { logActivity } from '@/lib/activity-logger';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const users = await prisma.user.findMany({
      where: { agencyId: auth.agencyId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        position: true,
        phone: true,
        isActive: true,
        lastLoginAt: true,
        createdAt: true,
      },
      orderBy: { createdAt: 'asc' },
    });

    return NextResponse.json({ data: users });
  } catch (error) {
    logger.error('GET /api/users error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const denied = await checkPermission(auth, PERMISSIONS.USERS_CREATE);
  if (denied) return denied;

  try {
    const body = await req.json();
    const parsed = createUserSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      return NextResponse.json({ error: 'Validasi gagal', errors }, { status: 400 });
    }

    const { name, email, password, role, position, phone } = parsed.data;

    // Non-owner cannot create owner accounts
    if (role === 'owner' && auth.role !== 'owner') {
      return NextResponse.json({ error: 'Hanya owner yang bisa membuat akun owner' }, { status: 403 });
    }

    // Check email uniqueness
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email sudah terdaftar' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 12);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role || 'staff',
        position: position || null,
        phone: phone || null,
        agencyId: auth.agencyId,
        isVerified: true,
      },
    });

    logActivity({
      type: 'user',
      action: 'created',
      title: 'User baru dibuat',
      description: `User ${user.name} (${user.email}) dengan role ${user.role}`,
      userId: auth.userId,
      agencyId: auth.agencyId,
      metadata: { entityId: user.id },
    });

    return NextResponse.json(
      {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        position: user.position,
        phone: user.phone,
        isActive: user.isActive,
      },
      { status: 201 }
    );
  } catch (error) {
    logger.error('POST /api/users error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
