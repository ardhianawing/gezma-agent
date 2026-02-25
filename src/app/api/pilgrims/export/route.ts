import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { generateCSV } from '@/lib/csv-export';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const pilgrims = await prisma.pilgrim.findMany({
      where: { agencyId: auth.agencyId },
      include: {
        documents: { select: { type: true, status: true } },
      },
      orderBy: { name: 'asc' },
    });

    const headers = ['Nama', 'NIK', 'Email', 'Telepon', 'Gender', 'Tanggal Lahir', 'Kota', 'Provinsi', 'Status', 'Kode Booking', 'Total Bayar', 'Sisa', 'Dok Verified', 'Dok Uploaded', 'Dok Missing'];

    const rows = pilgrims.map(p => {
      const verified = p.documents.filter(d => d.status === 'verified').length;
      const uploaded = p.documents.filter(d => d.status === 'uploaded').length;
      const missing = p.documents.filter(d => d.status === 'missing').length;
      return [
        p.name,
        p.nik,
        p.email,
        p.phone,
        p.gender,
        p.birthDate,
        p.city,
        p.province,
        p.status,
        p.bookingCode || '',
        String(p.totalPaid),
        String(p.remainingBalance),
        String(verified),
        String(uploaded),
        String(missing),
      ];
    });

    const csv = generateCSV(headers, rows);

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="jamaah-${new Date().toISOString().split('T')[0]}.csv"`,
      },
    });
  } catch (error) {
    logger.error('GET /api/pilgrims/export error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
