import { NextRequest, NextResponse } from 'next/server';

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin')) {
    if (pathname === '/admin/login') return NextResponse.next();

    // Magic link: requests with both token + event params are allowed through;
    // the page itself verifies the token server-side.
    const url = request.nextUrl;
    const hasMagicLink = url.searchParams.has('token') && url.searchParams.has('event');
    if (hasMagicLink) return NextResponse.next();

    const token = request.cookies.get('admin-session')?.value;
    if (!isValidToken(token)) {
      return NextResponse.redirect(new URL('/admin/login', request.url));
    }
  }

  return NextResponse.next();
}

function isValidToken(token: string | undefined): boolean {
  if (!token) return false;
  try {
    const decoded = atob(token);
    const colon = decoded.indexOf(':');
    if (colon === -1) return false;
    return (
      decoded.slice(0, colon) === process.env.ADMIN_USER &&
      decoded.slice(colon + 1) === process.env.ADMIN_PASS
    );
  } catch {
    return false;
  }
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon\\.ico|api/).*)'],
};
