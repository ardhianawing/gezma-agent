import { describe, it, expect } from 'vitest';
import {
  calculateLevel,
  POINT_RULES,
  BADGE_DEFINITIONS,
} from '@/lib/services/gamification.service';

describe('calculateLevel', () => {
  it('returns level 1 for 0 points', () => {
    expect(calculateLevel(0)).toBe(1);
  });

  it('returns level 1 for 99 points', () => {
    expect(calculateLevel(99)).toBe(1);
  });

  it('returns level 2 for 100 points', () => {
    expect(calculateLevel(100)).toBe(2);
  });

  it('returns level 2 for 199 points', () => {
    expect(calculateLevel(199)).toBe(2);
  });

  it('returns level 3 for 200 points', () => {
    expect(calculateLevel(200)).toBe(3);
  });

  it('returns level 6 for 500 points', () => {
    expect(calculateLevel(500)).toBe(6);
  });

  it('returns level 11 for 1000 points', () => {
    expect(calculateLevel(1000)).toBe(11);
  });

  it('returns level 1 for negative points', () => {
    expect(calculateLevel(-50)).toBe(1);
  });
});

describe('POINT_RULES', () => {
  it('has pilgrim rules', () => {
    expect(POINT_RULES.pilgrim).toBeDefined();
    expect(POINT_RULES.pilgrim.created).toBeGreaterThan(0);
    expect(POINT_RULES.pilgrim.lunas).toBeGreaterThan(0);
    expect(POINT_RULES.pilgrim.completed).toBeGreaterThan(0);
    expect(POINT_RULES.pilgrim.departed).toBeGreaterThan(0);
  });

  it('has package rules', () => {
    expect(POINT_RULES.package).toBeDefined();
    expect(POINT_RULES.package.created).toBeGreaterThan(0);
  });

  it('has trip rules', () => {
    expect(POINT_RULES.trip).toBeDefined();
    expect(POINT_RULES.trip.created).toBeGreaterThan(0);
  });

  it('has document rules', () => {
    expect(POINT_RULES.document).toBeDefined();
    expect(POINT_RULES.document.uploaded).toBeGreaterThan(0);
  });

  it('has payment rules', () => {
    expect(POINT_RULES.payment).toBeDefined();
    expect(POINT_RULES.payment.paid).toBeGreaterThan(0);
  });

  it('all point values are positive numbers', () => {
    for (const [, actions] of Object.entries(POINT_RULES)) {
      for (const [, points] of Object.entries(actions)) {
        expect(points).toBeGreaterThan(0);
        expect(typeof points).toBe('number');
      }
    }
  });
});

describe('BADGE_DEFINITIONS', () => {
  it('has at least 10 badges', () => {
    expect(BADGE_DEFINITIONS.length).toBeGreaterThanOrEqual(10);
  });

  it('all badges have required fields', () => {
    for (const badge of BADGE_DEFINITIONS) {
      expect(badge.key).toBeTruthy();
      expect(typeof badge.key).toBe('string');
      expect(badge.name).toBeTruthy();
      expect(typeof badge.name).toBe('string');
      expect(badge.emoji).toBeTruthy();
      expect(badge.condition).toBeTruthy();
      expect(typeof badge.threshold).toBe('number');
      expect(badge.threshold).toBeGreaterThan(0);
    }
  });

  it('has unique badge keys', () => {
    const keys = BADGE_DEFINITIONS.map((b) => b.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('covers all expected conditions', () => {
    const conditions = new Set(BADGE_DEFINITIONS.map((b) => b.condition));
    expect(conditions.has('pilgrim_count')).toBe(true);
    expect(conditions.has('trip_count')).toBe(true);
    expect(conditions.has('package_count')).toBe(true);
    expect(conditions.has('revenue')).toBe(true);
    expect(conditions.has('level')).toBe(true);
  });
});
