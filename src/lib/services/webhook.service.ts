import crypto from 'crypto';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';
import { withCircuitBreaker, registerCircuitBreaker } from '@/lib/circuit-breaker';

// Register circuit breaker for webhook delivery
registerCircuitBreaker({ name: 'webhook-delivery', failureThreshold: 10, resetTimeout: 60_000, successThreshold: 3 });

/**
 * Validate that a webhook URL is not targeting internal/private networks (SSRF protection).
 */
function isPrivateUrl(url: string): boolean {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname;
    // Block private/internal IPs
    if (hostname === 'localhost' || hostname === '127.0.0.1' || hostname === '0.0.0.0') return true;
    if (hostname.startsWith('10.') || hostname.startsWith('192.168.') || hostname.startsWith('172.')) return true;
    if (hostname.endsWith('.internal') || hostname.endsWith('.local')) return true;
    // Block non-HTTPS
    if (parsed.protocol !== 'https:') return true;
    return false;
  } catch {
    return true;
  }
}

/** Supported webhook events */
export const WEBHOOK_EVENTS = [
  'pilgrim.created',
  'pilgrim.updated',
  'pilgrim.deleted',
  'payment.received',
  'payment.refunded',
  'trip.created',
  'trip.departed',
  'trip.completed',
  'package.created',
  'package.updated',
  'document.uploaded',
  'document.verified',
] as const;

export type WebhookEvent = typeof WEBHOOK_EVENTS[number];

/**
 * Sign a webhook payload with HMAC-SHA256.
 */
function signPayload(payload: string, secret: string): string {
  return crypto.createHmac('sha256', secret).update(payload).digest('hex');
}

/**
 * Dispatch a webhook event to all matching endpoints for an agency.
 * Fire-and-forget — does not block the caller.
 */
export async function dispatchWebhook(
  agencyId: string,
  event: WebhookEvent,
  data: Record<string, unknown>
): Promise<void> {
  try {
    const endpoints = await prisma.webhookEndpoint.findMany({
      where: {
        agencyId,
        isActive: true,
        events: { has: event },
      },
    });

    if (endpoints.length === 0) return;

    const payload = {
      event,
      timestamp: new Date().toISOString(),
      data,
    };

    const payloadStr = JSON.stringify(payload);

    // Deliver to each endpoint concurrently
    await Promise.allSettled(
      endpoints.map(endpoint => deliverWebhook(endpoint.id, endpoint.url, endpoint.secret, event, payloadStr))
    );
  } catch (error) {
    logger.error('Webhook dispatch error', { agencyId, event, error: String(error) });
  }
}

/**
 * Deliver a webhook to a single endpoint.
 */
async function deliverWebhook(
  endpointId: string,
  url: string,
  secret: string,
  event: string,
  payloadStr: string
): Promise<void> {
  // SSRF protection: block requests to private/internal URLs
  if (isPrivateUrl(url)) {
    logger.error('Webhook delivery blocked — private/internal URL', { endpointId, url });
    return;
  }

  const signature = signPayload(payloadStr, secret);

  try {
    const result = await withCircuitBreaker('webhook-delivery', async () => {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Webhook-Signature': signature,
          'X-Webhook-Event': event,
          'User-Agent': 'GezmaOne-Webhook/1.0',
        },
        body: payloadStr,
        signal: AbortSignal.timeout(10_000), // 10 second timeout
      });

      return {
        statusCode: response.status,
        success: response.ok,
        response: await response.text().catch(() => ''),
      };
    });

    // Log delivery
    await prisma.webhookDelivery.create({
      data: {
        endpointId,
        event,
        payload: JSON.parse(payloadStr),
        statusCode: result.statusCode,
        response: result.response.slice(0, 500),
        success: result.success,
      },
    }).catch(err => logger.error('Failed to log webhook delivery', { error: String(err) }));
  } catch (error) {
    // Log failed delivery
    await prisma.webhookDelivery.create({
      data: {
        endpointId,
        event,
        payload: JSON.parse(payloadStr),
        success: false,
        error: error instanceof Error ? error.message : String(error),
      },
    }).catch(err => logger.error('Failed to log webhook delivery error', { error: String(err) }));

    logger.error('Webhook delivery failed', { endpointId, event, error: String(error) });
  }
}

/**
 * Generate a random webhook secret.
 */
export function generateWebhookSecret(): string {
  return `whsec_${crypto.randomBytes(24).toString('hex')}`;
}
