import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { emailTemplateSchema } from '@/lib/validations/email-template';
import { logActivity } from '@/lib/activity-logger';
import { logger } from '@/lib/logger';

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const templates = await prisma.emailTemplate.findMany({
      where: { agencyId: auth.agencyId },
      orderBy: { event: 'asc' },
    });

    return NextResponse.json({ data: templates });
  } catch (error) {
    logger.error('[EMAIL_TEMPLATES_GET] error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const body = await req.json();
    const result = emailTemplateSchema.safeParse(body);

    if (!result.success) {
      return NextResponse.json(
        { error: 'Validasi gagal', fields: result.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { event, subject, bodyHtml, isActive } = result.data;

    const template = await prisma.emailTemplate.upsert({
      where: {
        event_agencyId: {
          event,
          agencyId: auth.agencyId,
        },
      },
      create: {
        event,
        subject,
        bodyHtml,
        isActive,
        agencyId: auth.agencyId,
      },
      update: {
        subject,
        bodyHtml,
        isActive,
      },
    });

    logActivity({
      type: 'settings',
      action: 'created',
      title: 'Email template dibuat',
      description: `Email template ${event} dibuat/diperbarui`,
      userId: auth.userId,
      agencyId: auth.agencyId,
      metadata: { entityId: template.id },
    });

    return NextResponse.json(template);
  } catch (error) {
    logger.error('[EMAIL_TEMPLATES_POST] error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
