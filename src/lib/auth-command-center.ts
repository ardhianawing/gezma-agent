import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { JWT_SECRET } from '@/lib/auth-server';
const CC_COOKIE = 'cc_token';

export interface CCAuthPayload {
  adminId: string;
  email: string;
  role: 'super_admin';
}

export function signCCToken(payload: CCAuthPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function getCCAuthPayload(req: NextRequest): CCAuthPayload | null {
  const token = req.cookies.get(CC_COOKIE)?.value;
  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET) as CCAuthPayload;
  } catch {
    return null;
  }
}

export function ccUnauthorizedResponse() {
  return NextResponse.json(
    { error: 'Tidak terautentikasi (Command Center)' },
    { status: 401 }
  );
}

export function setCCTokenCookie(response: NextResponse, token: string): NextResponse {
  response.cookies.set(CC_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/',
  });
  return response;
}

export function clearCCTokenCookie(response: NextResponse): NextResponse {
  response.cookies.set(CC_COOKIE, '', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 0,
    path: '/',
  });
  return response;
}
