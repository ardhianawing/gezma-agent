import { NextRequest, NextResponse } from 'next/server';
import { jwtVerify } from 'jose';

const protectedPaths = ['/dashboard', '/pilgrims', '/packages', '/trips', '/documents', '/agency', '/settings', '/marketplace', '/trade', '/forum', '/news', '/academy', '/services', '/help', '/reports', '/activities', '/gamification', '/blockchain', '/tasks', '/notifications', '/gezmapay', '/tabungan', '/paylater', '/foundation'];
const authPaths = ['/login', '/register'];

// Only allow relative redirects (prevent open redirect)
function isValidRedirect(path: string): boolean {
  return path.startsWith('/') && !path.startsWith('//') && !path.includes('://');
}

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || '');

async function verifyToken(token: string): Promise<boolean> {
  try {
    await jwtVerify(token, JWT_SECRET);
    return true;
  } catch {
    return false;
  }
}

export async function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('token')?.value;

  // Custom domain resolution — set header for downstream usage
  const host = req.headers.get('host') || '';
  const isCustomDomain = host && !host.includes('gezma') && !host.includes('localhost') && !host.includes('127.0.0.1');
  const response = NextResponse.next();
  if (isCustomDomain) {
    response.headers.set('x-custom-domain', host);
  }

  // Command Center auth (separate system) — verify JWT signature
  if (pathname.startsWith('/command-center') && pathname !== '/command-center/login') {
    const ccToken = req.cookies.get('cc_token')?.value;
    if (!ccToken || !(await verifyToken(ccToken))) {
      const redirectResponse = NextResponse.redirect(new URL('/command-center/login', req.url));
      if (ccToken) redirectResponse.cookies.delete('cc_token');
      return redirectResponse;
    }
    return NextResponse.next();
  }

  // Check if accessing protected route — verify JWT signature, not just cookie existence
  const isProtected = protectedPaths.some(path => pathname === path || pathname.startsWith(path + '/'));
  if (isProtected) {
    if (!token || !(await verifyToken(token))) {
      const loginUrl = new URL('/login', req.url);
      loginUrl.searchParams.set('redirect', pathname);
      const redirectResponse = NextResponse.redirect(loginUrl);
      if (token) redirectResponse.cookies.delete('token');
      return redirectResponse;
    }
  }

  // Check if accessing auth pages with valid token (already logged in)
  const isAuthPage = authPaths.some(path => pathname === path || pathname.startsWith(path + '/'));
  if (isAuthPage && token && (await verifyToken(token))) {
    const redirectParam = req.nextUrl.searchParams.get('redirect');
    const destination = redirectParam && isValidRedirect(redirectParam) ? redirectParam : '/dashboard';
    return NextResponse.redirect(new URL(destination, req.url));
  }

  return response;
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|logo-light.png|logo-dark.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
