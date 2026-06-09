import createLocaleMiddleware from "next-intl/middleware";
import { NextRequest, NextResponse } from "next/server";
import { routing } from "./i18n/routing";
import { resolveTenantSlug } from "./lib/tenant-edge";
import { verifySessionToken } from "./lib/admin-session";
import { isAuthorizedAdminApi } from "./lib/admin-api-gate";

const handleLocale = createLocaleMiddleware(routing);

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Resolve tenant from hostname (or DEV_TENANT in dev). Unknown host → München.
  const slug = await resolveTenantSlug(request);
  if (slug === null) {
    return NextResponse.redirect("https://tm-muenchen.de");
  }
  const requestHeaders = new Headers(request.headers);
  requestHeaders.set("x-tenant", slug);
  const withTenant = { request: { headers: requestHeaders } };

  // Admin UI: auth gate, no locale routing.
  if (pathname.startsWith("/admin")) {
    if (pathname === "/admin/login") return NextResponse.next(withTenant);

    // Magic-link: token + event params — the page verifies server-side.
    const url = request.nextUrl;
    const hasMagicLink = url.searchParams.has("token") && url.searchParams.has("event");
    if (hasMagicLink) return NextResponse.next(withTenant);

    const token = request.cookies.get("admin-session")?.value;
    if (!token || !await verifySessionToken(token, slug)) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next(withTenant);
  }

  // Admin API: auth gate (session cookie or scoped magic-link token header).
  if (pathname.startsWith("/api/admin")) {
    const authorized = await isAuthorizedAdminApi(pathname, slug, {
      sessionToken: request.cookies.get("admin-session")?.value,
      tokenHeader: request.headers.get("x-admin-token") ?? undefined,
      tokenEvent: request.headers.get("x-admin-token-event") ?? undefined,
    });
    if (!authorized) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    return NextResponse.next(withTenant);
  }

  // Public API: no locale routing needed.
  if (pathname.startsWith("/api")) {
    return NextResponse.next(withTenant);
  }

  // Everything else: next-intl locale routing. Pass the request carrying x-tenant
  // so next-intl forwards it downstream when it rewrites the URL.
  return handleLocale(new NextRequest(request.url, { headers: requestHeaders }));
}

export const config = {
  // Exclude Next.js internals, static assets, file extensions, and metadata routes.
  matcher: [
    "/((?!_next/static|_next/image|favicon\\.ico|icon|apple-icon|opengraph-image|twitter-image|manifest|robots\\.txt|sitemap\\.xml|.*\\..*).*)",
  ],
};
