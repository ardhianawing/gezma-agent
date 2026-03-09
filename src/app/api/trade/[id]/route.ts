import { NextRequest, NextResponse } from 'next/server';
import { tradeProducts } from '@/data/mock-trade';

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const product = tradeProducts.find((p) => p.id === id);

  if (!product) {
    return NextResponse.json({ error: 'Produk tidak ditemukan' }, { status: 404 });
  }

  return NextResponse.json({ data: product });
}
