import { NextRequest, NextResponse } from 'next/server';

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isAdmin = request.cookies.get('x-admin')?.value === '1';

  if (pathname.startsWith('/admin')) {
    const auth = request.headers.get('authorization') ?? '';
    if (!checkAuth(auth)) {
      return new NextResponse(null, {
        status: 401,
        headers: { 'WWW-Authenticate': 'Basic realm="TM München Admin"' },
      });
    }
    const res = NextResponse.next();
    if (!isAdmin) {
      res.cookies.set('x-admin', '1', {
        maxAge: 60 * 60 * 24 * 365,
        httpOnly: true,
        sameSite: 'lax',
        secure: process.env.NODE_ENV === 'production',
      });
    }
    return res;
  }

  if (isAdmin) {
    const reqHeaders = new Headers(request.headers);
    reqHeaders.set('x-is-admin', '1');
    return NextResponse.next({ request: { headers: reqHeaders } });
  }

  return NextResponse.next();
}

function checkAuth(header: string): boolean {
  if (!header.startsWith('Basic ')) return false;
  try {
    const decoded = atob(header.slice(6));
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
