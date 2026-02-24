import { NextRequest, NextResponse } from 'next/server';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import { generateTotpSecret } from '@/lib/services/totp.service';

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
    console.error('TOTP setup error:', error);
    return NextResponse.json(
      { error: 'Terjadi kesalahan server.' },
      { status: 500 }
    );
  }
}
