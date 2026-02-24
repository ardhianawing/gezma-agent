import { describe, it, expect } from 'vitest';
import { leaderboardQuerySchema, historyQuerySchema } from '@/lib/validations/gamification';

describe('leaderboardQuerySchema', () => {
  it('accepts empty object (all optional)', () => {
    const result = leaderboardQuerySchema.safeParse({});
    expect(result.success).toBe(true);
  });

  it('accepts valid month and year', () => {
    const result = leaderboardQuerySchema.safeParse({ month: 6, year: 2026 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.month).toBe(6);
      expect(result.data.year).toBe(2026);
    }
  });

  it('coerces string month to number', () => {
    const result = leaderboardQuerySchema.safeParse({ month: '3' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.month).toBe(3);
    }
  });

  it('rejects month < 1', () => {
    const result = leaderboardQuerySchema.safeParse({ month: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects month > 12', () => {
    const result = leaderboardQuerySchema.safeParse({ month: 13 });
    expect(result.success).toBe(false);
  });

  it('rejects year < 2024', () => {
    const result = leaderboardQuerySchema.safeParse({ year: 2023 });
    expect(result.success).toBe(false);
  });

  it('rejects year > 2030', () => {
    const result = leaderboardQuerySchema.safeParse({ year: 2031 });
    expect(result.success).toBe(false);
  });
});

describe('historyQuerySchema', () => {
  it('uses defaults for empty object', () => {
    const result = historyQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.limit).toBe(20);
    }
  });

  it('accepts valid page and limit', () => {
    const result = historyQuerySchema.safeParse({ page: 3, limit: 50 });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(3);
      expect(result.data.limit).toBe(50);
    }
  });

  it('coerces string values', () => {
    const result = historyQuerySchema.safeParse({ page: '2', limit: '10' });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.limit).toBe(10);
    }
  });

  it('rejects page < 1', () => {
    const result = historyQuerySchema.safeParse({ page: 0 });
    expect(result.success).toBe(false);
  });

  it('rejects limit > 100', () => {
    const result = historyQuerySchema.safeParse({ limit: 101 });
    expect(result.success).toBe(false);
  });

  it('rejects limit < 1', () => {
    const result = historyQuerySchema.safeParse({ limit: 0 });
    expect(result.success).toBe(false);
  });
});
