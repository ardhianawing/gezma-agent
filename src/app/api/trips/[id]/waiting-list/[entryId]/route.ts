import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; entryId: string }> }
) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { id, entryId } = await params;

  // Verify entry belongs to trip and agency
  const entry = await prisma.waitingList.findFirst({
    where: { id: entryId, tripId: id, agencyId: auth.agencyId },
  });

  if (!entry) {
    return NextResponse.json({ error: 'Entry tidak ditemukan' }, { status: 404 });
  }

  await prisma.waitingList.delete({
    where: { id: entryId },
  });

  return NextResponse.json({ success: true });
}
