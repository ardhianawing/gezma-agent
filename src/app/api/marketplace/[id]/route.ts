import { NextRequest, NextResponse } from 'next/server';
import { marketItems } from '@/data/mock-marketplace';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const item = marketItems.find((i) => i.id === id);

  if (!item) {
    return NextResponse.json({ error: 'Item tidak ditemukan' }, { status: 404 });
  }

  return NextResponse.json({ data: item });
}
