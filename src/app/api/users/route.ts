import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import bcrypt from 'bcryptjs';

const mockUsers = [
  { id: "user-1", name: "Ahmad Fauzi", email: "ahmad@gezma.id", role: "operations", _source: 'mock' as const },
  { id: "user-2", name: "Siti Rahayu", email: "siti@gezma.id", role: "admin", _source: 'mock' as const },
  { id: "user-3", name: "Budi Hartono", email: "budi@gezma.id", role: "finance", _source: 'mock' as const },
  { id: "user-4", name: "Dewi Kartika", email: "dewi@gezma.id", role: "marketing", _source: 'mock' as const },
];

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req); if (!auth) return unauthorizedResponse();

  // Hybrid: try DB first, merge with mock
  try {
    const dbUsers = await prisma.user.findMany({
      where: { agencyId: auth.agencyId, deletedAt: null },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        position: true,
        role: true,
        isActive: true,
        isVerified: true,
        createdAt: true,
        // NEVER select password
      },
    });
    const dbMapped = dbUsers.map(u => ({ ...u, _source: 'db' as const }));
    return NextResponse.json({ data: [...dbMapped, ...mockUsers] });
  } catch {
    // DB unavailable, use mock only
    return NextResponse.json({ data: mockUsers });
  }
}

export async function POST(req: NextRequest) {
  const auth = getAuthPayload(req); if (!auth) return unauthorizedResponse();
  try {
    const body = await req.json();

    // Validate required fields
    if (!body.name || !body.email || !body.password) {
      return NextResponse.json(
        { error: 'Field name, email, dan password wajib diisi' },
        { status: 400 }
      );
    }

    // Hybrid: try DB first, mock fallback
    try {
      // Check email uniqueness
      const existing = await prisma.user.findUnique({
        where: { email: body.email },
      });
      if (existing) {
        return NextResponse.json(
          { error: 'Email sudah terdaftar' },
          { status: 409 }
        );
      }

      // Hash password before storing
      const hashedPassword = await bcrypt.hash(body.password, 12);

      const dbUser = await prisma.user.create({
        data: {
          name: body.name,
          email: body.email,
          password: hashedPassword,
          phone: body.phone || null,
          position: body.position || null,
          role: body.role || 'staff',
          isActive: true,
          agencyId: auth.agencyId,
        },
        select: {
          id: true,
          name: true,
          email: true,
          phone: true,
          position: true,
          role: true,
          isActive: true,
          isVerified: true,
          createdAt: true,
          // NEVER select password
        },
      });

      return NextResponse.json({ ...dbUser, _source: 'db' }, { status: 201 });
    } catch (dbError) {
      // DB failed, fallback to mock response
      console.error('[users POST] DB error, falling back to mock:', dbError);
      const user = {
        id: `user-${Date.now()}`,
        name: body.name || '',
        email: body.email || '',
        role: body.role || 'staff',
        position: body.position || null,
        phone: body.phone || null,
        isActive: true,
        _source: 'mock' as const,
      };

      return NextResponse.json(user, { status: 201 });
    }
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
