import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { createNoteSchema } from '@/lib/validations/note';
import { logActivity } from '@/lib/activity-logger';
import { logger } from '@/lib/logger';

type Context = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Context) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { id } = await params;

  try {
    // Verify pilgrim belongs to agency
    const pilgrim = await prisma.pilgrim.findFirst({
      where: { id, agencyId: auth.agencyId },
      select: { id: true },
    });

    if (!pilgrim) {
      return NextResponse.json({ error: 'Jemaah tidak ditemukan' }, { status: 404 });
    }

    const notes = await prisma.pilgrimNote.findMany({
      where: { pilgrimId: id, agencyId: auth.agencyId },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ data: notes });
  } catch (error) {
    logger.error('GET /api/pilgrims/[id]/notes error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: Context) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { id } = await params;

  try {
    const body = await req.json();
    const parsed = createNoteSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      return NextResponse.json({ error: 'Validasi gagal', errors }, { status: 400 });
    }

    const content = parsed.data.content.trim();

    // Verify pilgrim belongs to agency
    const pilgrim = await prisma.pilgrim.findFirst({
      where: { id, agencyId: auth.agencyId },
      select: { id: true },
    });

    if (!pilgrim) {
      return NextResponse.json({ error: 'Jemaah tidak ditemukan' }, { status: 404 });
    }

    // Get author name
    const user = await prisma.user.findUnique({
      where: { id: auth.userId },
      select: { name: true },
    });

    const note = await prisma.pilgrimNote.create({
      data: {
        content,
        pilgrimId: id,
        authorId: auth.userId,
        authorName: user?.name || auth.email,
        agencyId: auth.agencyId,
      },
    });

    logActivity({
      type: 'pilgrim',
      action: 'created',
      title: 'Catatan ditambahkan',
      description: `Catatan baru untuk jemaah`,
      userId: auth.userId,
      agencyId: auth.agencyId,
      metadata: { entityId: note.id, pilgrimId: id },
    });

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    logger.error('POST /api/pilgrims/[id]/notes error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
