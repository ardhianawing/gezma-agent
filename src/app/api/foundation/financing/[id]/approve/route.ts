import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest, { params }: { params: { id: string } }) {
  // Command Center only — this route is intended for CC admins
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const body = await req.json();
    const { action, notes } = body; // action: 'approve' | 'reject'

    if (!['approve', 'reject'].includes(action)) {
      return NextResponse.json({ error: 'Aksi tidak valid' }, { status: 400 });
    }

    const financing = await prisma.foundationFinancing.findFirst({
      where: { id: params.id, status: 'pending' },
    });

    if (!financing) {
      return NextResponse.json({ error: 'Pengajuan tidak ditemukan atau sudah diproses' }, { status: 404 });
    }

    if (action === 'approve') {
      const now = new Date();
      const installments = Array.from({ length: financing.tenorMonths }, (_, i) => {
        const dueDate = new Date(now);
        dueDate.setMonth(dueDate.getMonth() + i + 1);
        return {
          financingId: financing.id,
          installmentNo: i + 1,
          amount: financing.monthlyAmount,
          dueDate,
          status: 'pending',
        };
      });

      await prisma.$transaction([
        prisma.foundationFinancing.update({
          where: { id: params.id },
          data: {
            status: 'approved',
            approvedAt: now,
            notes: notes || null,
          },
        }),
        prisma.foundationFinancingInstallment.createMany({ data: installments }),
      ]);
    } else {
      await prisma.foundationFinancing.update({
        where: { id: params.id },
        data: { status: 'rejected', notes: notes || null },
      });
    }

    return NextResponse.json({ success: true, action });
  } catch (error) {
    logger.error('POST /api/foundation/financing/[id]/approve error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
