import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { checkPermission } from '@/lib/auth-permissions';
import { PERMISSIONS } from '@/lib/permissions';
import { logActivity } from '@/lib/activity-logger';

const VALID_STATUSES = ['lead', 'dp', 'lunas', 'dokumen', 'visa', 'ready', 'departed', 'completed'];

export async function POST(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const body = await req.json();
    const { action, pilgrimIds, status, tripId } = body as {
      action: 'update_status' | 'assign_trip' | 'delete';
      pilgrimIds: string[];
      status?: string;
      tripId?: string;
    };

    // Permission check based on action
    const permMap = { update_status: PERMISSIONS.PILGRIMS_EDIT, assign_trip: PERMISSIONS.PILGRIMS_EDIT, delete: PERMISSIONS.PILGRIMS_DELETE };
    const perm = permMap[action];
    if (perm) {
      const denied = await checkPermission(auth, perm);
      if (denied) return denied;
    }

    // Validate input
    if (!action || !Array.isArray(pilgrimIds) || pilgrimIds.length === 0) {
      return NextResponse.json(
        { error: 'action dan pilgrimIds wajib diisi' },
        { status: 400 }
      );
    }

    if (pilgrimIds.length > 200) {
      return NextResponse.json(
        { error: 'Maksimal 200 jemaah per operasi' },
        { status: 400 }
      );
    }

    // Validate all pilgrimIds belong to the same agency
    const pilgrims = await prisma.pilgrim.findMany({
      where: { id: { in: pilgrimIds }, agencyId: auth.agencyId },
      select: { id: true, name: true, tripId: true, status: true },
    });

    if (pilgrims.length !== pilgrimIds.length) {
      const foundIds = new Set(pilgrims.map((p) => p.id));
      const missing = pilgrimIds.filter((id) => !foundIds.has(id));
      return NextResponse.json(
        { error: `${missing.length} jemaah tidak ditemukan atau bukan milik agency Anda` },
        { status: 403 }
      );
    }

    let success = 0;
    let failed = 0;
    const errors: string[] = [];

    if (action === 'update_status') {
      if (!status || !VALID_STATUSES.includes(status)) {
        return NextResponse.json(
          { error: 'Status tidak valid' },
          { status: 400 }
        );
      }

      await prisma.$transaction(async (tx) => {
        for (const pilgrim of pilgrims) {
          try {
            await tx.pilgrim.update({
              where: { id: pilgrim.id },
              data: { status },
            });
            success++;
          } catch (err) {
            failed++;
            errors.push(`Gagal update ${pilgrim.name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
          }
        }
      });

      logActivity({
        type: 'pilgrim',
        action: 'updated',
        title: 'Bulk update status jemaah',
        description: `${success} jemaah diubah statusnya ke "${status}"`,
        userId: auth.userId,
        agencyId: auth.agencyId,
        metadata: { pilgrimIds, status, success, failed },
      });
    } else if (action === 'assign_trip') {
      if (!tripId) {
        return NextResponse.json(
          { error: 'tripId wajib diisi untuk assign_trip' },
          { status: 400 }
        );
      }

      // Verify trip belongs to agency and check capacity
      const trip = await prisma.trip.findFirst({
        where: { id: tripId, agencyId: auth.agencyId },
      });

      if (!trip) {
        return NextResponse.json(
          { error: 'Trip tidak ditemukan' },
          { status: 404 }
        );
      }

      // Count how many new pilgrims (not already on this trip)
      const newPilgrims = pilgrims.filter((p) => p.tripId !== tripId);
      const currentCount = trip.registeredCount;
      const wouldBeTotal = currentCount + newPilgrims.length;

      if (trip.capacity > 0 && wouldBeTotal > trip.capacity) {
        return NextResponse.json(
          {
            error: `Kapasitas trip tidak cukup. Sisa: ${trip.capacity - currentCount}, dibutuhkan: ${newPilgrims.length}`,
          },
          { status: 400 }
        );
      }

      await prisma.$transaction(async (tx) => {
        // Collect old trip IDs to update their counts
        const oldTripIds = new Set<string>();

        for (const pilgrim of pilgrims) {
          try {
            if (pilgrim.tripId && pilgrim.tripId !== tripId) {
              oldTripIds.add(pilgrim.tripId);
            }
            await tx.pilgrim.update({
              where: { id: pilgrim.id },
              data: { tripId },
            });
            success++;
          } catch (err) {
            failed++;
            errors.push(`Gagal assign ${pilgrim.name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
          }
        }

        // Update registeredCount for the target trip
        const newCount = await tx.pilgrim.count({ where: { tripId } });
        await tx.trip.update({ where: { id: tripId }, data: { registeredCount: newCount } });

        // Update registeredCount for old trips
        for (const oldId of oldTripIds) {
          const count = await tx.pilgrim.count({ where: { tripId: oldId } });
          await tx.trip.update({ where: { id: oldId }, data: { registeredCount: count } });
        }
      });

      logActivity({
        type: 'pilgrim',
        action: 'updated',
        title: 'Bulk assign jemaah ke trip',
        description: `${success} jemaah di-assign ke trip "${trip.name}"`,
        userId: auth.userId,
        agencyId: auth.agencyId,
        metadata: { pilgrimIds, tripId, tripName: trip.name, success, failed },
      });
    } else if (action === 'delete') {
      await prisma.$transaction(async (tx) => {
        // Collect trip IDs to update counts after deletion
        const affectedTripIds = new Set<string>();
        for (const pilgrim of pilgrims) {
          if (pilgrim.tripId) affectedTripIds.add(pilgrim.tripId);
        }

        for (const pilgrim of pilgrims) {
          try {
            await tx.pilgrim.delete({ where: { id: pilgrim.id } });
            success++;
          } catch (err) {
            failed++;
            errors.push(`Gagal hapus ${pilgrim.name}: ${err instanceof Error ? err.message : 'Unknown error'}`);
          }
        }

        // Update registeredCount for affected trips
        for (const tid of affectedTripIds) {
          const count = await tx.pilgrim.count({ where: { tripId: tid } });
          await tx.trip.update({ where: { id: tid }, data: { registeredCount: count } });
        }
      });

      logActivity({
        type: 'pilgrim',
        action: 'deleted',
        title: 'Bulk hapus jemaah',
        description: `${success} jemaah dihapus`,
        userId: auth.userId,
        agencyId: auth.agencyId,
        metadata: { pilgrimIds, success, failed },
      });
    } else {
      return NextResponse.json(
        { error: 'Action tidak valid. Gunakan: update_status, assign_trip, atau delete' },
        { status: 400 }
      );
    }

    return NextResponse.json({ success, failed, errors: errors.length > 0 ? errors : undefined });
  } catch (error) {
    console.error('POST /api/pilgrims/bulk error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
