import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getCCAuthPayload, ccUnauthorizedResponse } from '@/lib/auth-command-center';
import { createServiceSchema, createDocumentSchema } from '@/lib/validations/services';
import { logger } from '@/lib/logger';

// GET — list all services and documents (for CC management)
export async function GET(req: NextRequest) {
  const auth = getCCAuthPayload(req);
  if (!auth) return ccUnauthorizedResponse();

  try {
    const [services, documents] = await Promise.all([
      prisma.platformService.findMany({ orderBy: { order: 'asc' } }),
      prisma.platformDocument.findMany({ orderBy: { createdAt: 'desc' } }),
    ]);

    return NextResponse.json({ services, documents });
  } catch (error) {
    logger.error('GET /api/command-center/services error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

// POST — create a service or document
export async function POST(req: NextRequest) {
  const auth = getCCAuthPayload(req);
  if (!auth) return ccUnauthorizedResponse();

  try {
    const body = await req.json();
    const { type, ...data } = body;

    if (type === 'document') {
      const parsed = createDocumentSchema.safeParse(data);
      if (!parsed.success) {
        return NextResponse.json({ error: 'Validasi gagal', details: parsed.error.issues }, { status: 400 });
      }
      const doc = await prisma.platformDocument.create({ data: parsed.data });
      return NextResponse.json(doc, { status: 201 });
    }

    // Default: create service
    const parsed = createServiceSchema.safeParse(data);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Validasi gagal', details: parsed.error.issues }, { status: 400 });
    }
    const service = await prisma.platformService.create({ data: parsed.data });
    return NextResponse.json(service, { status: 201 });
  } catch (error) {
    logger.error('POST /api/command-center/services error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
