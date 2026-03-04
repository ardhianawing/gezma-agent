/**
 * Brute-force protection with exponential backoff and account lockout.
 * In-memory store (same limitation as rate-limiter — single instance only).
 * For multi-instance, replace with Redis.
 */

interface LoginAttemptRecord {
  failedCount: number;
  lastFailedAt: number;
  lockedUntil: number | null;
}

const store = new Map<string, LoginAttemptRecord>();

/** Max consecutive failed attempts before lockout */
const MAX_ATTEMPTS = 5;

/** Base lockout duration in ms (15 minutes) */
const BASE_LOCKOUT_MS = 15 * 60 * 1000;

/** How long to remember failed attempts before resetting (1 hour) */
const ATTEMPT_WINDOW_MS = 60 * 60 * 1000;

/** Cleanup interval (10 minutes) */
const CLEANUP_INTERVAL = 10 * 60 * 1000;
let lastCleanup = Date.now();

function cleanup() {
  const now = Date.now();
  if (now - lastCleanup < CLEANUP_INTERVAL) return;
  lastCleanup = now;

  for (const [key, record] of store.entries()) {
    // Remove records that have been idle for more than the attempt window
    if (now - record.lastFailedAt > ATTEMPT_WINDOW_MS && !record.lockedUntil) {
      store.delete(key);
    }
    // Remove expired lockouts with no recent failures
    if (record.lockedUntil && record.lockedUntil < now && now - record.lastFailedAt > ATTEMPT_WINDOW_MS) {
      store.delete(key);
    }
  }
}

export interface BruteForceCheckResult {
  allowed: boolean;
  /** Seconds until lockout expires (0 if not locked) */
  retryAfter: number;
  /** Number of failed attempts so far */
  failedAttempts: number;
  /** Total attempts remaining before lockout */
  remainingAttempts: number;
}

/**
 * Check if a login attempt is allowed for the given identifier.
 * @param identifier - Unique key (email, IP, or combination)
 */
export function checkBruteForce(identifier: string): BruteForceCheckResult {
  cleanup();

  const now = Date.now();
  const record = store.get(identifier);

  if (!record) {
    return { allowed: true, retryAfter: 0, failedAttempts: 0, remainingAttempts: MAX_ATTEMPTS };
  }

  // Reset if the attempt window has passed since last failure
  if (now - record.lastFailedAt > ATTEMPT_WINDOW_MS) {
    store.delete(identifier);
    return { allowed: true, retryAfter: 0, failedAttempts: 0, remainingAttempts: MAX_ATTEMPTS };
  }

  // Check if currently locked out
  if (record.lockedUntil && now < record.lockedUntil) {
    const retryAfter = Math.ceil((record.lockedUntil - now) / 1000);
    return {
      allowed: false,
      retryAfter,
      failedAttempts: record.failedCount,
      remainingAttempts: 0,
    };
  }

  // Lockout has expired, allow but keep the count
  return {
    allowed: true,
    retryAfter: 0,
    failedAttempts: record.failedCount,
    remainingAttempts: Math.max(0, MAX_ATTEMPTS - record.failedCount),
  };
}

/**
 * Record a failed login attempt. Applies exponential backoff lockout.
 * @param identifier - Unique key (email, IP, or combination)
 */
export function recordFailedAttempt(identifier: string): BruteForceCheckResult {
  const now = Date.now();
  let record = store.get(identifier);

  if (!record || now - record.lastFailedAt > ATTEMPT_WINDOW_MS) {
    record = { failedCount: 0, lastFailedAt: now, lockedUntil: null };
  }

  record.failedCount++;
  record.lastFailedAt = now;

  // Apply lockout with exponential backoff after MAX_ATTEMPTS
  if (record.failedCount >= MAX_ATTEMPTS) {
    // Exponential: 15min, 30min, 60min, 120min...
    const multiplier = Math.pow(2, Math.floor((record.failedCount - MAX_ATTEMPTS) / MAX_ATTEMPTS));
    const lockoutDuration = BASE_LOCKOUT_MS * multiplier;
    // Cap at 2 hours
    const cappedDuration = Math.min(lockoutDuration, 2 * 60 * 60 * 1000);
    record.lockedUntil = now + cappedDuration;
  }

  store.set(identifier, record);

  const retryAfter = record.lockedUntil ? Math.ceil((record.lockedUntil - now) / 1000) : 0;

  return {
    allowed: !record.lockedUntil || now >= record.lockedUntil,
    retryAfter,
    failedAttempts: record.failedCount,
    remainingAttempts: Math.max(0, MAX_ATTEMPTS - record.failedCount),
  };
}

/**
 * Record a successful login. Resets the failed attempt counter.
 */
export function recordSuccessfulLogin(identifier: string): void {
  store.delete(identifier);
}

/** Reset store for testing purposes */
export function _resetBruteForceForTesting(): void {
  store.clear();
}
