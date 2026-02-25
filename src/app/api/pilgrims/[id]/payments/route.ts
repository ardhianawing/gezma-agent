import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { checkPermission } from '@/lib/auth-permissions';
import { PERMISSIONS } from '@/lib/permissions';
import { logActivity } from '@/lib/activity-logger';
import { createPaymentSchema } from '@/lib/validations/payment';
import { logger } from '@/lib/logger';

type Context = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Context) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { id } = await params;

  try {
    const pilgrim = await prisma.pilgrim.findFirst({
      where: { id, agencyId: auth.agencyId },
    });

    if (!pilgrim) {
      return NextResponse.json({ error: 'Jemaah tidak ditemukan' }, { status: 404 });
    }

    const payments = await prisma.paymentRecord.findMany({
      where: { pilgrimId: id },
      orderBy: { date: 'desc' },
    });

    return NextResponse.json({ data: payments });
  } catch (error) {
    logger.error('GET /api/pilgrims/[id]/payments error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

const VALID_TYPES = ['dp', 'installment', 'full', 'refund'] as const;
const VALID_METHODS = ['transfer', 'cash', 'card'] as const;

export async function POST(req: NextRequest, { params }: Context) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const denied = await checkPermission(auth, PERMISSIONS.PAYMENTS_CREATE);
  if (denied) return denied;

  const { id } = await params;

  try {
    // Verify pilgrim belongs to this agency
    const pilgrim = await prisma.pilgrim.findFirst({
      where: { id, agencyId: auth.agencyId },
    });

    if (!pilgrim) {
      return NextResponse.json({ error: 'Jemaah tidak ditemukan' }, { status: 404 });
    }

    const body = await req.json();
    const parsed = createPaymentSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      return NextResponse.json({ error: 'Validasi gagal', errors }, { status: 400 });
    }

    const { amount, type, method, date, notes } = parsed.data;

    // Create payment and update totalPaid in a transaction
    const payment = await prisma.$transaction(async (tx) => {
      const created = await tx.paymentRecord.create({
        data: {
          amount,
          type,
          method,
          date: new Date(date),
          notes: notes || null,
          pilgrimId: id,
        },
      });

      // Sum all payments to update totalPaid
      const { _sum } = await tx.paymentRecord.aggregate({
        where: { pilgrimId: id },
        _sum: { amount: true },
      });

      await tx.pilgrim.update({
        where: { id },
        data: { totalPaid: _sum.amount || 0 },
      });

      return created;
    });

    logActivity({
      type: 'payment',
      action: 'created',
      title: 'Pembayaran diterima',
      description: `${pilgrim.name} - ${type} sebesar Rp ${amount.toLocaleString('id-ID')}`,
      userId: auth.userId,
      agencyId: auth.agencyId,
      metadata: { entityId: payment.id, pilgrimId: id },
    });

    return NextResponse.json(payment, { status: 201 });
  } catch (error) {
    logger.error('POST /api/pilgrims/[id]/payments error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
