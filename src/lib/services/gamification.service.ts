import { prisma } from '@/lib/prisma';

// === POINT RULES ===
export const POINT_RULES: Record<string, Record<string, number>> = {
  pilgrim: {
    created: 10,
    lunas: 25,
    completed: 50,
    departed: 30,
  },
  package: {
    created: 15,
  },
  trip: {
    created: 20,
  },
  document: {
    uploaded: 5,
  },
  payment: {
    paid: 10,
  },
};

// === BADGE DEFINITIONS ===
export const BADGE_DEFINITIONS = [
  { key: 'first_pilgrim', name: 'Jemaah Pertama', emoji: '\u{1F464}', condition: 'pilgrim_count', threshold: 1 },
  { key: 'pilgrim_10', name: '10 Jemaah', emoji: '\u{1F465}', condition: 'pilgrim_count', threshold: 10 },
  { key: 'pilgrim_50', name: '50 Jemaah', emoji: '\u{1F3C5}', condition: 'pilgrim_count', threshold: 50 },
  { key: 'pilgrim_100', name: '100 Jemaah', emoji: '\u{1F3C6}', condition: 'pilgrim_count', threshold: 100 },
  { key: 'first_trip', name: 'Trip Pertama', emoji: '\u{2708}\u{FE0F}', condition: 'trip_count', threshold: 1 },
  { key: 'trip_master', name: 'Trip Master', emoji: '\u{1F30D}', condition: 'trip_count', threshold: 10 },
  { key: 'first_package', name: 'Paket Pertama', emoji: '\u{1F4E6}', condition: 'package_count', threshold: 1 },
  { key: 'revenue_10m', name: 'Revenue 10 Juta', emoji: '\u{1F4B0}', condition: 'revenue', threshold: 10_000_000 },
  { key: 'revenue_100m', name: 'Revenue 100 Juta', emoji: '\u{1F48E}', condition: 'revenue', threshold: 100_000_000 },
  { key: 'level_5', name: 'Level 5', emoji: '\u{2B50}', condition: 'level', threshold: 5 },
  { key: 'level_10', name: 'Level 10', emoji: '\u{1F31F}', condition: 'level', threshold: 10 },
] as const;

export type BadgeKey = typeof BADGE_DEFINITIONS[number]['key'];

// === LEVEL CALCULATION ===
export function calculateLevel(totalPoints: number): number {
  return Math.max(1, Math.floor(totalPoints / 100) + 1);
}

// === AWARD POINTS ===
export async function awardPoints(
  userId: string,
  agencyId: string,
  type: string,
  action: string,
  description: string,
) {
  const points = POINT_RULES[type]?.[action];
  if (!points) return;

  try {
    // Create point event
    await prisma.pointEvent.create({
      data: { type, action, points, description, userId, agencyId },
    });

    // Update user total + level
    const user = await prisma.user.update({
      where: { id: userId },
      data: {
        totalPoints: { increment: points },
      },
    });
    const newLevel = calculateLevel(user.totalPoints);
    if (newLevel !== user.level) {
      await prisma.user.update({
        where: { id: userId },
        data: { level: newLevel },
      });
    }

    // Update agency total
    await prisma.agency.update({
      where: { id: agencyId },
      data: { totalPoints: { increment: points } },
    });

    // Update leaderboard (current month)
    const now = new Date();
    const month = now.getMonth() + 1;
    const year = now.getFullYear();

    await prisma.agencyLeaderboard.upsert({
      where: { agencyId_month_year: { agencyId, month, year } },
      create: { agencyId, month, year, totalPoints: points, pilgrimCount: type === 'pilgrim' && action === 'created' ? 1 : 0, level: 1 },
      update: {
        totalPoints: { increment: points },
        ...(type === 'pilgrim' && action === 'created' ? { pilgrimCount: { increment: 1 } } : {}),
      },
    });

    // Check badges (fire and forget)
    checkAndAwardBadges(userId, agencyId).catch(() => {});
  } catch (err) {
    console.error('awardPoints error:', err);
  }
}

// === CHECK & AWARD BADGES ===
export async function checkAndAwardBadges(userId: string, agencyId: string) {
  const [user, existingBadges, pilgrimCount, tripCount, packageCount, totalRevenue] = await Promise.all([
    prisma.user.findUnique({ where: { id: userId }, select: { totalPoints: true, level: true } }),
    prisma.userBadge.findMany({ where: { userId }, select: { badgeKey: true } }),
    prisma.pilgrim.count({ where: { agencyId } }),
    prisma.trip.count({ where: { agencyId } }),
    prisma.package.count({ where: { agencyId } }),
    prisma.paymentRecord.aggregate({
      where: { pilgrim: { agencyId } },
      _sum: { amount: true },
    }),
  ]);

  if (!user) return;

  const unlockedKeys = new Set(existingBadges.map(b => b.badgeKey));
  const revenue = totalRevenue._sum.amount || 0;
  const level = user.level;

  const conditionValues: Record<string, number> = {
    pilgrim_count: pilgrimCount,
    trip_count: tripCount,
    package_count: packageCount,
    revenue,
    level,
  };

  const newBadges: { userId: string; badgeKey: string }[] = [];

  for (const badge of BADGE_DEFINITIONS) {
    if (unlockedKeys.has(badge.key)) continue;
    const value = conditionValues[badge.condition] ?? 0;
    if (value >= badge.threshold) {
      newBadges.push({ userId, badgeKey: badge.key });
    }
  }

  if (newBadges.length > 0) {
    await prisma.userBadge.createMany({ data: newBadges, skipDuplicates: true });
  }
}

// === GET LEADERBOARD ===
export async function getLeaderboard(month?: number, year?: number) {
  const now = new Date();
  const m = month ?? now.getMonth() + 1;
  const y = year ?? now.getFullYear();

  return prisma.agencyLeaderboard.findMany({
    where: { month: m, year: y },
    orderBy: { totalPoints: 'desc' },
    take: 10,
    include: {
      agency: { select: { name: true, logoUrl: true } },
    },
  });
}
