import { NextResponse } from 'next/server';
import { signCCToken, setCCTokenCookie } from '@/lib/auth-command-center';

// DEV ONLY — bypass login untuk development, hapus sebelum production
export async function POST() {
  const token = signCCToken({
    adminId: 'dev-bypass-admin',
    email: 'dev@gezma.local',
    role: 'super_admin',
  });

  const response = NextResponse.json({ ok: true });
  return setCCTokenCookie(response, token);
}
