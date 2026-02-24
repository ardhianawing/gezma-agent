import { describe, it, expect } from 'vitest';
import { ccLoginSchema, agencyStatusSchema } from '@/lib/validations/command-center';

describe('ccLoginSchema', () => {
  it('accepts valid login data', () => {
    const result = ccLoginSchema.safeParse({
      email: 'admin@gezma.id',
      password: 'secretpassword',
    });
    expect(result.success).toBe(true);
  });

  it('rejects invalid email', () => {
    const result = ccLoginSchema.safeParse({
      email: 'not-an-email',
      password: 'secretpassword',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty email', () => {
    const result = ccLoginSchema.safeParse({
      email: '',
      password: 'secretpassword',
    });
    expect(result.success).toBe(false);
  });

  it('rejects empty password', () => {
    const result = ccLoginSchema.safeParse({
      email: 'admin@gezma.id',
      password: '',
    });
    expect(result.success).toBe(false);
  });

  it('rejects missing fields', () => {
    const result = ccLoginSchema.safeParse({});
    expect(result.success).toBe(false);
  });

  it('rejects missing email', () => {
    const result = ccLoginSchema.safeParse({ password: 'test' });
    expect(result.success).toBe(false);
  });

  it('rejects missing password', () => {
    const result = ccLoginSchema.safeParse({ email: 'admin@gezma.id' });
    expect(result.success).toBe(false);
  });
});

describe('agencyStatusSchema', () => {
  it('accepts empty object (all optional)', () => {
    const result = agencyStatusSchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('accepts valid ppiuStatus', () => {
    const validStatuses = ['pending', 'active', 'expiring', 'expired', 'suspended'];
    for (const status of validStatuses) {
      const result = agencyStatusSchema.safeParse({ ppiuStatus: status });
      expect(result.success).toBe(true);
    }
  });

  it('rejects invalid ppiuStatus', () => {
    const result = agencyStatusSchema.safeParse({ ppiuStatus: 'invalid' });
    expect(result.success).toBe(false);
  });

  it('accepts boolean isVerified', () => {
    const result1 = agencyStatusSchema.safeParse({ isVerified: true });
    expect(result1.success).toBe(true);

    const result2 = agencyStatusSchema.safeParse({ isVerified: false });
    expect(result2.success).toBe(true);
  });

  it('accepts both fields together', () => {
    const result = agencyStatusSchema.safeParse({
      ppiuStatus: 'active',
      isVerified: true,
    });
    expect(result.success).toBe(true);
  });

  it('rejects non-boolean isVerified', () => {
    const result = agencyStatusSchema.safeParse({ isVerified: 'yes' });
    expect(result.success).toBe(false);
  });
});
