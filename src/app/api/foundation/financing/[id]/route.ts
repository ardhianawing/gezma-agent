import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { logger } from '@/lib/logger';

const MOCK_FINANCING_DETAIL = {
  id: 'f1',
  agencyId: 'agency-1',
  amount: 50000000,
  purpose: 'Pengadaan peralatan kantor dan komputer untuk meningkatkan operasional agen.',
  tenorMonths: 6,
  monthlyAmount: 8333333,
  status: 'active',
  approvedAt: '2026-02-01T08:00:00.000Z',
  notes: 'Disetujui. Pastikan laporan bulanan tepat waktu.',
  createdAt: '2026-01-20T08:00:00.000Z',
  installments: [
    { id: 'inst1', financingId: 'f1', installmentNo: 1, amount: 8333333, dueDate: '2026-03-01', status: 'paid', paidAt: '2026-02-28T10:00:00.000Z' },
    { id: 'inst2', financingId: 'f1', installmentNo: 2, amount: 8333333, dueDate: '2026-04-01', status: 'paid', paidAt: '2026-03-30T10:00:00.000Z' },
    { id: 'inst3', financingId: 'f1', installmentNo: 3, amount: 8333333, dueDate: '2026-05-01', status: 'pending', paidAt: null },
    { id: 'inst4', financingId: 'f1', installmentNo: 4, amount: 8333333, dueDate: '2026-06-01', status: 'pending', paidAt: null },
    { id: 'inst5', financingId: 'f1', installmentNo: 5, amount: 8333333, dueDate: '2026-07-01', status: 'pending', paidAt: null },
    { id: 'inst6', financingId: 'f1', installmentNo: 6, amount: 8333337, dueDate: '2026-08-01', status: 'pending', paidAt: null },
  ],
};

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const financing = { ...MOCK_FINANCING_DETAIL, id: params.id };
    return NextResponse.json(financing);
  } catch (error) {
    logger.error('GET /api/foundation/financing/[id] error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const body = await req.json();
    const { notes } = body;

    const updated = { ...MOCK_FINANCING_DETAIL, id: params.id, notes: notes || null, updatedAt: new Date().toISOString() };
    return NextResponse.json(updated);
  } catch (error) {
    logger.error('PUT /api/foundation/financing/[id] error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
