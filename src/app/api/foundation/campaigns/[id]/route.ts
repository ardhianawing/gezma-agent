import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { rateLimit } from '@/lib/rate-limiter';
import { logger } from '@/lib/logger';
import { createCampaignSchema } from '@/lib/validations/foundation';

const MOCK_CAMPAIGN_DETAIL = {
  id: 'c1',
  title: 'Renovasi Masjid Al-Ikhlas Bekasi',
  description: 'Masjid Al-Ikhlas yang berdiri sejak 1985 membutuhkan renovasi menyeluruh. Atap bocor dan lantai retak perlu segera diperbaiki demi kenyamanan jamaah.',
  category: 'masjid',
  targetAmount: 200000000,
  currentAmount: 145000000,
  deadline: '2026-06-30',
  status: 'active',
  imageUrl: null,
  createdAt: '2026-01-15T08:00:00.000Z',
  _count: { donations: 234 },
  donations: [
    { id: 'd1', donorName: 'Hamba Allah', amount: 500000, type: 'infaq', method: 'transfer', status: 'completed', isAnonymous: true, createdAt: '2026-04-10T09:00:00.000Z' },
    { id: 'd2', donorName: 'Budi Santoso', amount: 1000000, type: 'sedekah', method: 'transfer', status: 'completed', isAnonymous: false, createdAt: '2026-04-09T14:30:00.000Z' },
    { id: 'd3', donorName: 'Siti Rahayu', amount: 250000, type: 'infaq', method: 'qris', status: 'completed', isAnonymous: false, createdAt: '2026-04-08T11:00:00.000Z' },
    { id: 'd4', donorName: 'Hamba Allah', amount: 2000000, type: 'wakaf', method: 'transfer', status: 'completed', isAnonymous: true, createdAt: '2026-04-07T16:00:00.000Z' },
    { id: 'd5', donorName: 'Ahmad Fauzi', amount: 100000, type: 'sedekah', method: 'qris', status: 'completed', isAnonymous: false, createdAt: '2026-04-06T10:00:00.000Z' },
  ],
  impactReports: [
    { id: 'ir1', title: 'Progres Bulan Maret 2026', content: 'Pengerjaan atap sayap kiri telah selesai 80%. Material bangunan sudah tiba seluruhnya.', imageUrl: null, createdAt: '2026-04-01T08:00:00.000Z' },
    { id: 'ir2', title: 'Laporan Februari 2026', content: 'Proses pembongkaran atap lama selesai. Tim kontraktor mulai memasang rangka baja baru.', imageUrl: null, createdAt: '2026-03-01T08:00:00.000Z' },
    { id: 'ir3', title: 'Kickoff Renovasi Januari 2026', content: 'Alhamdulillah dana awal terkumpul. Kontraktor sudah ditunjuk dan proses renovasi dimulai.', imageUrl: null, createdAt: '2026-02-01T08:00:00.000Z' },
  ],
};

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    // Return mock detail regardless of id, substituting the requested id
    const campaign = { ...MOCK_CAMPAIGN_DETAIL, id: params.id };
    return NextResponse.json(campaign);
  } catch (error) {
    logger.error('GET /api/foundation/campaigns/[id] error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { allowed } = rateLimit(req, { limit: 10, window: 60 });
  if (!allowed) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = createCampaignSchema.partial().safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const updated = {
      ...MOCK_CAMPAIGN_DETAIL,
      id: params.id,
      ...parsed.data,
      deadline: parsed.data.deadline ? parsed.data.deadline : MOCK_CAMPAIGN_DETAIL.deadline,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(updated);
  } catch (error) {
    logger.error('PUT /api/foundation/campaigns/[id] error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('DELETE /api/foundation/campaigns/[id] error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
