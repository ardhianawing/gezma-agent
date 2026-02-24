import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { emailTemplateSchema } from '@/lib/validations/email-template';

export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const templates = await prisma.emailTemplate.findMany({
    where: { agencyId: auth.agencyId },
    orderBy: { event: 'asc' },
  });

  return NextResponse.json({ data: templates });
}

export async function POST(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

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

  return NextResponse.json(template);
}
