import { describe, it, expect } from 'vitest';
import { changePasswordSchema, loginHistoryQuerySchema } from '@/lib/validations/security';

describe('changePasswordSchema', () => {
  it('validates correct data', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'oldPassword123',
      newPassword: 'newPassword456',
      confirmPassword: 'newPassword456',
    });
    expect(result.success).toBe(true);
  });

  it('rejects empty currentPassword', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: '',
      newPassword: 'newPassword456',
      confirmPassword: 'newPassword456',
    });
    expect(result.success).toBe(false);
  });

  it('rejects short newPassword', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'oldPassword',
      newPassword: '12345',
      confirmPassword: '12345',
    });
    expect(result.success).toBe(false);
  });

  it('rejects mismatched passwords', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'oldPassword',
      newPassword: 'newPassword456',
      confirmPassword: 'differentPassword',
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      const issues = result.error.issues;
      expect(issues.some(i => i.path.includes('confirmPassword'))).toBe(true);
    }
  });

  it('rejects passwords shorter than 8 chars', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'old123',
      newPassword: '1234567',
      confirmPassword: '1234567',
    });
    expect(result.success).toBe(false);
  });

  it('accepts minimum 8 char newPassword', () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: 'old123',
      newPassword: '12345678',
      confirmPassword: '12345678',
    });
    expect(result.success).toBe(true);
  });

  it('rejects missing fields', () => {
    const result = changePasswordSchema.safeParse({});
    expect(result.success).toBe(false);
  });
});

describe('loginHistoryQuerySchema', () => {
  it('validates default values', () => {
    const result = loginHistoryQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it('accepts valid page and limit', () => {
    const result = loginHistoryQuerySchema.safeParse({ page: 3, limit: 50 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(50);
    }
  });

  it('coerces string numbers', () => {
    const result = loginHistoryQuerySchema.safeParse({ page: '2', limit: '10' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(10);
    }
  });

  it('rejects page less than 1', () => {
    const result = loginHistoryQuerySchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects limit greater than 100', () => {
    const result = loginHistoryQuerySchema.safeParse({ limit: 101 });
    expect(result.success).toBe(false);
  });
});
