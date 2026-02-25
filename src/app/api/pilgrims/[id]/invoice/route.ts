import { NextRequest } from 'next/server';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { generateInvoicePdf } from '@/lib/services/invoice.service';
import { logger } from '@/lib/logger';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { id } = await params;

  try {
  const pilgrim = await prisma.pilgrim.findFirst({
    where: { id, agencyId: auth.agencyId },
    include: {
      payments: {
        orderBy: { date: 'asc' },
      },
    },
  });

  if (!pilgrim) {
    return new Response(JSON.stringify({ error: 'Jemaah tidak ditemukan' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const agency = await prisma.agency.findUnique({
    where: { id: auth.agencyId },
  });

  if (!agency) {
    return new Response(JSON.stringify({ error: 'Agency tidak ditemukan' }), {
      status: 404,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const pdfBuffer = generateInvoicePdf(
    {
      name: pilgrim.name,
      nik: pilgrim.nik,
      bookingCode: pilgrim.bookingCode,
      totalPaid: pilgrim.totalPaid,
      remainingBalance: pilgrim.remainingBalance,
    },
    pilgrim.payments.map((p) => ({
      id: p.id,
      date: p.date.toISOString(),
      type: p.type,
      method: p.method,
      amount: p.amount,
      notes: p.notes,
    })),
    {
      name: agency.name,
      legalName: agency.legalName,
      address: agency.address,
      city: agency.city,
      province: agency.province,
      phone: agency.phone,
      email: agency.email,
      ppiuNumber: agency.ppiuNumber,
    }
  );

  const fileName = `kwitansi-${pilgrim.name.replace(/\s+/g, '-').toLowerCase()}-${Date.now()}.pdf`;

  return new Response(new Uint8Array(pdfBuffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/pdf',
      'Content-Disposition': `attachment; filename="${fileName}"`,
    },
  });
  } catch (error) {
    logger.error('[INVOICE_GET] error', { error: String(error) });
    return new Response(JSON.stringify({ error: 'Terjadi kesalahan server' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
}
