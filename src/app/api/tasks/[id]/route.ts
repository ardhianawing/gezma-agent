import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';

type Context = { params: Promise<{ id: string }> };

export async function PATCH(req: NextRequest, { params }: Context) {
  const auth = getAuthPayload(req); if (!auth) return unauthorizedResponse();
  const { id } = await params;

  try {
    const body = await req.json();

    const updatedTask = {
      id,
      title: body.title || 'Task diperbarui',
      description: body.description || null,
      status: body.status || 'todo',
      priority: body.priority || 'medium',
      dueDate: body.dueDate || null,
      assignedTo: body.assignedTo || null,
      assigneeName: body.assigneeName || null,
      createdBy: 'Admin',
      createdAt: '2026-03-01T08:00:00Z',
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json(updatedTask);
  } catch {
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest, { params }: Context) {
  const auth = getAuthPayload(req); if (!auth) return unauthorizedResponse();
  const { id } = await params;

  return NextResponse.json({ success: true, deletedId: id });
}
