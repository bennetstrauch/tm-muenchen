import createLocaleMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { resolveTenantSlug } from "./lib/tenant";

const handleLocale = createLocaleMiddleware(routing);

export default async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Resolve tenant from hostname (or DEV_TENANT in dev). Unknown host -> München.
  const slug = await resolveTenantSlug(request);
  if (slug === null) {
    return NextResponse.redirect("https://tm-muenchen.de");
  }
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-tenant", slug);
  const withTenant = { request: { headers: requestHeaders } };

  // Admin: auth gate, no locale routing
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") return NextResponse.next(withTenant);

    // Magic link: token + event params let the page verify server-side
    const url = request.nextUrl;
    const hasMagicLink = url.searchParams.has("token") && url.searchParams.has("event");
    if (hasMagicLink) return NextResponse.next(withTenant);

    const token = request.cookies.get("admin-session")?.value;
    if (!isValidToken(token)) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next(withTenant);
  }

  // API: no locale routing
  if (pathname.startsWith("/api")) {
    return NextResponse.next(withTenant);
  }

  // Everything else: next-intl locale routing. Pass a request carrying x-tenant
  // so next-intl forwards it downstream (it clones request headers on rewrite).
  return handleLocale(new NextRequest(request.url, { headers: requestHeaders }));
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
  // Exclude Next.js internals, static assets, file extensions, and metadata routes
  matcher: ["/((?!_next/static|_next/image|favicon\\.ico|icon|apple-icon|opengraph-image|twitter-image|manifest|robots\\.txt|sitemap\\.xml|.*\\..*).*)" ],
};
