import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { logActivity } from '@/lib/activity-logger';

type Context = { params: Promise<{ id: string; paymentId: string }> };

export async function DELETE(req: NextRequest, { params }: Context) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { id, paymentId } = await params;

  try {
    const pilgrim = await prisma.pilgrim.findFirst({
      where: { id, agencyId: auth.agencyId },
    });

    if (!pilgrim) {
      return NextResponse.json({ error: 'Jemaah tidak ditemukan' }, { status: 404 });
    }

    const payment = await prisma.paymentRecord.findFirst({
      where: { id: paymentId, pilgrimId: id },
    });

    if (!payment) {
      return NextResponse.json({ error: 'Pembayaran tidak ditemukan' }, { status: 404 });
    }

    // Delete payment and recalculate totalPaid in a transaction
    await prisma.$transaction(async (tx) => {
      await tx.paymentRecord.delete({ where: { id: paymentId } });

      const { _sum } = await tx.paymentRecord.aggregate({
        where: { pilgrimId: id },
        _sum: { amount: true },
      });

      await tx.pilgrim.update({
        where: { id },
        data: { totalPaid: _sum.amount || 0 },
      });
    });

    logActivity({
      type: 'payment',
      action: 'deleted',
      title: 'Pembayaran dihapus',
      description: `${pilgrim.name} - ${payment.type} sebesar Rp ${payment.amount.toLocaleString('id-ID')} dihapus`,
      userId: auth.userId,
      agencyId: auth.agencyId,
      metadata: { entityId: paymentId, pilgrimId: id },
    });

    return NextResponse.json({ message: 'Pembayaran berhasil dihapus' });
  } catch (error) {
    console.error('DELETE /api/pilgrims/[id]/payments/[paymentId] error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
