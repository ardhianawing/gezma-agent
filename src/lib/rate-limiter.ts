import { NextRequest } from 'next/server';

// Module-level store: key = "ip:route", value = array of timestamps
const requestStore = new Map<string, number[]>();

// Clean up interval: every 5 minutes, remove entries with no recent timestamps
const CLEANUP_INTERVAL = 5 * 60 * 1000;
let lastCleanup = Date.now();

function cleanupOldEntries(windowMs: number) {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  for (const [key, timestamps] of requestStore.entries()) {
    const filtered = timestamps.filter((t) => now - t < windowMs);
    if (filtered.length === 0) {
      requestStore.delete(key);
    } else {
      requestStore.set(key, filtered);
    }
  }
}

export interface RateLimitOptions {
  /** Maximum number of requests allowed in the window */
  limit: number;
  /** Window size in seconds */
  window: number;
}

export interface RateLimitResult {
  allowed: boolean;
  remaining: number;
}

/**
 * Sliding window rate limiter (in-memory).
 * Key is derived from client IP + request pathname.
 */
export function rateLimit(
  req: NextRequest,
  options: RateLimitOptions
): RateLimitResult {
  const { limit, window: windowSec } = options;
  const windowMs = windowSec * 1000;
  const now = Date.now();

  // Derive IP
  const ip =
    req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    req.headers.get('x-real-ip') ||
    'unknown';

  // Derive route from pathname
  const route = new URL(req.url).pathname;
  const key = `${ip}:${route}`;

  // Cleanup periodically
  cleanupOldEntries(windowMs);

  // Get existing timestamps and filter to current window
  const timestamps = (requestStore.get(key) || []).filter(
    (t) => now - t < windowMs
  );

  if (timestamps.length >= limit) {
    requestStore.set(key, timestamps);
    return { allowed: false, remaining: 0 };
  }

  // Record this request
  timestamps.push(now);
  requestStore.set(key, timestamps);

  return { allowed: true, remaining: limit - timestamps.length };
}

/** Reset store for testing purposes */
export function _resetForTesting() {
  requestStore.clear();
}
