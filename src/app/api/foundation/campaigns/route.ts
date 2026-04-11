import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { rateLimit } from '@/lib/rate-limiter';
import { logger } from '@/lib/logger';
import { createCampaignSchema } from '@/lib/validations/foundation';

const MOCK_CAMPAIGNS = [
  {
    id: 'c1',
    title: 'Renovasi Masjid Al-Ikhlas Bekasi',
    description: 'Masjid Al-Ikhlas membutuhkan renovasi menyeluruh pada atap dan lantai yang sudah rusak.',
    category: 'masjid',
    targetAmount: 200000000,
    currentAmount: 145000000,
    deadline: '2026-06-30',
    status: 'active',
    imageUrl: null,
    createdAt: '2026-01-15T08:00:00.000Z',
    _count: { donations: 234 },
  },
  {
    id: 'c2',
    title: 'Bantu Korban Banjir Demak',
    description: 'Ribuan keluarga di Demak terdampak banjir besar. Mari bantu mereka bangkit kembali.',
    category: 'bencana',
    targetAmount: 100000000,
    currentAmount: 78000000,
    deadline: '2026-05-15',
    status: 'active',
    imageUrl: null,
    createdAt: '2026-02-01T08:00:00.000Z',
    _count: { donations: 189 },
  },
  {
    id: 'c3',
    title: 'Beasiswa Yatim Berprestasi 2026',
    description: 'Program beasiswa untuk anak yatim berprestasi agar dapat melanjutkan pendidikan.',
    category: 'yatim',
    targetAmount: 150000000,
    currentAmount: 92000000,
    deadline: '2026-08-01',
    status: 'active',
    imageUrl: null,
    createdAt: '2026-02-10T08:00:00.000Z',
    _count: { donations: 156 },
  },
  {
    id: 'c4',
    title: 'Santunan Dhuafa Ramadan 1447H',
    description: 'Berikan santunan kepada kaum dhuafa di bulan Ramadan yang penuh berkah.',
    category: 'dhuafa',
    targetAmount: 80000000,
    currentAmount: 64000000,
    deadline: '2026-04-30',
    status: 'active',
    imageUrl: null,
    createdAt: '2026-03-01T08:00:00.000Z',
    _count: { donations: 312 },
  },
  {
    id: 'c5',
    title: 'Pembangunan Pesantren Al-Furqon Bogor',
    description: 'Membangun gedung baru pesantren untuk menampung lebih banyak santri.',
    category: 'pendidikan',
    targetAmount: 500000000,
    currentAmount: 175000000,
    deadline: '2026-12-31',
    status: 'active',
    imageUrl: null,
    createdAt: '2026-01-20T08:00:00.000Z',
    _count: { donations: 98 },
  },
  {
    id: 'c6',
    title: 'Sumur Bor Desa Terpencil NTT',
    description: 'Warga di desa terpencil NTT kekurangan air bersih. Bantu bangun sumur bor.',
    category: 'air',
    targetAmount: 60000000,
    currentAmount: 48000000,
    deadline: '2026-07-15',
    status: 'active',
    imageUrl: null,
    createdAt: '2026-02-20T08:00:00.000Z',
    _count: { donations: 203 },
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
  const limit = parseInt(searchParams.get('limit') || '10', 10);
  const category = searchParams.get('category') || undefined;
  const status = searchParams.get('status') || 'active';

  try {
    let filtered = MOCK_CAMPAIGNS;
    if (category) filtered = filtered.filter((c) => c.category === category);
    if (status !== 'all') filtered = filtered.filter((c) => c.status === status);

    const total = filtered.length;
    const campaigns = filtered.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      campaigns,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    logger.error('GET /api/foundation/campaigns error', { error: String(error) });
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
    const parsed = createCampaignSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { title, description, category, targetAmount, deadline, imageUrl } = parsed.data;

    const campaign = {
      id: `c-mock-${Date.now()}`,
      title,
      description,
      category,
      targetAmount,
      currentAmount: 0,
      deadline: deadline || null,
      imageUrl: imageUrl || null,
      status: 'active',
      agencyId: auth.agencyId,
      createdAt: new Date().toISOString(),
      _count: { donations: 0 },
    };

    return NextResponse.json(campaign, { status: 201 });
  } catch (error) {
    logger.error('POST /api/foundation/campaigns error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
