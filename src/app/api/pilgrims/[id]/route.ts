import { NextRequest, NextResponse } from 'next/server';
import { mockPilgrims } from '@/data/mock-pilgrims';

type Context = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Context) {
  const { id } = await params;

  const pilgrim = mockPilgrims.find((p) => p.id === id);

  if (!pilgrim) {
    return NextResponse.json({ error: 'Jemaah tidak ditemukan' }, { status: 404 });
  }

  return NextResponse.json(pilgrim);
}

export async function PUT(req: NextRequest, { params }: Context) {
  const { id } = await params;

  const pilgrim = mockPilgrims.find((p) => p.id === id);

  if (!pilgrim) {
    return NextResponse.json({ error: 'Jemaah tidak ditemukan' }, { status: 404 });
  }

  try {
    const body = await req.json();

    const updated = {
      ...pilgrim,
      ...body,
      id: pilgrim.id, // prevent id override
    };

    return NextResponse.json(updated);
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Context) {
  const { id } = await params;

  const pilgrim = mockPilgrims.find((p) => p.id === id);

  if (!pilgrim) {
    return NextResponse.json({ error: 'Jemaah tidak ditemukan' }, { status: 404 });
  }

  return NextResponse.json({ message: 'Jemaah berhasil dihapus' });
}
