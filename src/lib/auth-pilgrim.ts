import { NextRequest } from 'next/server';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-change-me';

export interface PilgrimJwtPayload {
  pilgrimId: string;
  agencyId: string;
  role: 'pilgrim';
}

export function signPilgrimToken(pilgrimId: string, agencyId: string): string {
  return jwt.sign(
    { pilgrimId, agencyId, role: 'pilgrim' } satisfies PilgrimJwtPayload,
    JWT_SECRET,
    { expiresIn: 60 * 60 * 24 * 30 } // 30 days
  );
}

export function getPilgrimPayload(req: NextRequest): PilgrimJwtPayload | null {
  const token = req.cookies.get('pilgrim_token')?.value;
  if (!token) return null;

  try {
    const payload = jwt.verify(token, JWT_SECRET) as PilgrimJwtPayload;
    if (payload.role !== 'pilgrim' || !payload.pilgrimId || !payload.agencyId) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}
