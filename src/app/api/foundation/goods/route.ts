import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { rateLimit } from '@/lib/rate-limiter';
import { logger } from '@/lib/logger';
import { createGoodsSchema } from '@/lib/validations/foundation';

const MOCK_GOODS = [
  {
    id: 'g1',
    name: 'Baju Layak Pakai Anak-anak',
    description: 'Pakaian anak usia 3–10 tahun, kondisi baik, sudah dicuci.',
    category: 'pakaian',
    quantity: 50,
    unit: 'pcs',
    status: 'available',
    imageUrl: null,
    agencyId: 'agency-1',
    agency: { name: 'Agen Yayasan Bekasi' },
    createdAt: '2026-03-10T08:00:00.000Z',
  },
  {
    id: 'g2',
    name: 'Al-Quran Terjemahan',
    description: 'Al-Quran terjemahan bahasa Indonesia, kondisi baru.',
    category: 'ibadah',
    quantity: 30,
    unit: 'buah',
    status: 'available',
    imageUrl: null,
    agencyId: 'agency-1',
    agency: { name: 'Agen Yayasan Bekasi' },
    createdAt: '2026-03-12T08:00:00.000Z',
  },
  {
    id: 'g3',
    name: 'Sajadah Panjang',
    description: 'Sajadah panjang ukuran standar, warna hijau dan merah.',
    category: 'ibadah',
    quantity: 20,
    unit: 'lembar',
    status: 'available',
    imageUrl: null,
    agencyId: 'agency-2',
    agency: { name: 'Agen Yayasan Bogor' },
    createdAt: '2026-03-15T08:00:00.000Z',
  },
  {
    id: 'g4',
    name: 'Laptop Bekas Layak Pakai',
    description: 'Laptop bekas kondisi baik, sudah diformat, cocok untuk pelajar.',
    category: 'elektronik',
    quantity: 5,
    unit: 'unit',
    status: 'requested',
    imageUrl: null,
    agencyId: 'agency-2',
    agency: { name: 'Agen Yayasan Bogor' },
    createdAt: '2026-03-20T08:00:00.000Z',
  },
  {
    id: 'g5',
    name: 'Sembako (Beras 5kg, Minyak, Gula)',
    description: 'Paket sembako lengkap untuk keluarga dhuafa.',
    category: 'lainnya',
    quantity: 100,
    unit: 'paket',
    status: 'available',
    imageUrl: null,
    agencyId: 'agency-3',
    agency: { name: 'Agen Yayasan Depok' },
    createdAt: '2026-04-01T08:00:00.000Z',
  },
];

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { allowed } = rateLimit(req, { limit: 30, window: 60 });
  if (!allowed) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan' }, { status: 429 });
  }

  const { searchParams } = new URL(req.url);
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '12', 10);
  const category = searchParams.get('category') || undefined;
  const status = searchParams.get('status') || undefined;

  try {
    let filtered = MOCK_GOODS;
    if (category) filtered = filtered.filter((g) => g.category === category);
    if (status) filtered = filtered.filter((g) => g.status === status);

    const total = filtered.length;
    const goods = filtered.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      goods,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    logger.error('GET /api/foundation/goods error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { allowed } = rateLimit(req, { limit: 10, window: 60 });
  if (!allowed) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = createGoodsSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const goods = {
      id: `g-mock-${Date.now()}`,
      ...parsed.data,
      imageUrl: parsed.data.imageUrl || null,
      status: 'available',
      agencyId: auth.agencyId,
      agency: { name: 'Agen Yayasan' },
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(goods, { status: 201 });
  } catch (error) {
    logger.error('POST /api/foundation/goods error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
