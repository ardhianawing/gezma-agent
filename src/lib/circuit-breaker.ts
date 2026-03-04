import { logger } from '@/lib/logger';

/**
 * Circuit Breaker Pattern for external API calls.
 * States: CLOSED (normal) → OPEN (blocking) → HALF_OPEN (testing)
 */

type CircuitState = 'closed' | 'open' | 'half_open';

interface CircuitBreakerConfig {
  /** Name for logging */
  name: string;
  /** Number of failures before opening the circuit */
  failureThreshold: number;
  /** Time in ms before trying again (half-open) */
  resetTimeout: number;
  /** Number of successes in half-open to close the circuit */
  successThreshold: number;
}

interface CircuitBreakerState {
  state: CircuitState;
  failureCount: number;
  successCount: number;
  lastFailureAt: number | null;
  openedAt: number | null;
}

const DEFAULT_CONFIG: Omit<CircuitBreakerConfig, 'name'> = {
  failureThreshold: 5,
  resetTimeout: 30_000, // 30 seconds
  successThreshold: 2,
};

const circuits = new Map<string, CircuitBreakerState>();
const configs = new Map<string, CircuitBreakerConfig>();

function getState(name: string): CircuitBreakerState {
  if (!circuits.has(name)) {
    circuits.set(name, {
      state: 'closed',
      failureCount: 0,
      successCount: 0,
      lastFailureAt: null,
      openedAt: null,
    });
  }
  return circuits.get(name)!;
}

function getConfig(name: string): CircuitBreakerConfig {
  return configs.get(name) || { name, ...DEFAULT_CONFIG };
}

/**
 * Register a circuit breaker with custom configuration.
 */
export function registerCircuitBreaker(config: Partial<CircuitBreakerConfig> & { name: string }): void {
  configs.set(config.name, { ...DEFAULT_CONFIG, ...config });
}

/**
 * Check if a circuit is allowing requests.
 */
export function isCircuitOpen(name: string): boolean {
  const state = getState(name);
  const config = getConfig(name);

  if (state.state === 'closed') return false;

  if (state.state === 'open') {
    // Check if reset timeout has passed → transition to half-open
    if (state.openedAt && Date.now() - state.openedAt >= config.resetTimeout) {
      state.state = 'half_open';
      state.successCount = 0;
      logger.info(`Circuit breaker [${name}] transitioning to HALF_OPEN`);
      return false; // Allow the test request
    }
    return true; // Still open, block requests
  }

  // half_open: allow requests through
  return false;
}

/**
 * Record a successful call.
 */
export function recordSuccess(name: string): void {
  const state = getState(name);
  const config = getConfig(name);

  if (state.state === 'half_open') {
    state.successCount++;
    if (state.successCount >= config.successThreshold) {
      state.state = 'closed';
      state.failureCount = 0;
      state.successCount = 0;
      state.openedAt = null;
      state.lastFailureAt = null;
      logger.info(`Circuit breaker [${name}] CLOSED (recovered)`);
    }
  } else if (state.state === 'closed') {
    // Reset failure count on success
    state.failureCount = 0;
  }
}

/**
 * Record a failed call.
 */
export function recordFailure(name: string): void {
  const state = getState(name);
  const config = getConfig(name);

  state.failureCount++;
  state.lastFailureAt = Date.now();

  if (state.state === 'half_open') {
    // Any failure in half-open → back to open
    state.state = 'open';
    state.openedAt = Date.now();
    logger.warn(`Circuit breaker [${name}] OPEN again (half-open test failed)`);
  } else if (state.state === 'closed' && state.failureCount >= config.failureThreshold) {
    state.state = 'open';
    state.openedAt = Date.now();
    logger.warn(`Circuit breaker [${name}] OPEN (${state.failureCount} failures)`);
  }
}

/**
 * Execute a function with circuit breaker protection.
 * Throws CircuitOpenError if the circuit is open.
 */
export async function withCircuitBreaker<T>(
  name: string,
  fn: () => Promise<T>,
  fallback?: () => T
): Promise<T> {
  if (isCircuitOpen(name)) {
    logger.warn(`Circuit breaker [${name}] is OPEN — request blocked`);
    if (fallback) return fallback();
    throw new CircuitOpenError(name);
  }

  try {
    const result = await fn();
    recordSuccess(name);
    return result;
  } catch (error) {
    recordFailure(name);
    throw error;
  }
}

/**
 * Get the current status of all circuit breakers.
 */
export function getCircuitBreakerStatus(): Record<string, { state: CircuitState; failureCount: number; lastFailureAt: number | null }> {
  const status: Record<string, { state: CircuitState; failureCount: number; lastFailureAt: number | null }> = {};
  for (const [name, s] of circuits.entries()) {
    // Refresh state check
    isCircuitOpen(name);
    const current = circuits.get(name)!;
    status[name] = {
      state: current.state,
      failureCount: current.failureCount,
      lastFailureAt: current.lastFailureAt,
    };
  }
  return status;
}

export class CircuitOpenError extends Error {
  constructor(circuitName: string) {
    super(`Circuit breaker [${circuitName}] is open — service unavailable`);
    this.name = 'CircuitOpenError';
  }
}

/** Reset for testing */
export function _resetCircuitBreakersForTesting(): void {
  circuits.clear();
  configs.clear();
}
