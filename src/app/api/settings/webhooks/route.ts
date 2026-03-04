import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { checkPermission } from '@/lib/auth-permissions';
import { PERMISSIONS } from '@/lib/permissions';
import { generateWebhookSecret, WEBHOOK_EVENTS } from '@/lib/services/webhook.service';
import { logger } from '@/lib/logger';
import { z } from 'zod';

const createWebhookSchema = z.object({
  url: z.string().url().startsWith('https', 'URL harus HTTPS'),
  events: z.array(z.string()).min(1, 'Pilih minimal 1 event'),
  description: z.string().max(200).optional(),
});

/**
 * GET /api/settings/webhooks — List webhooks for agency
 */
export async function GET(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  try {
    const webhooks = await prisma.webhookEndpoint.findMany({
      where: { agencyId: auth.agencyId },
      select: {
        id: true,
        url: true,
        events: true,
        isActive: true,
        description: true,
        createdAt: true,
        _count: { select: { deliveries: true } },
      },
      orderBy: { createdAt: 'desc' },
    });

    return NextResponse.json({ webhooks, availableEvents: WEBHOOK_EVENTS });
  } catch (error) {
    logger.error('GET /api/settings/webhooks error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

/**
 * POST /api/settings/webhooks — Create a new webhook endpoint
 */
export async function POST(req: NextRequest) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const denied = await checkPermission(auth, PERMISSIONS.SETTINGS_EDIT);
  if (denied) return denied;

  try {
    const body = await req.json();
    const parsed = createWebhookSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: 'Data tidak valid', details: parsed.error.flatten().fieldErrors }, { status: 400 });
    }

    const { url, events, description } = parsed.data;

    // Validate events
    const invalidEvents = events.filter(e => !WEBHOOK_EVENTS.includes(e as typeof WEBHOOK_EVENTS[number]));
    if (invalidEvents.length > 0) {
      return NextResponse.json({ error: `Event tidak valid: ${invalidEvents.join(', ')}` }, { status: 400 });
    }

    const secret = generateWebhookSecret();

    const webhook = await prisma.webhookEndpoint.create({
      data: {
        agencyId: auth.agencyId,
        url,
        secret,
        events,
        description,
      },
    });

    // Return secret only on creation (won't be shown again)
    return NextResponse.json({
      webhook: {
        id: webhook.id,
        url: webhook.url,
        events: webhook.events,
        isActive: webhook.isActive,
        description: webhook.description,
        secret, // Only shown once!
      },
    }, { status: 201 });
  } catch (error) {
    logger.error('POST /api/settings/webhooks error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
