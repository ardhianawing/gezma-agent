import { NextResponse } from 'next/server';
import { clearCCTokenCookie } from '@/lib/auth-command-center';

export async function POST() {
  const response = NextResponse.json({ message: 'Logged out' });
  return clearCCTokenCookie(response);
}
