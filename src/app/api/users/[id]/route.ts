import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { checkPermission } from '@/lib/auth-permissions';
import { PERMISSIONS, VALID_ROLES } from '@/lib/permissions';

type Context = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Context) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { id } = await params;

  try {
    const user = await prisma.user.findFirst({
      where: { id, agencyId: auth.agencyId },
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
    });

    if (!user) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(user);
  } catch (error) {
    console.error('GET /api/users/[id] error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: Context) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const denied = await checkPermission(auth, PERMISSIONS.USERS_EDIT);
  if (denied) return denied;

  const { id } = await params;

  try {
    const body = await req.json();

    const existing = await prisma.user.findFirst({
      where: { id, agencyId: auth.agencyId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    const { name, role, position, phone, isActive } = body;

    // Validate role if provided
    if (role !== undefined) {
      if (!VALID_ROLES.includes(role)) {
        return NextResponse.json({ error: 'Role tidak valid' }, { status: 400 });
      }
      if (role === 'owner' && auth.role !== 'owner') {
        return NextResponse.json({ error: 'Hanya owner yang bisa mengatur role owner' }, { status: 403 });
      }
    }

    const updateData: Record<string, unknown> = {};
    if (name !== undefined) updateData.name = name;
    if (role !== undefined) updateData.role = role;
    if (position !== undefined) updateData.position = position;
    if (phone !== undefined) updateData.phone = phone;
    if (isActive !== undefined) updateData.isActive = isActive;

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
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
    });

    return NextResponse.json(user);
  } catch (error) {
    console.error('PUT /api/users/[id] error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Context) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const denied = await checkPermission(auth, PERMISSIONS.USERS_DELETE);
  if (denied) return denied;

  const { id } = await params;

  try {
    // Prevent deleting self
    if (id === auth.userId) {
      return NextResponse.json(
        { error: 'Tidak dapat menghapus akun sendiri' },
        { status: 400 }
      );
    }

    const existing = await prisma.user.findFirst({
      where: { id, agencyId: auth.agencyId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'User tidak ditemukan' }, { status: 404 });
    }

    await prisma.user.delete({ where: { id } });

    return NextResponse.json({ message: 'User berhasil dihapus' });
  } catch (error) {
    console.error('DELETE /api/users/[id] error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
