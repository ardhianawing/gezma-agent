import { NextRequest, NextResponse } from 'next/server';
import { getPilgrimPayload } from '@/lib/auth-pilgrim';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  const auth = getPilgrimPayload(req);
  if (!auth) {
    return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
  }

  try {
    // Get current pilgrim's preference
    const myPref = await prisma.roommatePreference.findUnique({
      where: { pilgrimId: auth.pilgrimId },
    });

    if (!myPref) {
      return NextResponse.json(
        { error: 'Anda belum menyimpan preferensi teman sekamar.' },
        { status: 400 }
      );
    }

    // Find all other preferences in the same agency with the same gender (required match)
    const candidates = await prisma.roommatePreference.findMany({
      where: {
        agencyId: auth.agencyId,
        pilgrimId: { not: auth.pilgrimId },
        gender: myPref.gender, // Same gender required
        ...(myPref.tripId ? { tripId: myPref.tripId } : {}), // Same trip if set
      },
      include: {
        pilgrim: {
          select: {
            id: true,
            name: true,
            gender: true,
            birthDate: true,
            city: true,
          },
        },
      },
    });

    if (candidates.length === 0) {
      return NextResponse.json({
        data: null,
        message: 'Belum ada calon teman sekamar yang cocok saat ini.',
      });
    }

    // Score each candidate
    const scored = candidates.map((candidate) => {
      let score = 0;

      // Age range match (+30)
      if (candidate.ageRange === myPref.ageRange) {
        score += 30;
      }

      // Smoking preference match (+25)
      if (candidate.smokingPref === myPref.smokingPref) {
        score += 25;
      }

      // Snoring preference match (+25)
      if (candidate.snoringPref === myPref.snoringPref) {
        score += 25;
      }

      // Language preference match (+20)
      if (candidate.languagePref === myPref.languagePref) {
        score += 20;
      }

      return {
        pilgrimId: candidate.pilgrimId,
        name: candidate.pilgrim.name,
        city: candidate.pilgrim.city,
        score,
        matchDetails: {
          ageRange: candidate.ageRange === myPref.ageRange,
          smokingPref: candidate.smokingPref === myPref.smokingPref,
          snoringPref: candidate.snoringPref === myPref.snoringPref,
          languagePref: candidate.languagePref === myPref.languagePref,
        },
      };
    });

    // Sort by score descending, get best match
    scored.sort((a, b) => b.score - a.score);
    const bestMatch = scored[0];

    // Update matchedWith on both sides
    await prisma.roommatePreference.update({
      where: { pilgrimId: auth.pilgrimId },
      data: { matchedWith: bestMatch.pilgrimId },
    });

    return NextResponse.json({
      data: {
        name: bestMatch.name,
        city: bestMatch.city,
        score: bestMatch.score,
        maxScore: 100,
        matchDetails: bestMatch.matchDetails,
      },
      message: 'Berhasil menemukan teman sekamar yang cocok!',
    });
  } catch (error) {
    logger.error('Roommate match error', { error: String(error) });
    return NextResponse.json({ error: 'Gagal mencari teman sekamar' }, { status: 500 });
  }
}
