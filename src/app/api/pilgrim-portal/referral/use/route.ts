import { NextRequest, NextResponse } from 'next/server';
import { getPilgrimPayload } from '@/lib/auth-pilgrim';
import { prisma } from '@/lib/prisma';
import { awardPilgrimPoints } from '@/lib/services/pilgrim-gamification.service';
import { z } from 'zod';
import { logger } from '@/lib/logger';

const useReferralSchema = z.object({
  referralCode: z.string().min(1, 'Kode referral diperlukan'),
});

// POST: use a referral code
export async function POST(req: NextRequest) {
  try {
    const payload = getPilgrimPayload(req);
    if (!payload) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    const body = await req.json();
    const parsed = useReferralSchema.safeParse(body);

    if (!parsed.success) {
      const errors = parsed.error.flatten().fieldErrors;
      return NextResponse.json({ error: 'Validasi gagal', errors }, { status: 400 });
    }

    const { referralCode } = parsed.data;

    // Find the referral
    const referral = await prisma.referral.findUnique({
      where: { referralCode },
    });

    if (!referral) {
      return NextResponse.json({ error: 'Kode referral tidak ditemukan' }, { status: 404 });
    }

    if (referral.status === 'completed') {
      return NextResponse.json({ error: 'Kode referral sudah digunakan' }, { status: 400 });
    }

    // Cannot refer yourself
    if (referral.pilgrimId === payload.pilgrimId) {
      return NextResponse.json({ error: 'Tidak bisa menggunakan kode referral sendiri' }, { status: 400 });
    }

    // Check if this pilgrim already used a referral
    const alreadyReferred = await prisma.referral.findFirst({
      where: { referredPilgrimId: payload.pilgrimId },
    });

    if (alreadyReferred) {
      return NextResponse.json({ error: 'Anda sudah pernah menggunakan kode referral' }, { status: 400 });
    }

    // Update referral
    await prisma.referral.update({
      where: { id: referral.id },
      data: {
        referredPilgrimId: payload.pilgrimId,
        status: 'completed',
      },
    });

    // Award bonus points to referrer
    await awardPilgrimPoints(
      referral.pilgrimId,
      'complete_course', // reuse existing point rule that gives 50 points
      `Bonus referral: kode ${referralCode} digunakan`,
      { referralCode, referredPilgrimId: payload.pilgrimId },
    );

    return NextResponse.json({
      message: 'Kode referral berhasil digunakan',
      bonusPoints: referral.bonusPoints,
    });
  } catch (error) {
    logger.error('POST /api/pilgrim-portal/referral/use error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
