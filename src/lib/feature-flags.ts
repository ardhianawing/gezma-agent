import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

/**
 * Feature Flags System.
 * Supports global flags and per-agency overrides.
 * Uses in-memory cache with 60-second TTL to reduce DB queries.
 */

interface CachedFlags {
  flags: Map<string, { isEnabled: boolean; agencyOverrides: Record<string, boolean> }>;
  cachedAt: number;
}

let cache: CachedFlags | null = null;
const CACHE_TTL = 60_000; // 60 seconds

/**
 * Load all feature flags from the database.
 */
async function loadFlags(): Promise<Map<string, { isEnabled: boolean; agencyOverrides: Record<string, boolean> }>> {
  if (cache && Date.now() - cache.cachedAt < CACHE_TTL) {
    return cache.flags;
  }

  try {
    const flags = await prisma.featureFlag.findMany();
    const map = new Map<string, { isEnabled: boolean; agencyOverrides: Record<string, boolean> }>();

    for (const flag of flags) {
      map.set(flag.key, {
        isEnabled: flag.isEnabled,
        agencyOverrides: (flag.agencyOverrides as Record<string, boolean>) || {},
      });
    }

    cache = { flags: map, cachedAt: Date.now() };
    return map;
  } catch (error) {
    logger.error('Failed to load feature flags', { error: String(error) });
    // Return cached or empty on error
    return cache?.flags || new Map();
  }
}

/**
 * Check if a feature is enabled for a given agency.
 * @param key - Feature flag key (e.g., "gezmapay", "blockchain")
 * @param agencyId - Optional agency ID for per-agency overrides
 * @returns true if the feature is enabled
 */
export async function isFeatureEnabled(key: string, agencyId?: string): Promise<boolean> {
  const flags = await loadFlags();
  const flag = flags.get(key);

  if (!flag) {
    // Feature flag not found — disabled by default
    return false;
  }

  // Check agency-specific override first
  if (agencyId && agencyId in flag.agencyOverrides) {
    return flag.agencyOverrides[agencyId];
  }

  // Fall back to global setting
  return flag.isEnabled;
}

/**
 * Get all feature flags with their status for a specific agency.
 */
export async function getAllFlags(agencyId?: string): Promise<Array<{ key: string; enabled: boolean }>> {
  const flags = await loadFlags();
  const result: Array<{ key: string; enabled: boolean }> = [];

  for (const [key, flag] of flags.entries()) {
    const enabled = agencyId && agencyId in flag.agencyOverrides
      ? flag.agencyOverrides[agencyId]
      : flag.isEnabled;
    result.push({ key, enabled });
  }

  return result;
}

/**
 * Invalidate the cache (call after updating flags).
 */
export function invalidateFlagCache(): void {
  cache = null;
}

/** Predefined feature flag keys */
export const FEATURE_FLAGS = {
  GEZMAPAY: 'gezmapay',
  BLOCKCHAIN: 'blockchain',
  ACADEMY_QUIZ: 'academy_quiz',
  SAVINGS: 'umrah_savings',
  PAYLATER: 'paylater',
  REFERRAL: 'referral',
  SOS_BUTTON: 'sos_button',
  TRADE_CENTRE: 'trade_centre',
  ROOMMATE_MATCHING: 'roommate_matching',
} as const;
