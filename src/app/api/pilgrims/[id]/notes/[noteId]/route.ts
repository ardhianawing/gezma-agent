import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';

type Context = { params: Promise<{ id: string; noteId: string }> };

export async function DELETE(req: NextRequest, { params }: Context) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { id, noteId } = await params;

  try {
    const note = await prisma.pilgrimNote.findFirst({
      where: { id: noteId, pilgrimId: id, agencyId: auth.agencyId },
    });

    if (!note) {
      return NextResponse.json({ error: 'Catatan tidak ditemukan' }, { status: 404 });
    }

    // Only the author or agency owner can delete
    if (note.authorId !== auth.userId && auth.role !== 'owner') {
      return NextResponse.json({ error: 'Tidak diizinkan menghapus catatan ini' }, { status: 403 });
    }

    await prisma.pilgrimNote.delete({ where: { id: noteId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('DELETE /api/pilgrims/[id]/notes/[noteId] error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
