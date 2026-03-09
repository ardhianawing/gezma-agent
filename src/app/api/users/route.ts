import { NextRequest, NextResponse } from 'next/server';

const mockUsers = [
  { id: "user-1", name: "Ahmad Fauzi", email: "ahmad@gezma.id", role: "operations" },
  { id: "user-2", name: "Siti Rahayu", email: "siti@gezma.id", role: "admin" },
  { id: "user-3", name: "Budi Hartono", email: "budi@gezma.id", role: "finance" },
  { id: "user-4", name: "Dewi Kartika", email: "dewi@gezma.id", role: "marketing" },
];

export async function GET() {
  return NextResponse.json({ data: mockUsers });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();

    const user = {
      id: `user-${Date.now()}`,
      name: body.name || '',
      email: body.email || '',
      role: body.role || 'staff',
      position: body.position || null,
      phone: body.phone || null,
      isActive: true,
    };

    return NextResponse.json(user, { status: 201 });
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
