import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { emailTemplateSchema } from '@/lib/validations/email-template';
import { logActivity } from '@/lib/activity-logger';
import { logger } from '@/lib/logger';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ event: string }> }
) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { event } = await params;

  try {
    const template = await prisma.emailTemplate.findUnique({
      where: {
        event_agencyId: {
          event,
          agencyId: auth.agencyId,
        },
      },
    });

    if (!template) {
      return NextResponse.json({ error: 'Template tidak ditemukan' }, { status: 404 });
    }

    return NextResponse.json(template);
  } catch (error) {
    logger.error('[EMAIL_TEMPLATE_EVENT_GET] error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ event: string }> }
) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { event } = await params;

  try {
    const body = await req.json();
    const partial = emailTemplateSchema.partial().safeParse(body);

    if (!partial.success) {
      return NextResponse.json(
        { error: 'Validasi gagal', fields: partial.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const existing = await prisma.emailTemplate.findUnique({
      where: {
        event_agencyId: {
          event,
          agencyId: auth.agencyId,
        },
      },
    });

    if (!existing) {
      return NextResponse.json({ error: 'Template tidak ditemukan' }, { status: 404 });
    }

    const updated = await prisma.emailTemplate.update({
      where: { id: existing.id },
      data: {
        ...(partial.data.subject !== undefined && { subject: partial.data.subject }),
        ...(partial.data.bodyHtml !== undefined && { bodyHtml: partial.data.bodyHtml }),
        ...(partial.data.isActive !== undefined && { isActive: partial.data.isActive }),
      },
    });

    logActivity({
      type: 'settings',
      action: 'updated',
      title: 'Email template diperbarui',
      description: `Email template ${event} diperbarui`,
      userId: auth.userId,
      agencyId: auth.agencyId,
      metadata: { entityId: updated.id },
    });

    return NextResponse.json(updated);
  } catch (error) {
    logger.error('[EMAIL_TEMPLATE_EVENT_PATCH] error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
