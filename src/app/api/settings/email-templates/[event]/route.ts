import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { prisma } from '@/lib/prisma';
import { emailTemplateSchema } from '@/lib/validations/email-template';

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ event: string }> }
) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { event } = await params;

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
}

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ event: string }> }
) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { event } = await params;

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

  return NextResponse.json(updated);
}
