import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { generateCSV } from '@/lib/csv-export';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const payments = await prisma.paymentRecord.findMany({
      where: { pilgrim: { agencyId: auth.agencyId } },
      include: {
        pilgrim: { select: { name: true, bookingCode: true } },
      },
      orderBy: { date: 'desc' },
    });

    const headers = ['Tanggal', 'Nama Jemaah', 'Kode Booking', 'Tipe', 'Metode', 'Jumlah', 'Catatan'];

    const rows = payments.map(p => [
      p.date.toISOString().split('T')[0],
      p.pilgrim.name,
      p.pilgrim.bookingCode || '',
      p.type,
      p.method,
      String(p.amount),
      p.notes || '',
    ]);

    const csv = generateCSV(headers, rows);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="pembayaran-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    logger.error('GET /api/reports/financial/export error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
