import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';

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
    console.error('GET /api/pilgrims/[id]/notes error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest, { params }: Context) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { id } = await params;

  try {
    const body = await req.json();
    const content = body.content?.trim();

    if (!content || content.length < 1) {
      return NextResponse.json({ error: 'Konten catatan tidak boleh kosong' }, { status: 400 });
    }

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

    return NextResponse.json(note, { status: 201 });
  } catch (error) {
    console.error('POST /api/pilgrims/[id]/notes error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
