import { describe, it, expect, beforeEach } from 'vitest';
import {
  registerCircuitBreaker,
  withCircuitBreaker,
  getCircuitBreakerStatus,
  isCircuitOpen,
} from '@/lib/circuit-breaker';

describe('Circuit Breaker', () => {
  beforeEach(() => {
    // Re-register to reset state
    registerCircuitBreaker({
      name: 'test-service',
      failureThreshold: 3,
      resetTimeout: 100, // 100ms for fast tests
      successThreshold: 2,
    });
  });

  it('starts in closed state', () => {
    const status = getCircuitBreakerStatus('test-service');
    expect(status?.state).toBe('closed');
    expect(isCircuitOpen('test-service')).toBe(false);
  });

  it('opens after reaching failure threshold', async () => {
    for (let i = 0; i < 3; i++) {
      try {
        await withCircuitBreaker('test-service', async () => {
          throw new Error('fail');
        });
      } catch { /* expected */ }
    }

    expect(isCircuitOpen('test-service')).toBe(true);
    const status = getCircuitBreakerStatus('test-service');
    expect(status?.state).toBe('open');
  });

  it('rejects calls when open', async () => {
    // Trigger circuit open
    for (let i = 0; i < 3; i++) {
      try {
        await withCircuitBreaker('test-service', async () => {
          throw new Error('fail');
        });
      } catch { /* expected */ }
    }

    await expect(
      withCircuitBreaker('test-service', async () => 'result')
    ).rejects.toThrow('Circuit breaker');
  });

  it('transitions to half-open after reset timeout', async () => {
    // Trigger circuit open
    for (let i = 0; i < 3; i++) {
      try {
        await withCircuitBreaker('test-service', async () => {
          throw new Error('fail');
        });
      } catch { /* expected */ }
    }

    // Wait for reset timeout
    await new Promise(resolve => setTimeout(resolve, 150));

    expect(isCircuitOpen('test-service')).toBe(false);
  });

  it('closes after success threshold in half-open state', async () => {
    // Trigger circuit open
    for (let i = 0; i < 3; i++) {
      try {
        await withCircuitBreaker('test-service', async () => {
          throw new Error('fail');
        });
      } catch { /* expected */ }
    }

    // Wait for reset timeout
    await new Promise(resolve => setTimeout(resolve, 150));

    // Succeed enough times
    await withCircuitBreaker('test-service', async () => 'ok');
    await withCircuitBreaker('test-service', async () => 'ok');

    const status = getCircuitBreakerStatus('test-service');
    expect(status?.state).toBe('closed');
  });

  it('returns null for unknown circuit breaker', () => {
    expect(getCircuitBreakerStatus('unknown')).toBeNull();
    expect(isCircuitOpen('unknown')).toBe(false);
  });

  it('successful calls do not affect closed state', async () => {
    const result = await withCircuitBreaker('test-service', async () => 42);
    expect(result).toBe(42);

    const status = getCircuitBreakerStatus('test-service');
    expect(status?.state).toBe('closed');
    expect(status?.failures).toBe(0);
  });
});
