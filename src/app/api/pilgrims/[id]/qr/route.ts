import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { getAuthPayload, unauthorizedResponse } from '@/lib/auth-server';
import QRCode from 'qrcode';
import crypto from 'crypto';

type Context = { params: Promise<{ id: string }> };

export async function GET(req: NextRequest, { params }: Context) {
  const auth = getAuthPayload(req);
  if (!auth) return unauthorizedResponse();

  const { id } = await params;

  try {
    const pilgrim = await prisma.pilgrim.findFirst({
      where: { id, agencyId: auth.agencyId },
      select: { id: true, verificationCode: true, name: true },
    });

    if (!pilgrim) {
      return NextResponse.json({ error: 'Jemaah tidak ditemukan' }, { status: 404 });
    }

    // Generate verification code if not exists
    let code = pilgrim.verificationCode;
    if (!code) {
      code = crypto.randomUUID();
      await prisma.pilgrim.update({
        where: { id },
        data: { verificationCode: code },
      });
    }

    // Build verification URL
    const baseUrl = req.nextUrl.origin;
    const verifyUrl = `${baseUrl}/verify/pilgrim/${code}`;

    // Generate QR as data URL
    const qrDataUrl = await QRCode.toDataURL(verifyUrl, {
      width: 300,
      margin: 2,
      color: { dark: '#000000', light: '#FFFFFF' },
    });

    return NextResponse.json({
      data: {
        qrDataUrl,
        verifyUrl,
        verificationCode: code,
      },
    });
  } catch (error) {
    console.error('GET /api/pilgrims/[id]/qr error:', error);
    return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
  }
}
