import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';

const DOC_LABELS: Record<string, string> = {
  ktp: 'KTP', passport: 'Paspor', photo: 'Pas Foto', kk: 'Kartu Keluarga',
  vaccine: 'Vaksin', akta: 'Akta/Ijazah', book_nikah: 'Buku Nikah', surat_mahram: 'Surat Mahram',
};

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const documents = await prisma.pilgrimDocument.findMany({
      where: { pilgrim: { agencyId: auth.agencyId } },
      select: { type: true, status: true },
    });

    const totalPilgrims = await prisma.pilgrim.count({ where: { agencyId: auth.agencyId } });

    // Group by type
    const typeStats: Record<string, { verified: number; uploaded: number; missing: number; total: number }> = {};
    for (const doc of documents) {
      if (!typeStats[doc.type]) {
        typeStats[doc.type] = { verified: 0, uploaded: 0, missing: 0, total: 0 };
      }
      typeStats[doc.type].total++;
      if (doc.status === 'verified') typeStats[doc.type].verified++;
      else if (doc.status === 'uploaded') typeStats[doc.type].uploaded++;
      else typeStats[doc.type].missing++;
    }

    const completion = Object.entries(typeStats).map(([type, stats]) => ({
      type,
      label: DOC_LABELS[type] || type,
      verified: stats.verified,
      uploaded: stats.uploaded,
      missing: Math.max(0, totalPilgrims - stats.total) + stats.missing,
      total: totalPilgrims,
      completionRate: totalPilgrims > 0 ? Math.round(((stats.verified + stats.uploaded) / totalPilgrims) * 100) : 0,
    }));

    return NextResponse.json({ totalPilgrims, completion });
  } catch (error) {
    console.error('GET /api/reports/documents error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
