import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { updateTaskSchema } from '@/lib/validations/task';
import { logActivity } from '@/lib/activity-logger';

type Context = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Context) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = updateTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validasi gagal', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const existing = await prisma.agencyTask.findFirst({
      where: { id, agencyId: auth.agencyId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Task tidak ditemukan' }, { status: 404 });
    }

    const data = parsed.data;
    const updateData: Record<string, unknown> = {};
    if (data.title !== undefined) updateData.title = data.title;
    if (data.description !== undefined) updateData.description = data.description || null;
    if (data.status !== undefined) updateData.status = data.status;
    if (data.priority !== undefined) updateData.priority = data.priority;
    if (data.dueDate !== undefined) updateData.dueDate = data.dueDate ? new Date(data.dueDate) : null;
    if (data.assignedTo !== undefined) updateData.assignedTo = data.assignedTo || null;
    if (data.assigneeName !== undefined) updateData.assigneeName = data.assigneeName || null;

    const task = await prisma.agencyTask.update({
      where: { id },
      data: updateData,
    });

    logActivity({
      type: 'trip',
      action: 'updated',
      title: 'Task diperbarui',
      description: `Task "${task.title}" berhasil diperbarui`,
      userId: auth.userId,
      agencyId: auth.agencyId,
      metadata: { entityId: task.id },
    });

    return NextResponse.json(task);
  } catch (error) {
    console.error('PATCH /api/tasks/[id] error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Context) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { id } = await params;

  try {
    const existing = await prisma.agencyTask.findFirst({
      where: { id, agencyId: auth.agencyId },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Task tidak ditemukan' }, { status: 404 });
    }

    await prisma.agencyTask.delete({ where: { id } });

    logActivity({
      type: 'trip',
      action: 'deleted',
      title: 'Task dihapus',
      description: `Task "${existing.title}" berhasil dihapus`,
      userId: auth.userId,
      agencyId: auth.agencyId,
      metadata: { entityId: id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/tasks/[id] error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
