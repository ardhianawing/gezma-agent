import { NextRequest, NextResponse } from 'next/server';
import { getCCAuthPayload, ccUnauthorizedResponse } from '@/lib/auth-command-center';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const auth = getCCAuthPayload(req);
  if (!auth) return ccUnauthorizedResponse();

  const { searchParams } = new URL(req.url);
  const statusFilter = searchParams.get('status');
  const minScore = searchParams.get('minScore') ? Number(searchParams.get('minScore')) : null;
  const maxScore = searchParams.get('maxScore') ? Number(searchParams.get('maxScore')) : null;

  try {
    // Build where clause
    const where: Record<string, unknown> = {};
    if (statusFilter) {
      where.ppiuStatus = statusFilter;
    }

    const agencies = await prisma.agency.findMany({
      where,
      select: {
        id: true,
        name: true,
        ppiuStatus: true,
        ppiuExpiryDate: true,
        ppiuNumber: true,
        city: true,
        _count: {
          select: {
            pilgrims: true,
            activityLogs: true,
          },
        },
        pilgrims: {
          select: {
            id: true,
            documents: {
              select: {
                status: true,
              },
            },
            // verificationCode excluded — use status to determine verification
            status: true,
          },
        },
        activityLogs: {
          where: {
            createdAt: {
              gte: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000), // last 60 days
            },
          },
          select: {
            createdAt: true,
          },
          orderBy: { createdAt: 'desc' },
          take: 1,
        },
      },
    });

    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
    const sixtyDaysAgo = new Date(now.getTime() - 60 * 24 * 60 * 60 * 1000);

    const results = agencies.map((agency) => {
      // 1. PPIU Status weight 40%
      let ppiuScore = 0;
      switch (agency.ppiuStatus) {
        case 'active': ppiuScore = 100; break;
        case 'expiring': ppiuScore = 60; break;
        case 'pending': ppiuScore = 30; break;
        case 'expired': ppiuScore = 0; break;
        default: ppiuScore = 0;
      }

      // 2. Doc verification weight 30%
      let totalDocs = 0;
      let verifiedDocs = 0;
      for (const pilgrim of agency.pilgrims) {
        for (const doc of pilgrim.documents) {
          totalDocs++;
          if (doc.status === 'verified') verifiedDocs++;
        }
      }
      const docScore = totalDocs > 0 ? (verifiedDocs / totalDocs) * 100 : 0;

      // 3. Activity weight 20%
      let activityScore = 0;
      if (agency.activityLogs.length > 0) {
        const lastActivity = new Date(agency.activityLogs[0].createdAt);
        if (lastActivity >= thirtyDaysAgo) {
          activityScore = 100;
        } else if (lastActivity >= sixtyDaysAgo) {
          activityScore = 50;
        }
      }

      // 4. Verified pilgrim ratio weight 10%
      const totalPilgrims = agency.pilgrims.length;
      // Pilgrims past 'lead' status are considered verified (replaces verificationCode check)
      const verifiedPilgrims = agency.pilgrims.filter(p => p.status !== 'lead').length;
      const pilgrimScore = totalPilgrims > 0 ? (verifiedPilgrims / totalPilgrims) * 100 : 0;

      // Weighted total
      const totalScore = Math.round(
        ppiuScore * 0.4 +
        docScore * 0.3 +
        activityScore * 0.2 +
        pilgrimScore * 0.1
      );

      return {
        id: agency.id,
        name: agency.name,
        ppiuStatus: agency.ppiuStatus,
        ppiuNumber: agency.ppiuNumber,
        ppiuExpiryDate: agency.ppiuExpiryDate,
        city: agency.city,
        totalPilgrims,
        totalScore,
        breakdown: {
          ppiu: Math.round(ppiuScore),
          document: Math.round(docScore),
          activity: Math.round(activityScore),
          pilgrimVerification: Math.round(pilgrimScore),
        },
      };
    });

    // Filter by score range
    let filtered = results;
    if (minScore !== null) {
      filtered = filtered.filter(a => a.totalScore >= minScore);
    }
    if (maxScore !== null) {
      filtered = filtered.filter(a => a.totalScore <= maxScore);
    }

    // Sort by score descending
    filtered.sort((a, b) => b.totalScore - a.totalScore);

    return NextResponse.json({ data: filtered, total: filtered.length });
  } catch (error) {
    logger.error('Compliance fetch error', { error: String(error) });
    return NextResponse.json({ error: 'Gagal memuat data compliance' }, { status: 500 });
  }
}
