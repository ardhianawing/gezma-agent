import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { createTransfer, listTransactions } from '@/lib/services/umrahcash.service';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const transactions = await listTransactions(auth.agencyId);
    return NextResponse.json({ data: transactions });
  } catch (error) {
    logger.error('GET /api/integrations/umrahcash/transfer error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const body = await req.json();
    const { amountSAR, recipientName, recipientBank, recipientAccount, pilgrimId } = body as {
      amountSAR?: number;
      recipientName?: string;
      recipientBank?: string;
      recipientAccount?: string;
      pilgrimId?: string;
    };

    if (!amountSAR || amountSAR <= 0) {
      return NextResponse.json(
        { error: 'Jumlah SAR harus lebih dari 0' },
        { status: 400 }
      );
    }

    if (!recipientName || !recipientBank || !recipientAccount) {
      return NextResponse.json(
        { error: 'Data penerima harus diisi lengkap' },
        { status: 400 }
      );
    }

    const transaction = await createTransfer({
      amountSAR,
      recipientName,
      recipientBank,
      recipientAccount,
      pilgrimId,
      agencyId: auth.agencyId,
    });

    return NextResponse.json({ data: transaction });
  } catch (error) {
    logger.error('POST /api/integrations/umrahcash/transfer error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
