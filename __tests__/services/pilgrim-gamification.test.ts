import { describe, it, expect } from 'vitest';
import {
  PILGRIM_POINT_RULES,
  PILGRIM_BADGE_DEFINITIONS,
  calculatePilgrimLevel,
} from '@/lib/services/pilgrim-gamification.service';

describe('calculatePilgrimLevel', () => {
  it('returns level 1 for 0 points', () => {
    expect(calculatePilgrimLevel(0)).toBe(1);
  });

  it('returns level 1 for 49 points', () => {
    expect(calculatePilgrimLevel(49)).toBe(1);
  });

  it('returns level 2 for 50 points', () => {
    expect(calculatePilgrimLevel(50)).toBe(2);
  });

  it('returns level 2 for 99 points', () => {
    expect(calculatePilgrimLevel(99)).toBe(2);
  });

  it('returns level 3 for 100 points', () => {
    expect(calculatePilgrimLevel(100)).toBe(3);
  });

  it('returns level 11 for 500 points', () => {
    expect(calculatePilgrimLevel(500)).toBe(11);
  });

  it('returns level 1 for negative points', () => {
    expect(calculatePilgrimLevel(-10)).toBe(1);
  });
});

describe('PILGRIM_POINT_RULES', () => {
  it('has complete_lesson rule', () => {
    expect(PILGRIM_POINT_RULES.complete_lesson).toBe(10);
  });

  it('has complete_course rule', () => {
    expect(PILGRIM_POINT_RULES.complete_course).toBe(50);
  });

  it('has daily_login rule', () => {
    expect(PILGRIM_POINT_RULES.daily_login).toBe(5);
  });

  it('has update_profile rule', () => {
    expect(PILGRIM_POINT_RULES.update_profile).toBe(15);
  });

  it('has upload_document rule', () => {
    expect(PILGRIM_POINT_RULES.upload_document).toBe(20);
  });

  it('has favorite_doa rule', () => {
    expect(PILGRIM_POINT_RULES.favorite_doa).toBe(5);
  });

  it('all point values are positive numbers', () => {
    for (const [, points] of Object.entries(PILGRIM_POINT_RULES)) {
      expect(points).toBeGreaterThan(0);
      expect(typeof points).toBe('number');
    }
  });
});

describe('PILGRIM_BADGE_DEFINITIONS', () => {
  it('has 6 badges defined', () => {
    expect(PILGRIM_BADGE_DEFINITIONS.length).toBe(6);
  });

  it('all badges have required fields', () => {
    for (const badge of PILGRIM_BADGE_DEFINITIONS) {
      expect(badge.key).toBeTruthy();
      expect(typeof badge.key).toBe('string');
      expect(badge.name).toBeTruthy();
      expect(typeof badge.name).toBe('string');
      expect(badge.description).toBeTruthy();
      expect(badge.icon).toBeTruthy();
      expect(badge.condition).toBeTruthy();
      expect(typeof badge.threshold).toBe('number');
      expect(badge.threshold).toBeGreaterThan(0);
    }
  });

  it('has unique badge keys', () => {
    const keys = PILGRIM_BADGE_DEFINITIONS.map(b => b.key);
    expect(new Set(keys).size).toBe(keys.length);
  });

  it('includes langkah_pertama badge', () => {
    const badge = PILGRIM_BADGE_DEFINITIONS.find(b => b.key === 'langkah_pertama');
    expect(badge).toBeDefined();
    expect(badge?.condition).toBe('first_login');
  });

  it('includes pelajar_rajin badge', () => {
    const badge = PILGRIM_BADGE_DEFINITIONS.find(b => b.key === 'pelajar_rajin');
    expect(badge).toBeDefined();
    expect(badge?.condition).toBe('lesson_count');
    expect(badge?.threshold).toBe(5);
  });

  it('includes hafiz_doa badge', () => {
    const badge = PILGRIM_BADGE_DEFINITIONS.find(b => b.key === 'hafiz_doa');
    expect(badge).toBeDefined();
    expect(badge?.condition).toBe('favorite_count');
    expect(badge?.threshold).toBe(10);
  });

  it('includes siap_berangkat badge', () => {
    const badge = PILGRIM_BADGE_DEFINITIONS.find(b => b.key === 'siap_berangkat');
    expect(badge).toBeDefined();
    expect(badge?.condition).toBe('all_docs_uploaded');
  });

  it('includes ilmu_mantap badge', () => {
    const badge = PILGRIM_BADGE_DEFINITIONS.find(b => b.key === 'ilmu_mantap');
    expect(badge).toBeDefined();
    expect(badge?.condition).toBe('course_count');
    expect(badge?.threshold).toBe(3);
  });

  it('includes profil_lengkap badge', () => {
    const badge = PILGRIM_BADGE_DEFINITIONS.find(b => b.key === 'profil_lengkap');
    expect(badge).toBeDefined();
    expect(badge?.condition).toBe('profile_complete');
  });
});
