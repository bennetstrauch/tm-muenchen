## What to build

Implement token-based, event-scoped read access to the admin panel. A valid Magic Link opens the admin panel directly on the Anmeldungen tab filtered to one specific event — no login required. All other tabs still require normal login.

Token format: HMAC-SHA256 signed, stateless. Payload: eventId + expiry (30 days after event date). Secret from env var `ADMIN_TOKEN_SECRET`.

URL format: `/admin?tab=anmeldungen&event=<eventId>&token=<token>`

## Acceptance criteria

- [ ] New `lib/admin-token` module exposes `generateToken(eventId, eventDate)` and `verifyToken(token, eventId)`
- [ ] Valid token → admin panel loads without login prompt, Anmeldungen tab active, event pre-selected and filter locked
- [ ] Other tabs (Veranstaltungen, Vorlagen, Info-Anmeldungen) are hidden or disabled in token-scoped view
- [ ] Expired token (>30 days after event date) → login prompt shown
- [ ] Invalid/tampered token → login prompt shown
- [ ] Missing `ADMIN_TOKEN_SECRET` env var → server error at startup (fail fast)
- [ ] Normal admin login flow unchanged
- [ ] Site builds without TypeScript errors

## Blocked by

None — can start immediately.
