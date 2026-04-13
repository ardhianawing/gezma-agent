import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req); if (!auth) return unauthorizedResponse();
  const agencyId = auth.agencyId;

  // Mock data (fallback)
  const mockTotalPilgrims = 156;
  const mockDocs = [
    { type: "passport", label: "Passport", total: mockTotalPilgrims, uploaded: 14, verified: 128 },
    { type: "visa", label: "Visa", total: mockTotalPilgrims, uploaded: 13, verified: 85 },
    { type: "insurance", label: "Asuransi", total: mockTotalPilgrims, uploaded: 5, verified: 115 },
    { type: "health_certificate", label: "Surat Kesehatan", total: mockTotalPilgrims, uploaded: 11, verified: 78 },
    { type: "photo", label: "Foto 4x6", total: mockTotalPilgrims, uploaded: 3, verified: 145 },
  ];
  const mockCompletion = mockDocs.map(doc => {
    const missing = doc.total - doc.uploaded - doc.verified;
    const completionRate = doc.total > 0 ? Math.round((doc.verified / doc.total) * 100) : 0;
    return {
      type: doc.type,
      label: doc.label,
      verified: doc.verified,
      uploaded: doc.uploaded,
      missing: missing > 0 ? missing : 0,
      total: doc.total,
      completionRate,
    };
  });

  try {
    // Real DB queries
    const [totalPilgrims, docGroups] = await Promise.all([
      prisma.pilgrim.count({ where: { agencyId, deletedAt: null } }),
      prisma.pilgrimDocument.groupBy({
        by: ['type', 'status'],
        _count: true,
        where: { pilgrim: { agencyId, deletedAt: null } },
      }),
    ]);

    if (totalPilgrims > 0 && docGroups.length > 0) {
      // Label mapping for document types
      const labelMap: Record<string, string> = {
        ktp: "KTP",
        passport: "Passport",
        photo: "Foto 4x6",
        visa: "Visa",
        health_cert: "Surat Kesehatan",
        health_certificate: "Surat Kesehatan",
        book_nikah: "Buku Nikah",
        insurance: "Asuransi",
      };

      // Aggregate by type
      const typeStats: Record<string, { uploaded: number; verified: number }> = {};
      for (const g of docGroups) {
        if (!typeStats[g.type]) {
          typeStats[g.type] = { uploaded: 0, verified: 0 };
        }
        if (g.status === 'uploaded') {
          typeStats[g.type].uploaded += g._count;
        } else if (g.status === 'verified') {
          typeStats[g.type].verified += g._count;
        }
      }

      const completion = Object.entries(typeStats).map(([type, stats]) => {
        const missing = totalPilgrims - stats.uploaded - stats.verified;
        const completionRate = totalPilgrims > 0 ? Math.round((stats.verified / totalPilgrims) * 100) : 0;
        return {
          type,
          label: labelMap[type] || type,
          verified: stats.verified,
          uploaded: stats.uploaded,
          missing: missing > 0 ? missing : 0,
          total: totalPilgrims,
          completionRate,
        };
      });

      return NextResponse.json({
        totalPilgrims,
        completion,
      });
    }
  } catch (error) {
    console.error('[reports/documents] DB error, falling back to mock:', error);
  }

  // Fallback to mock data
  return NextResponse.json({
    totalPilgrims: mockTotalPilgrims,
    completion: mockCompletion,
  });
}
