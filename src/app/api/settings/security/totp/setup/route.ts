import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { generateTotpSecret } from '@/lib/services/totp.service';
import { logger } from '@/lib/logger';

export async function POST(req: NextRequest) {
  try {
    const auth = getAuthPayload(req);
    if (!auth) return unauthorizedResponse();

    const { secret, qrDataUrl } = await generateTotpSecret(auth.email);

    return NextResponse.json({
      secret,
      qrDataUrl,
    });
  } catch (error) {
    logger.error('TOTP setup error', { error: String(error) });
    return NextResponse.json(
      { error: 'Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}
