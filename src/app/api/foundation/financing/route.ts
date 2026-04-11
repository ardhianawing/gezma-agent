import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { rateLimit } from '@/lib/rate-limiter';
import { logger } from '@/lib/logger';
import { createFinancingSchema } from '@/lib/validations/foundation';

const MOCK_FINANCINGS = [
  {
    id: 'f1',
    agencyId: 'agency-1',
    amount: 50000000,
    purpose: 'Pengadaan peralatan kantor dan komputer untuk meningkatkan operasional agen.',
    tenorMonths: 12,
    monthlyAmount: 4166667,
    status: 'active',
    approvedAt: '2026-02-01T08:00:00.000Z',
    notes: 'Disetujui. Pastikan laporan bulanan tepat waktu.',
    createdAt: '2026-01-20T08:00:00.000Z',
    installments: [],
  },
  {
    id: 'f2',
    agencyId: 'agency-1',
    amount: 30000000,
    purpose: 'Renovasi kantor agen untuk kenyamanan pelayanan.',
    tenorMonths: 6,
    monthlyAmount: 5000000,
    status: 'pending',
    approvedAt: null,
    notes: null,
    createdAt: '2026-03-15T08:00:00.000Z',
    installments: [],
  },
  {
    id: 'f3',
    agencyId: 'agency-2',
    amount: 75000000,
    purpose: 'Modal kerja untuk program beasiswa yatim semester genap 2026.',
    tenorMonths: 9,
    monthlyAmount: 8333333,
    status: 'approved',
    approvedAt: '2026-04-05T08:00:00.000Z',
    notes: 'Disetujui dengan catatan: laporkan realisasi setiap bulan.',
    createdAt: '2026-03-25T08:00:00.000Z',
    installments: [],
  },
  {
    id: 'f4',
    agencyId: 'agency-3',
    amount: 20000000,
    purpose: 'Pengadaan kendaraan operasional distribusi bantuan.',
    tenorMonths: 24,
    monthlyAmount: 833333,
    status: 'completed',
    approvedAt: '2025-04-01T08:00:00.000Z',
    notes: 'Lunas.',
    createdAt: '2025-03-10T08:00:00.000Z',
    installments: [],
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

  try {
    const total = MOCK_FINANCINGS.length;
    const financings = MOCK_FINANCINGS.slice((page - 1) * limit, page * limit);

    return NextResponse.json({
      financings,
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (error) {
    logger.error('GET /api/foundation/financing error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { allowed } = rateLimit(req, { limit: 5, window: 60 });
  if (!allowed) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = createFinancingSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const { amount, purpose, tenorMonths } = parsed.data;
    const monthlyAmount = amount / tenorMonths;

    const financing = {
      id: `f-mock-${Date.now()}`,
      agencyId: auth.agencyId,
      amount,
      purpose,
      tenorMonths,
      monthlyAmount,
      status: 'pending',
      approvedAt: null,
      notes: null,
      createdAt: new Date().toISOString(),
      installments: [],
    };

    return NextResponse.json(financing, { status: 201 });
  } catch (error) {
    logger.error('POST /api/foundation/financing error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
