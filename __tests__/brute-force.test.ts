import { describe, it, expect, beforeEach } from 'vitest';
import {
  checkBruteForce,
  recordFailedAttempt,
  recordSuccessfulLogin,
  _resetBruteForceForTesting,
} from '../src/lib/brute-force';

describe('Brute Force Protection', () => {
  beforeEach(() => {
    _resetBruteForceForTesting();
  });

  describe('checkBruteForce', () => {
    it('should allow first attempt', () => {
      const result = checkBruteForce('test@email.com');
      expect(result.allowed).toBe(true);
      expect(result.failedAttempts).toBe(0);
      expect(result.remainingAttempts).toBe(5);
    });

    it('should allow after successful login', () => {
      recordFailedAttempt('test@email.com');
      recordFailedAttempt('test@email.com');
      recordSuccessfulLogin('test@email.com');

      const result = checkBruteForce('test@email.com');
      expect(result.allowed).toBe(true);
      expect(result.failedAttempts).toBe(0);
    });
  });

  describe('recordFailedAttempt', () => {
    it('should track failed attempts', () => {
      recordFailedAttempt('test@email.com');
      const result = recordFailedAttempt('test@email.com');

      expect(result.failedAttempts).toBe(2);
      expect(result.remainingAttempts).toBe(3);
    });

    it('should lock out after 5 failed attempts', () => {
      for (let i = 0; i < 4; i++) {
        const r = recordFailedAttempt('lockout@test.com');
        expect(r.allowed).toBe(true);
      }

      // 5th attempt should trigger lockout
      const result = recordFailedAttempt('lockout@test.com');
      expect(result.allowed).toBe(false);
      expect(result.retryAfter).toBeGreaterThan(0);
      expect(result.remainingAttempts).toBe(0);
    });

    it('should block attempts during lockout', () => {
      for (let i = 0; i < 5; i++) {
        recordFailedAttempt('locked@test.com');
      }

      const check = checkBruteForce('locked@test.com');
      expect(check.allowed).toBe(false);
      expect(check.retryAfter).toBeGreaterThan(0);
    });

    it('should apply lockout around 15 minutes', () => {
      for (let i = 0; i < 5; i++) {
        recordFailedAttempt('timer@test.com');
      }

      const check = checkBruteForce('timer@test.com');
      // retryAfter should be around 900 seconds (15 minutes)
      expect(check.retryAfter).toBeGreaterThan(800);
      expect(check.retryAfter).toBeLessThanOrEqual(900);
    });
  });

  describe('recordSuccessfulLogin', () => {
    it('should reset failed attempts', () => {
      recordFailedAttempt('success@test.com');
      recordFailedAttempt('success@test.com');
      recordFailedAttempt('success@test.com');

      recordSuccessfulLogin('success@test.com');

      const check = checkBruteForce('success@test.com');
      expect(check.allowed).toBe(true);
      expect(check.failedAttempts).toBe(0);
      expect(check.remainingAttempts).toBe(5);
    });
  });

  describe('Isolation', () => {
    it('should track different identifiers independently', () => {
      for (let i = 0; i < 5; i++) {
        recordFailedAttempt('user-a@test.com');
      }

      const checkA = checkBruteForce('user-a@test.com');
      const checkB = checkBruteForce('user-b@test.com');

      expect(checkA.allowed).toBe(false);
      expect(checkB.allowed).toBe(true);
    });

    it('should separate agent, cc, and pilgrim namespaces', () => {
      for (let i = 0; i < 5; i++) {
        recordFailedAttempt('agent:admin@test.com');
      }

      const agentCheck = checkBruteForce('agent:admin@test.com');
      const ccCheck = checkBruteForce('cc:admin@test.com');

      expect(agentCheck.allowed).toBe(false);
      expect(ccCheck.allowed).toBe(true);
    });
  });
});
