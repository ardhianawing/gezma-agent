import { NextRequest, NextResponse } from 'next/server';

const protectedPaths = ['/dashboard', '/pilgrims', '/packages', '/trips', '/documents', '/agency', '/settings', '/marketplace', '/trade', '/forum', '/news', '/academy', '/services', '/help'];
const authPaths = ['/login', '/register'];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const token = req.cookies.get('token')?.value;

  // Check if accessing protected route without token
  const isProtected = protectedPaths.some(path => pathname === path || pathname.startsWith(path + '/'));
  if (isProtected && !token) {
    const loginUrl = new URL('/login', req.url);
    loginUrl.searchParams.set('redirect', pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Check if accessing auth pages with token (already logged in)
  const isAuthPage = authPaths.some(path => pathname === path || pathname.startsWith(path + '/'));
  if (isAuthPage && token) {
    return NextResponse.redirect(new URL('/dashboard', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    '/((?!api|_next/static|_next/image|favicon.ico|manifest.json|logo-light.png|logo-dark.png|.*\\.(?:svg|png|jpg|jpeg|gif|webp|ico)$).*)',
  ],
};
