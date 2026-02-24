import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { hasPermission, type Permission } from '@/lib/permissions';
import type { AuthPayload } from '@/lib/auth-server';

/**
 * Server-side permission check.
 * Returns null if authorized, or a 403 NextResponse if not.
 */
export async function checkPermission(
  auth: AuthPayload,
  permission: Permission
): Promise<NextResponse | null> {
  // Owner always has access
  if (auth.role === 'owner') return null;

  // Fetch user's custom permissions override
  const user = await prisma.user.findUnique({
    where: { id: auth.userId },
    select: { permissions: true },
  });

  const userPermissions = user?.permissions as Record<string, boolean> | null;

  if (hasPermission(auth.role, permission, userPermissions)) {
    return null; // authorized
  }

  return NextResponse.json(
    { error: 'Anda tidak memiliki akses untuk aksi ini' },
    { status: 403 }
  );
}
