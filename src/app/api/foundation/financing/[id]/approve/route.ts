import { NextRequest, NextResponse } from 'next/server';
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

    const now = new Date().toISOString();

    if (action === 'approve') {
      // Mock: generate 6 installments for a sample financing of 50M over 6 months
      const tenorMonths = 6;
      const monthlyAmount = 8333333;
      const installments = Array.from({ length: tenorMonths }, (_, i) => {
        const dueDate = new Date();
        dueDate.setMonth(dueDate.getMonth() + i + 1);
        return {
          id: `inst-mock-${i + 1}`,
          financingId: params.id,
          installmentNo: i + 1,
          amount: i === tenorMonths - 1 ? 8333337 : monthlyAmount,
          dueDate: dueDate.toISOString().split('T')[0],
          status: 'pending',
          paidAt: null,
        };
      });

      return NextResponse.json({
        success: true,
        action,
        financing: {
          id: params.id,
          status: 'approved',
          approvedAt: now,
          notes: notes || null,
        },
        installments,
      });
    } else {
      return NextResponse.json({
        success: true,
        action,
        financing: {
          id: params.id,
          status: 'rejected',
          approvedAt: null,
          notes: notes || null,
        },
      });
    }
  } catch (error) {
    logger.error('POST /api/foundation/financing/[id]/approve error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
