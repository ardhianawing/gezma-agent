import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-me';

export interface AuthPayload {
  userId: string;
  email: string;
  role: string;
  agencyId: string;
}

export function getAuthPayload(req: NextRequest): AuthPayload | null {
  const token = req.cookies.get('token')?.value;
  if (!token) return null;

  try {
    return jwt.verify(token, JWT_SECRET) as AuthPayload;
  } catch {
    return null;
  }
}

export function unauthorizedResponse() {
  return NextResponse.json(
    { error: 'Tidak terautentikasi' },
    { status: 401 }
  );
}
