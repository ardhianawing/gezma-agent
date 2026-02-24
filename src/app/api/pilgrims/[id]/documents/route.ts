import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { checkPermission } from '@/lib/auth-permissions';
import { PERMISSIONS } from '@/lib/permissions';
import { logActivity } from '@/lib/activity-logger';

type Context = { params: Promise<{ id: string }> };

export async function POST(req: NextRequest, { params }: Context) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const denied = await checkPermission(auth, PERMISSIONS.PILGRIMS_EDIT);
  if (denied) return denied;

  const { id } = await params;

  try {
    // Verify pilgrim belongs to this agency
    const pilgrim = await prisma.pilgrim.findFirst({
      where: { id, agencyId: auth.agencyId },
    });

    if (!pilgrim) {
      return NextResponse.json({ error: 'Jemaah tidak ditemukan' }, { status: 404 });
    }

    const body = await req.json();
    const { type, status, fileName, fileUrl, expiryDate } = body;

    if (!type) {
      return NextResponse.json({ error: 'Tipe dokumen wajib diisi' }, { status: 400 });
    }

    const doc = await prisma.pilgrimDocument.create({
      data: {
        type,
        status: status || 'uploaded',
        fileName: fileName || null,
        fileUrl: fileUrl || null,
        fileSize: body.fileSize || null,
        expiryDate: expiryDate ? new Date(expiryDate) : null,
        uploadedAt: new Date(),
        pilgrimId: id,
      },
    });

    logActivity({
      type: 'document',
      action: 'uploaded',
      title: 'Dokumen diupload',
      description: `${pilgrim.name} - Dokumen ${type} telah diupload`,
      userId: auth.userId,
      agencyId: auth.agencyId,
      metadata: { entityId: doc.id, pilgrimId: id },
    });

    return NextResponse.json(doc, { status: 201 });
  } catch (error) {
    console.error('POST /api/pilgrims/[id]/documents error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
