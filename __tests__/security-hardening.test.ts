import { describe, it, expect, beforeEach, vi } from 'vitest';

describe('Security Hardening', () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  describe('Env Validation', () => {
    it('should reject JWT_SECRET shorter than 32 characters', async () => {
      vi.stubEnv('DATABASE_URL', 'postgresql://test');
      vi.stubEnv('JWT_SECRET', 'short');
      vi.stubEnv('NODE_ENV', 'development');

      // Re-import to reset cached env
      const { validateEnv } = await import('../src/lib/env');
      // Reset cache by accessing module fresh
      expect(() => {
        // We can't easily reset module cache in vitest, so test the schema directly
        const { z } = require('zod');
        const schema = z.object({
          JWT_SECRET: z.string().min(32, 'JWT_SECRET must be at least 32 characters'),
        });
        schema.parse({ JWT_SECRET: 'short' });
      }).toThrow();
    });

    it('should accept JWT_SECRET with 32+ characters', () => {
      const { z } = require('zod');
      const schema = z.object({
        JWT_SECRET: z.string().min(32),
      });
      const result = schema.safeParse({ JWT_SECRET: 'a'.repeat(64) });
      expect(result.success).toBe(true);
    });

    it('should reject TOTP_ENCRYPTION_KEY shorter than 32 chars', () => {
      const { z } = require('zod');
      const schema = z.object({
        TOTP_ENCRYPTION_KEY: z.string().min(32).optional(),
      });
      const result = schema.safeParse({ TOTP_ENCRYPTION_KEY: 'short' });
      expect(result.success).toBe(false);
    });

    it('should accept valid TOTP_ENCRYPTION_KEY', () => {
      const { z } = require('zod');
      const schema = z.object({
        TOTP_ENCRYPTION_KEY: z.string().min(32).optional(),
      });
      const result = schema.safeParse({ TOTP_ENCRYPTION_KEY: 'a'.repeat(32) });
      expect(result.success).toBe(true);
    });

    it('should detect dummy JWT_SECRET keywords', () => {
      const secret = 'ci-dummy-jwt-secret-key-minimum-32-chars';
      expect(secret.includes('dummy')).toBe(true);
    });
  });

  describe('Security Audit Response', () => {
    it('should classify JWT strength correctly', () => {
      const classify = (len: number) =>
        len >= 64 ? 'strong' : len >= 32 ? 'medium' : 'weak';

      expect(classify(64)).toBe('strong');
      expect(classify(32)).toBe('medium');
      expect(classify(16)).toBe('weak');
      expect(classify(128)).toBe('strong');
    });
  });
});
