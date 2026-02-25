import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { agencyId } = auth;

  try {
    const [missingDocsCount, agency, incompleteTrips] = await Promise.all([
      // Pilgrims with documents that aren't verified
      prisma.pilgrim.count({
        where: {
          agencyId,
          documents: {
            some: { status: { not: 'verified' } },
          },
        },
      }),

      // Agency PPIU expiry
      prisma.agency.findUnique({
        where: { id: agencyId },
        select: { ppiuExpiryDate: true, ppiuStatus: true },
      }),

      // Trips with incomplete manifests (registered < capacity)
      prisma.trip.findMany({
        where: {
          agencyId,
          status: { in: ['open', 'preparing'] },
        },
        select: {
          id: true,
          name: true,
          capacity: true,
          registeredCount: true,
          confirmedCount: true,
        },
      }),
    ]);

    const alerts: {
      id: string;
      type: string;
      priority: string;
      title: string;
      description: string;
      count?: number;
      href: string;
    }[] = [];

    // Alert: missing documents
    if (missingDocsCount > 0) {
      alerts.push({
        id: 'alert_missing_docs',
        type: 'missing_docs',
        priority: 'critical',
        title: 'Dokumen Belum Lengkap',
        description: `${missingDocsCount} jemaah memiliki dokumen yang belum lengkap`,
        count: missingDocsCount,
        href: '/pilgrims?filter=missing_docs',
      });
    }

    // Alert: incomplete manifest
    const incompleteTrip = incompleteTrips.find(
      (t) => t.registeredCount < t.capacity && t.confirmedCount < t.registeredCount
    );
    if (incompleteTrip) {
      alerts.push({
        id: `alert_manifest_${incompleteTrip.id}`,
        type: 'incomplete_manifest',
        priority: 'high',
        title: 'Manifest Belum Lengkap',
        description: `${incompleteTrip.name} memerlukan konfirmasi`,
        href: `/trips/${incompleteTrip.id}`,
      });
    }

    // Alert: PPIU license expiring
    if (agency?.ppiuExpiryDate) {
      const daysUntilExpiry = Math.ceil(
        (new Date(agency.ppiuExpiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      );
      if (daysUntilExpiry <= 90 && daysUntilExpiry > 0) {
        alerts.push({
          id: 'alert_license',
          type: 'license_expiring',
          priority: 'medium',
          title: 'Izin PPIU Akan Berakhir',
          description: `Izin PPIU berakhir dalam ${daysUntilExpiry} hari`,
          href: '/agency',
        });
      } else if (daysUntilExpiry <= 0) {
        alerts.push({
          id: 'alert_license',
          type: 'license_expiring',
          priority: 'critical',
          title: 'Izin PPIU Sudah Berakhir',
          description: 'Izin PPIU sudah melewati masa berlaku',
          href: '/agency',
        });
      }
    }

    return NextResponse.json({ data: alerts });
  } catch (error) {
    logger.error('GET /api/dashboard/alerts error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
