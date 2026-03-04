import { NextRequest, NextResponse } from 'next/server';
import crypto from 'crypto';

/**
 * Server-side request deduplication.
 * Prevents duplicate mutations from rapid double-clicks or retries.
 * Uses Idempotency-Key header or generates key from request signature.
 */

interface PendingRequest {
  timestamp: number;
  response?: { status: number; body: unknown };
}

const pendingRequests = new Map<string, PendingRequest>();

/** Dedup window: reject identical requests within 5 seconds */
const DEDUP_WINDOW_MS = 5_000;

/** Cleanup interval: 2 minutes */
const CLEANUP_INTERVAL = 2 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  for (const [key, req] of pendingRequests.entries()) {
    if (now - req.timestamp > DEDUP_WINDOW_MS * 2) {
      pendingRequests.delete(key);
    }
  }
}

/**
 * Generate a deduplication key from the request.
 * Uses Idempotency-Key header if present, otherwise hashes method+path+body.
 */
function generateDedupKey(req: NextRequest, bodyHash: string): string {
  // Prefer explicit idempotency key
  const idempotencyKey = req.headers.get('idempotency-key') || req.headers.get('x-idempotency-key');
  if (idempotencyKey) return idempotencyKey;

  // Generate from request signature
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'unknown';
  const method = req.method;
  const path = new URL(req.url).pathname;

  return crypto.createHash('sha256').update(`${ip}:${method}:${path}:${bodyHash}`).digest('hex');
}

/**
 * Check if a request is a duplicate.
 * Call at the start of POST/PUT/PATCH/DELETE handlers.
 *
 * @returns null if request is allowed, or a 409 response if duplicate
 */
export function checkDuplicate(req: NextRequest, body?: unknown): NextResponse | null {
  cleanup();

  const bodyStr = body ? JSON.stringify(body) : '';
  const bodyHash = crypto.createHash('md5').update(bodyStr).digest('hex');
  const key = generateDedupKey(req, bodyHash);

  const existing = pendingRequests.get(key);
  if (existing && Date.now() - existing.timestamp < DEDUP_WINDOW_MS) {
    // If we have a cached response, return it
    if (existing.response) {
      return NextResponse.json(existing.response.body, { status: existing.response.status });
    }
    // Request is still in flight
    return NextResponse.json(
      { error: 'Permintaan duplikat terdeteksi. Silakan tunggu.' },
      { status: 409 }
    );
  }

  // Mark as pending
  pendingRequests.set(key, { timestamp: Date.now() });
  return null;
}

/**
 * Cache the response for a completed request (for idempotent replay).
 */
export function cacheResponse(req: NextRequest, body: unknown, status: number, requestBody?: unknown): void {
  const bodyStr = requestBody ? JSON.stringify(requestBody) : '';
  const bodyHash = crypto.createHash('md5').update(bodyStr).digest('hex');
  const key = generateDedupKey(req, bodyHash);

  const existing = pendingRequests.get(key);
  if (existing) {
    existing.response = { status, body };
  }
}

/** Reset for testing */
export function _resetDedupForTesting(): void {
  pendingRequests.clear();
}
