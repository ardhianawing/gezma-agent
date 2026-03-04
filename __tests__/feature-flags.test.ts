import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: {
    featureFlag: {
      findMany: vi.fn(),
    },
  },
}));

vi.mock('@/lib/logger', () => ({
  logger: { error: vi.fn(), info: vi.fn(), warn: vi.fn() },
}));

import { isFeatureEnabled, getAllFlags, invalidateFlagCache } from '@/lib/feature-flags';
import { prisma } from '@/lib/prisma';

const mockFindMany = vi.mocked(prisma.featureFlag.findMany);

describe('Feature Flags', () => {
  beforeEach(() => {
    invalidateFlagCache();
    vi.clearAllMocks();
  });

  it('returns false for non-existent flag', async () => {
    mockFindMany.mockResolvedValue([]);

    const result = await isFeatureEnabled('nonexistent');
    expect(result).toBe(false);
  });

  it('returns global isEnabled when no agency override', async () => {
    mockFindMany.mockResolvedValue([
      { id: '1', key: 'gezmapay', name: 'GezMaPay', description: null, isEnabled: true, agencyOverrides: {}, createdBy: null, createdAt: new Date(), updatedAt: new Date() },
    ] as any);

    const result = await isFeatureEnabled('gezmapay');
    expect(result).toBe(true);
  });

  it('returns agency override when available', async () => {
    mockFindMany.mockResolvedValue([
      { id: '1', key: 'blockchain', name: 'Blockchain', description: null, isEnabled: false, agencyOverrides: { 'agency-1': true }, createdBy: null, createdAt: new Date(), updatedAt: new Date() },
    ] as any);

    const result = await isFeatureEnabled('blockchain', 'agency-1');
    expect(result).toBe(true);
  });

  it('falls back to global when agency has no override', async () => {
    mockFindMany.mockResolvedValue([
      { id: '1', key: 'blockchain', name: 'Blockchain', description: null, isEnabled: false, agencyOverrides: { 'agency-1': true }, createdBy: null, createdAt: new Date(), updatedAt: new Date() },
    ] as any);

    const result = await isFeatureEnabled('blockchain', 'agency-2');
    expect(result).toBe(false);
  });

  it('caches flags after first load', async () => {
    mockFindMany.mockResolvedValue([
      { id: '1', key: 'test', name: 'Test', description: null, isEnabled: true, agencyOverrides: {}, createdBy: null, createdAt: new Date(), updatedAt: new Date() },
    ] as any);

    await isFeatureEnabled('test');
    await isFeatureEnabled('test');

    expect(mockFindMany).toHaveBeenCalledTimes(1);
  });

  it('reloads after cache invalidation', async () => {
    mockFindMany.mockResolvedValue([
      { id: '1', key: 'test', name: 'Test', description: null, isEnabled: true, agencyOverrides: {}, createdBy: null, createdAt: new Date(), updatedAt: new Date() },
    ] as any);

    await isFeatureEnabled('test');
    invalidateFlagCache();
    await isFeatureEnabled('test');

    expect(mockFindMany).toHaveBeenCalledTimes(2);
  });

  it('getAllFlags returns all flags with agency resolution', async () => {
    mockFindMany.mockResolvedValue([
      { id: '1', key: 'feature_a', name: 'A', description: null, isEnabled: true, agencyOverrides: { 'ag1': false }, createdBy: null, createdAt: new Date(), updatedAt: new Date() },
      { id: '2', key: 'feature_b', name: 'B', description: null, isEnabled: false, agencyOverrides: {}, createdBy: null, createdAt: new Date(), updatedAt: new Date() },
    ] as any);

    const flags = await getAllFlags('ag1');
    expect(flags).toEqual([
      { key: 'feature_a', enabled: false }, // overridden to false for ag1
      { key: 'feature_b', enabled: false },
    ]);
  });

  it('getAllFlags without agency returns global values', async () => {
    mockFindMany.mockResolvedValue([
      { id: '1', key: 'feature_a', name: 'A', description: null, isEnabled: true, agencyOverrides: { 'ag1': false }, createdBy: null, createdAt: new Date(), updatedAt: new Date() },
    ] as any);

    const flags = await getAllFlags();
    expect(flags).toEqual([
      { key: 'feature_a', enabled: true }, // global value, not override
    ]);
  });
});
