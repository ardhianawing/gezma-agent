import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { rateLimit } from '@/lib/rate-limiter';
import { logger } from '@/lib/logger';
import { createDonationSchema } from '@/lib/validations/foundation';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { allowed } = rateLimit(req, { limit: 10, window: 60 });
  if (!allowed) {
    return NextResponse.json({ error: 'Terlalu banyak permintaan' }, { status: 429 });
  }

  try {
    const body = await req.json();
    const parsed = createDonationSchema.safeParse({ ...body, campaignId: params.id });
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.errors[0].message }, { status: 400 });
    }

    const receiptNumber = `DON-2026-${Math.floor(10000 + Math.random() * 90000)}`;

    const donation = {
      id: `don-mock-${Date.now()}`,
      campaignId: params.id,
      donorName: parsed.data.donorName,
      donorEmail: parsed.data.donorEmail || null,
      amount: parsed.data.amount,
      type: parsed.data.type,
      method: parsed.data.method,
      status: 'completed',
      isAnonymous: parsed.data.isAnonymous,
      receiptNumber,
      agencyId: auth.agencyId,
      createdAt: new Date().toISOString(),
    };

    return NextResponse.json(donation, { status: 201 });
  } catch (error) {
    logger.error('POST /api/foundation/campaigns/[id]/donate error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
