import { prisma } from '@/lib/prisma';
import { AppError } from '@/lib/errors';
import { createPaymentSchema } from '@/lib/validations/payment';
import { logActivity } from '@/lib/activity-logger';

export async function listPayments(pilgrimId: string, agencyId: string) {
  const pilgrim = await prisma.pilgrim.findFirst({
    where: { id: pilgrimId, agencyId },
  });
  if (!pilgrim) throw new AppError('NOT_FOUND', 'Jemaah tidak ditemukan');

  const data = await prisma.paymentRecord.findMany({
    where: { pilgrimId },
    orderBy: { date: 'desc' },
  });

  return { data };
}

interface CreatePaymentParams {
  pilgrimId: string;
  body: unknown;
  userId: string;
  agencyId: string;
}

export async function createPayment({ pilgrimId, body, userId, agencyId }: CreatePaymentParams) {
  const pilgrim = await prisma.pilgrim.findFirst({
    where: { id: pilgrimId, agencyId },
  });
  if (!pilgrim) throw new AppError('NOT_FOUND', 'Jemaah tidak ditemukan');

  const data = createPaymentSchema.parse(body);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const payment = await prisma.$transaction(async (tx: any) => {
    const created = await tx.paymentRecord.create({
      data: {
        amount: data.amount,
        type: data.type,
        method: data.method,
        date: new Date(data.date),
        notes: data.notes || null,
        pilgrimId,
      },
    });

    const { _sum } = await tx.paymentRecord.aggregate({
      where: { pilgrimId },
      _sum: { amount: true },
    });

    await tx.pilgrim.update({
      where: { id: pilgrimId },
      data: { totalPaid: _sum.amount || 0 },
    });

    return created;
  });

  logActivity({
    type: 'payment',
    action: 'created',
    title: 'Pembayaran diterima',
    description: `${pilgrim.name} - ${data.type} sebesar Rp ${data.amount.toLocaleString('id-ID')}`,
    userId,
    agencyId,
    metadata: { entityId: payment.id, pilgrimId },
  });

  return payment;
}

interface DeletePaymentParams {
  pilgrimId: string;
  paymentId: string;
  userId: string;
  agencyId: string;
}

export async function deletePayment({ pilgrimId, paymentId, userId, agencyId }: DeletePaymentParams) {
  const pilgrim = await prisma.pilgrim.findFirst({
    where: { id: pilgrimId, agencyId },
  });
  if (!pilgrim) throw new AppError('NOT_FOUND', 'Jemaah tidak ditemukan');

  const payment = await prisma.paymentRecord.findFirst({
    where: { id: paymentId, pilgrimId },
  });
  if (!payment) throw new AppError('NOT_FOUND', 'Pembayaran tidak ditemukan');

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  await prisma.$transaction(async (tx: any) => {
    await tx.paymentRecord.delete({ where: { id: paymentId } });

    const { _sum } = await tx.paymentRecord.aggregate({
      where: { pilgrimId },
      _sum: { amount: true },
    });

    await tx.pilgrim.update({
      where: { id: pilgrimId },
      data: { totalPaid: _sum.amount || 0 },
    });
  });

  logActivity({
    type: 'payment',
    action: 'deleted',
    title: 'Pembayaran dihapus',
    description: `${pilgrim.name} - ${payment.type} sebesar Rp ${payment.amount.toLocaleString('id-ID')} dihapus`,
    userId,
    agencyId,
    metadata: { entityId: paymentId, pilgrimId },
  });

  return { message: 'Pembayaran berhasil dihapus' };
}
