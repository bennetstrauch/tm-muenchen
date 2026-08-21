// Whether the Meta Pixel / CAPI may track this visitor, given the tenant's
// consent mode and the visitor's stored choice (localStorage `tm_cookie_consent`).
//
// Consent-first (default): track only after an explicit "accepted".
// Tracking ohne Einwilligung: track everyone except those who opted out
// ("declined") via the Datenschutz opt-out link. See ADR 0011.
export function shouldTrack(
  trackWithoutConsent: boolean,
  stored: string | null,
): boolean {
  return trackWithoutConsent ? stored !== "declined" : stored === "accepted";
}
