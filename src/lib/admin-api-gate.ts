import { verifySessionToken } from "./admin-session";
import { verifyToken } from "./admin-token";

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

/**
 * Decide whether a request to an `/api/admin/*` route is authorized for the
 * given tenant. The login route is the auth itself and is always open; a valid
 * full-admin session cookie grants every route; a valid magic-link token grants
 * only the Leiter routes.
 */
export function isAuthorizedAdminApi(
  pathname: string,
  tenant: string,
  { sessionToken, tokenHeader, tokenEvent }: AdminApiCredentials,
): boolean {
  if (pathname === "/api/admin/login") return true;

  if (sessionToken && verifySessionToken(sessionToken, tenant)) return true;

  if (tokenHeader && tokenEvent && isLeiterPath(pathname)) {
    return verifyToken(tokenHeader, tokenEvent).valid;
  }

  return false;
}
