import { NextRequest, NextResponse } from 'next/server';
import { getPilgrimPayload } from '@/lib/auth-pilgrim';
import { prisma } from '@/lib/prisma';
import { logger } from '@/lib/logger';

function generateReferralCode(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let code = '';
  for (let i = 0; i < 6; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `REF-${code}`;
}

// GET: get own referral code + stats
export async function GET(req: NextRequest) {
  try {
    const payload = getPilgrimPayload(req);
    if (!payload) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    const referrals = await prisma.referral.findMany({
      where: { pilgrimId: payload.pilgrimId },
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        referralCode: true,
        status: true,
        bonusPoints: true,
        createdAt: true,
        referredPilgrim: {
          select: { name: true },
        },
      },
    });

    const totalReferrals = referrals.length;
    const completedReferrals = referrals.filter(r => r.status === 'completed').length;
    const activeCode = referrals.length > 0 ? referrals[0].referralCode : null;

    return NextResponse.json({
      referralCode: activeCode,
      totalReferrals,
      completedReferrals,
      referrals,
    });
  } catch (error) {
    logger.error('GET /api/pilgrim-portal/referral error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}

// POST: generate referral code
export async function POST(req: NextRequest) {
  try {
    const payload = getPilgrimPayload(req);
    if (!payload) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    // Check if pilgrim already has a referral code
    const existing = await prisma.referral.findFirst({
      where: { pilgrimId: payload.pilgrimId, status: 'pending' },
    });

    if (existing) {
      return NextResponse.json({
        referralCode: existing.referralCode,
        message: 'Kode referral sudah ada',
      });
    }

    // Generate unique code
    let referralCode = generateReferralCode();
    let attempts = 0;
    while (attempts < 10) {
      const exists = await prisma.referral.findUnique({ where: { referralCode } });
      if (!exists) break;
      referralCode = generateReferralCode();
      attempts++;
    }

    const referral = await prisma.referral.create({
      data: {
        referralCode,
        pilgrimId: payload.pilgrimId,
        agencyId: payload.agencyId,
      },
    });

    return NextResponse.json({
      referralCode: referral.referralCode,
      message: 'Kode referral berhasil dibuat',
    });
  } catch (error) {
    logger.error('POST /api/pilgrim-portal/referral error', { error: String(error) });
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
