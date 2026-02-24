import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';

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
    const updateData: Record<string, unknown> = {};

    if (body.frequency !== undefined) {
      if (!['weekly', 'monthly'].includes(body.frequency)) {
        return NextResponse.json({ error: 'Frequency harus weekly atau monthly' }, { status: 400 });
      }
      updateData.frequency = body.frequency;
    }
    if (body.reportType !== undefined) {
      if (!['financial', 'pilgrim', 'trip'].includes(body.reportType)) {
        return NextResponse.json({ error: 'Report type harus financial, pilgrim, atau trip' }, { status: 400 });
      }
      updateData.reportType = body.reportType;
    }
    if (body.dayOfWeek !== undefined) updateData.dayOfWeek = body.dayOfWeek;
    if (body.dayOfMonth !== undefined) updateData.dayOfMonth = body.dayOfMonth;
    if (body.emailTo !== undefined) updateData.emailTo = body.emailTo;
    if (body.isActive !== undefined) updateData.isActive = body.isActive;

    const updated = await prisma.scheduledReport.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json(updated);
  } catch (error) {
    console.error('PATCH /api/settings/scheduled-reports/[id] error:', error);
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

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/settings/scheduled-reports/[id] error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
