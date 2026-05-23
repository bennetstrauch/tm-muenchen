import createLocaleMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";

const handleLocale = createLocaleMiddleware(routing);

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Admin: auth gate, no locale routing
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") return NextResponse.next();

    // Magic link: token + event params let the page verify server-side
    const url = request.nextUrl;
    const hasMagicLink = url.searchParams.has("token") && url.searchParams.has("event");
    if (hasMagicLink) return NextResponse.next();

    const token = request.cookies.get("admin-session")?.value;
    if (!isValidToken(token)) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  // API: no locale routing
  if (pathname.startsWith("/api")) {
    return NextResponse.next();
  }

  // Everything else: next-intl locale routing
  return handleLocale(request);
}

function isValidToken(token: string | undefined): boolean {
  if (!token) return false;
  try {
    const decoded = atob(token);
    const colon = decoded.indexOf(":");
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
  // Run on all paths except Next.js internals and static files
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico).*)"],
};
