import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getAuthPayload, type AuthPayload } from '@/lib/auth-server';
import { AppError } from '@/lib/errors';

type RouteContext = { params: Promise<Record<string, string>> };

type AuthenticatedHandler = (
  req: NextRequest,
  auth: AuthPayload,
  context: RouteContext,
) => Promise<NextResponse | Response>;

interface WithAuthOptions {
  requiredRole?: string[];
}

export function withAuth(handler: AuthenticatedHandler, options?: WithAuthOptions) {
  return async (req: NextRequest, context?: RouteContext) => {
    const auth = getAuthPayload(req);
    if (!auth) {
      return NextResponse.json({ error: 'Tidak terautentikasi' }, { status: 401 });
    }

    if (options?.requiredRole && !options.requiredRole.includes(auth.role)) {
      return NextResponse.json({ error: 'Akses ditolak' }, { status: 403 });
    }

    try {
      return await handler(req, auth, context ?? { params: Promise.resolve({}) });
    } catch (error) {
      if (error instanceof AppError) {
        return NextResponse.json(
          { error: error.message, ...(error.details && { details: error.details }) },
          { status: error.statusCode },
        );
      }

      if (error instanceof z.ZodError) {
        return NextResponse.json(
          { error: 'Validasi gagal', details: error.flatten().fieldErrors },
          { status: 400 },
        );
      }

      const method = req.method;
      const url = new URL(req.url).pathname;
      console.error(`[API Error] ${method} ${url}`, error);

      return NextResponse.json({ error: 'Terjadi kesalahan server' }, { status: 500 });
    }
  };
}
