import { prisma } from '@/lib/prisma';

export async function getDashboardStats(agencyId: string) {
  const [totalPilgrims, activePackages, activeTrips, pendingDocsResult, upcomingTrips] =
    await Promise.all([
      prisma.pilgrim.count({ where: { agencyId } }),

      prisma.package.count({ where: { agencyId, isActive: true } }),

      prisma.trip.count({
        where: {
          agencyId,
          status: { notIn: ['completed', 'cancelled'] },
        },
      }),

      prisma.pilgrim.count({
        where: {
          agencyId,
          documents: {
            some: { status: { not: 'verified' } },
          },
        },
      }),

      prisma.trip.findMany({
        where: {
          agencyId,
          status: { notIn: ['completed', 'cancelled'] },
        },
        select: {
          id: true,
          name: true,
          departureDate: true,
          registeredCount: true,
          status: true,
        },
        orderBy: { departureDate: 'asc' },
        take: 10,
      }),
    ]);

  return {
    totalPilgrims,
    activePackages,
    activeTrips,
    pendingDocs: pendingDocsResult,
    upcomingTrips,
  };
}

export async function getDashboardAlerts(agencyId: string) {
  const [missingDocsCount, agency, incompleteTrips] = await Promise.all([
    prisma.pilgrim.count({
      where: {
        agencyId,
        documents: {
          some: { status: { not: 'verified' } },
        },
      },
    }),

    prisma.agency.findUnique({
      where: { id: agencyId },
      select: { ppiuExpiryDate: true, ppiuStatus: true },
    }),

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

  const incompleteTrip = incompleteTrips.find(
    (t: { registeredCount: number; capacity: number; confirmedCount: number }) => t.registeredCount < t.capacity && t.confirmedCount < t.registeredCount,
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

  if (agency?.ppiuExpiryDate) {
    const daysUntilExpiry = Math.ceil(
      (new Date(agency.ppiuExpiryDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24),
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

  return { data: alerts };
}
