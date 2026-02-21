import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';

type Context = { params: Promise<{ id: string; docId: string }> };

export async function DELETE(req: NextRequest, { params }: Context) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { id, docId } = await params;

  try {
    // Verify pilgrim belongs to this agency
    const pilgrim = await prisma.pilgrim.findFirst({
      where: { id, agencyId: auth.agencyId },
    });

    if (!pilgrim) {
      return NextResponse.json({ error: 'Jemaah tidak ditemukan' }, { status: 404 });
    }

    // Verify document belongs to this pilgrim
    const doc = await prisma.pilgrimDocument.findFirst({
      where: { id: docId, pilgrimId: id },
    });

    if (!doc) {
      return NextResponse.json({ error: 'Dokumen tidak ditemukan' }, { status: 404 });
    }

    await prisma.pilgrimDocument.delete({ where: { id: docId } });

    return NextResponse.json({ message: 'Dokumen berhasil dihapus' });
  } catch (error) {
    console.error('DELETE /api/pilgrims/[id]/documents/[docId] error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
