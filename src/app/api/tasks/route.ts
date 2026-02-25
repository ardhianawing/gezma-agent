import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { checkPermission } from '@/lib/auth-permissions';
import { PERMISSIONS } from '@/lib/permissions';
import { createTaskSchema } from '@/lib/validations/task';
import { logActivity } from '@/lib/activity-logger';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const denied = await checkPermission(auth, PERMISSIONS.SETTINGS_VIEW);
  if (denied) return denied;

  const status = req.nextUrl.searchParams.get('status') || undefined;
  const assignedTo = req.nextUrl.searchParams.get('assignedTo') || undefined;

  try {
    const where: Record<string, unknown> = { agencyId: auth.agencyId };
    if (status) where.status = status;
    if (assignedTo) where.assignedTo = assignedTo;

    const tasks = await prisma.agencyTask.findMany({
      where,
      orderBy: [{ priority: 'desc' }, { createdAt: 'desc' }],
    });

    return NextResponse.json({ data: tasks });
  } catch (error) {
    logger.error('GET /api/tasks error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const body = await req.json();
    const parsed = createTaskSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Validasi gagal', details: parsed.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const data = parsed.data;

    const task = await prisma.agencyTask.create({
      data: {
        title: data.title,
        description: data.description || null,
        status: data.status,
        priority: data.priority,
        dueDate: data.dueDate ? new Date(data.dueDate) : null,
        assignedTo: data.assignedTo || null,
        assigneeName: data.assigneeName || null,
        createdBy: auth.userId,
        agencyId: auth.agencyId,
      },
    });

    logActivity({
      type: 'system',
      action: 'created',
      title: 'Task dibuat',
      description: `Task "${task.title}" berhasil dibuat`,
      userId: auth.userId,
      agencyId: auth.agencyId,
      metadata: { entityId: task.id },
    });

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    logger.error('POST /api/tasks error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
