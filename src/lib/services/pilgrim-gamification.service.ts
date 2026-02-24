import { prisma } from '@/lib/prisma';

// === POINT RULES ===
export const PILGRIM_POINT_RULES: Record<string, number> = {
  complete_lesson: 10,
  complete_course: 50,
  daily_login: 5,
  update_profile: 15,
  upload_document: 20,
  favorite_doa: 5,
};

// === BADGE DEFINITIONS ===
export const PILGRIM_BADGE_DEFINITIONS = [
  {
    key: 'langkah_pertama',
    name: 'Langkah Pertama',
    description: 'Login pertama kali ke portal jamaah',
    icon: '\u{1F31F}',
    condition: 'first_login',
    threshold: 1,
  },
  {
    key: 'pelajar_rajin',
    name: 'Pelajar Rajin',
    description: 'Menyelesaikan 5 pelajaran manasik',
    icon: '\u{1F4DA}',
    condition: 'lesson_count',
    threshold: 5,
  },
  {
    key: 'hafiz_doa',
    name: 'Hafiz Doa',
    description: 'Menyimpan 10 doa favorit',
    icon: '\u{1F932}',
    condition: 'favorite_count',
    threshold: 10,
  },
  {
    key: 'siap_berangkat',
    name: 'Siap Berangkat',
    description: 'Mengunggah semua dokumen yang diperlukan',
    icon: '\u{2708}\u{FE0F}',
    condition: 'all_docs_uploaded',
    threshold: 1,
  },
  {
    key: 'ilmu_mantap',
    name: 'Ilmu Mantap',
    description: 'Menyelesaikan 3 kursus manasik',
    icon: '\u{1F393}',
    condition: 'course_count',
    threshold: 3,
  },
  {
    key: 'profil_lengkap',
    name: 'Profil Lengkap',
    description: 'Melengkapi profil jamaah (semua data terisi)',
    icon: '\u{2705}',
    condition: 'profile_complete',
    threshold: 1,
  },
] as const;

export type PilgrimBadgeKey = typeof PILGRIM_BADGE_DEFINITIONS[number]['key'];

// === LEVEL CALCULATION ===
export function calculatePilgrimLevel(totalPoints: number): number {
  return Math.max(1, Math.floor(totalPoints / 50) + 1);
}

// === AWARD POINTS ===
export async function awardPilgrimPoints(
  pilgrimId: string,
  action: string,
  description: string,
  metadata?: Record<string, string | number | boolean | null>,
) {
  const points = PILGRIM_POINT_RULES[action];
  if (!points) return;

  try {
    await prisma.pilgrimPointEvent.create({
      data: {
        pilgrimId,
        action,
        points,
        description,
        metadata: metadata ?? undefined,
      },
    });

    // Check badges (fire and forget)
    checkAndAwardPilgrimBadges(pilgrimId).catch(() => {});
  } catch (err) {
    console.error('awardPilgrimPoints error:', err);
  }
}

// === CHECK & AWARD BADGES ===
export async function checkAndAwardPilgrimBadges(pilgrimId: string) {
  const [existingBadges, lessonCount, favoriteCount, docCount, totalRequiredDocs] = await Promise.all([
    prisma.pilgrimBadge.findMany({ where: { pilgrimId }, select: { badgeKey: true } }),
    prisma.pilgrimManasikProgress.count({ where: { pilgrimId } }),
    prisma.pilgrimDoaFavorite.count({ where: { pilgrimId } }),
    prisma.pilgrimDocument.count({ where: { pilgrimId, status: { in: ['uploaded', 'verified'] } } }),
    // Required docs: ktp, passport, photo (minimum 3)
    Promise.resolve(3),
  ]);

  const unlockedKeys = new Set(existingBadges.map(b => b.badgeKey));

  const conditionChecks: Record<string, boolean> = {
    first_login: true, // if they're here, they logged in
    lesson_count: lessonCount >= 5,
    favorite_count: favoriteCount >= 10,
    all_docs_uploaded: docCount >= totalRequiredDocs,
    course_count: false, // will be checked separately if needed
    profile_complete: false, // will be checked separately if needed
  };

  // Check profile completeness
  const pilgrim = await prisma.pilgrim.findUnique({
    where: { id: pilgrimId },
    select: { name: true, phone: true, email: true, address: true, nik: true, birthDate: true, gender: true },
  });
  if (pilgrim) {
    const fields = [pilgrim.name, pilgrim.phone, pilgrim.email, pilgrim.address, pilgrim.nik, pilgrim.birthDate, pilgrim.gender];
    conditionChecks.profile_complete = fields.every(f => f && String(f).trim().length > 0);
  }

  const newBadges: { pilgrimId: string; badgeKey: string; badgeName: string; badgeDescription: string; badgeIcon: string }[] = [];

  for (const badge of PILGRIM_BADGE_DEFINITIONS) {
    if (unlockedKeys.has(badge.key)) continue;
    const passed = conditionChecks[badge.condition] ?? false;
    if (passed) {
      newBadges.push({
        pilgrimId,
        badgeKey: badge.key,
        badgeName: badge.name,
        badgeDescription: badge.description,
        badgeIcon: badge.icon,
      });
    }
  }

  if (newBadges.length > 0) {
    await prisma.pilgrimBadge.createMany({ data: newBadges, skipDuplicates: true });
  }
}

// === GET STATS ===
export async function getPilgrimStats(pilgrimId: string) {
  const [pointEvents, badges] = await Promise.all([
    prisma.pilgrimPointEvent.findMany({
      where: { pilgrimId },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.pilgrimBadge.findMany({
      where: { pilgrimId },
      orderBy: { earnedAt: 'desc' },
    }),
  ]);

  const totalPoints = pointEvents.reduce((sum, e) => sum + e.points, 0);
  const level = calculatePilgrimLevel(totalPoints);
  const nextLevelPoints = level * 50;
  const pointsToNextLevel = Math.max(0, nextLevelPoints - totalPoints);

  return {
    totalPoints,
    level,
    nextLevelPoints,
    pointsToNextLevel,
    badgeCount: badges.length,
    badges,
    recentPoints: pointEvents.slice(0, 10),
  };
}
