import { verifySession } from "./admin-session";
import { verifyToken } from "./admin-token";
import { getCurrentTenant } from "@/lib/tenant";

// API paths a magic-link (Leiter) token may reach. A full-admin session cookie
// grants every route; a valid token grants only these — the routes the Leiter UI
// calls to manage emails and reminder templates for its event.
const LEITER_API_PATHS = [
  "/api/admin/email-send",
  "/api/admin/email-preview",
  "/api/admin/email-actions",
  "/api/admin/events",
];

export interface AdminApiCredentials {
  sessionToken?: string;
  tokenHeader?: string;
  tokenEvent?: string;
}

function isLeiterPath(pathname: string): boolean {
  return LEITER_API_PATHS.some(p => pathname === p || pathname.startsWith(`${p}/`));
}

export async function checkAdminRequest(request: Request): Promise<boolean> {
  const cookieHeader = request.headers.get("cookie");
  const sessionToken = cookieHeader
    ?.split(";").map(s => s.trim()).find(s => s.startsWith("admin-session="))
    ?.slice("admin-session=".length);
  const { tenant } = await getCurrentTenant();
  return isAuthorizedAdminApi(new URL(request.url).pathname, tenant, {
    sessionToken,
    tokenHeader: request.headers.get("x-admin-token") ?? undefined,
    tokenEvent: request.headers.get("x-admin-token-event") ?? undefined,
  });
}

/**
 * Decide whether a request to an `/api/admin/*` route is authorized for the
 * given tenant. The login route is the auth itself and is always open; a valid
 * full-admin session cookie grants every route; a valid magic-link token grants
 * only the Leiter routes.
 */
export async function isAuthorizedAdminApi(
  pathname: string,
  tenant: string,
  { sessionToken, tokenHeader, tokenEvent }: AdminApiCredentials,
): Promise<boolean> {
  if (pathname === "/api/admin/login") return true;

  if (sessionToken && await verifySession(sessionToken, tenant)) return true;

  if (tokenHeader && tokenEvent && isLeiterPath(pathname)) {
    return (await verifyToken(tokenHeader, tokenEvent)).valid;
  }

  return false;
}
