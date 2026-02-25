import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { updateScheduledReportSchema } from '@/lib/validations/scheduled-report';
import { logActivity } from '@/lib/activity-logger';
import { logger } from '@/lib/logger';

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { id } = await params;

  try {
    // Verify ownership
    const existing = await prisma.scheduledReport.findFirst({
      where: { id, agencyId: auth.agencyId },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Laporan terjadwal tidak ditemukan' }, { status: 404 });
    }

    const body = await req.json();
    const parsed = updateScheduledReportSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      return NextResponse.json({ error: 'Validasi gagal', errors }, { status: 400 });
    }

    const updateData: Record<string, unknown> = {};
    if (parsed.data.frequency !== undefined) updateData.frequency = parsed.data.frequency;
    if (parsed.data.reportType !== undefined) updateData.reportType = parsed.data.reportType;
    if (parsed.data.dayOfWeek !== undefined) updateData.dayOfWeek = parsed.data.dayOfWeek;
    if (parsed.data.dayOfMonth !== undefined) updateData.dayOfMonth = parsed.data.dayOfMonth;
    if (parsed.data.emailTo !== undefined) updateData.emailTo = parsed.data.emailTo;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const updated = await prisma.scheduledReport.update({
      where: { id },
      data: updateData,
    });

    logActivity({
      type: 'settings',
      action: 'updated',
      title: 'Laporan terjadwal diperbarui',
      description: `Laporan terjadwal ${id} diperbarui`,
      userId: auth.userId,
      agencyId: auth.agencyId,
      metadata: { entityId: id },
    });

    return NextResponse.json(updated);
  } catch (error) {
    logger.error('PATCH /api/settings/scheduled-reports/[id] error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { id } = await params;

  try {
    const existing = await prisma.scheduledReport.findFirst({
      where: { id, agencyId: auth.agencyId },
    });
    if (!existing) {
      return NextResponse.json({ error: 'Laporan terjadwal tidak ditemukan' }, { status: 404 });
    }

    await prisma.scheduledReport.delete({ where: { id } });

    logActivity({
      type: 'settings',
      action: 'deleted',
      title: 'Laporan terjadwal dihapus',
      description: `Laporan terjadwal ${existing.reportType} dihapus`,
      userId: auth.userId,
      agencyId: auth.agencyId,
      metadata: { entityId: id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error('DELETE /api/settings/scheduled-reports/[id] error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
