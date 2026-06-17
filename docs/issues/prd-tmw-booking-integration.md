## Problem Statement

The landing page currently manages Infoabend registrations entirely on its own: it sends confirmation, reminder, and Leiter-Benachrichtigung emails via Resend, and logs registrations to Google Sheets. Now that TMW write access has been granted, this is pure duplication — TMW already handles all those emails automatically when a booking is written via their API. Registration data is fragmented across Google Sheets and whatever TMW stores internally, with no structured local backup.

The sign-up form also lacks a newsletter opt-in checkbox, which the TMW booking API supports.

## Solution

Wire `/api/register` to call `POST https://tmw.meditation.de/api/booking`. TMW becomes the system of record and handles all Infoabend email communication automatically. A full registration snapshot is written to a new Supabase `info_anmeldungen` table as a non-fatal backup. Resend and Google Sheets are removed from the Infoabend registration path entirely. A newsletter checkbox is added to the form.

## User Stories

1. As a visitor, I want to sign up for an Infoabend with a single-step form (name, email, phone, newsletter checkbox), so that the process is fast and frictionless.
2. As a visitor, I want to receive a confirmation email immediately after signing up, so that I know my registration was successful.
3. As a visitor, I want to receive a reminder email the day before the Infoabend, so that I don't forget to attend.
4. As a visitor, I can opt in to the TM newsletter during registration with a single checkbox, so that I can stay informed without extra steps.
5. As a visitor signing up on mobile, I want a form that works perfectly at 390px width, so that the mobile experience is as smooth as desktop.
6. As a Leiter, I want to receive a notification email when someone registers for my Infoabend, so that I can prepare accordingly.
7. As a center admin, I want all Infoabend registrations backed up in Supabase with a full data snapshot, so that we have a queryable local record even if TMW is unavailable.
8. As a center admin, I want the `source` field to identify which site a registration came from (e.g. `tm-muenchen.de`), so that TMW's data correctly attributes registrations per center.
9. As Bennet, I want the TMW booking API to be the single integration point for Infoabend registrations, so that I don't maintain redundant email infrastructure for a flow TMW already handles.
10. As Bennet, I want Google Sheets logging removed from the Infoabend path once Supabase is live, so that registration data lives in one queryable place.

## Implementation Decisions

### Module: splitName
Pure function. Takes a single full-name string, splits on the first space. Returns `{ first_name, last_name }`. If no space is present, `last_name` is `""`. If TMW rejects an empty `last_name`, fallback to `"-"` — this is handled at the call site in the route, not inside this function.

### Module: cityToPlz
Pure function. Takes a city string (from the Vercel `x-vercel-ip-city` header) and returns a representative PLZ string from a hardcoded map. Returns `""` for unknown cities. No external API call. Map covers major German cities at minimum; Munich is the primary case. Note: the Vercel header value is URL-encoded (e.g. `M%C3%BCnchen`) — decode before passing to this function.

### Module: TMW booking client
Thin wrapper around `POST https://tmw.meditation.de/api/booking`. Accepts structured booking params and returns the TMW response (including the booking ID to store as `tmw_registration_id`). Authorization header uses `TMW_API_KEY` env var. Fatal — throws on non-2xx.

### Module: info_anmeldungen Supabase writer
Accepts a full registration snapshot and inserts a row into the `info_anmeldungen` table. Non-fatal — errors are logged but do not fail the registration.

### Schema: info_anmeldungen Supabase table
New table, one row per Infoabend registration. Fields:
- `id` — uuid, primary key, default gen_random_uuid()
- `tenant` — text
- `locale` — text
- `has_consent` — boolean
- `meta_pixel_event_id` — text, nullable
- `tmw_registration_id` — text, nullable (type confirmed during API testing)
- `name` — text (full name as entered)
- `email` — text
- `phone` — text, nullable
- `event_date` — text
- `event_time` — text
- `event_type` — text ("Online" or "Präsenz")
- `source` — text (hostname)
- `news_subscribed` — boolean
- `created_at` — timestamptz, default now()

### TMEvent type update
Add `lectureId: number` field. Confirm the field name in the TMW center API response by inspecting a live response before wiring. `fetchCenter` must capture it alongside `date`, `webinar_link`, `teacher_name`.

### /api/register route rewrite
Orchestration order:
1. Validate `name` and `email` are present
2. Split name via `splitName`
3. Derive `zip_code` from decoded `x-vercel-ip-city` header via `cityToPlz`
4. Read `source` from `host` header
5. Call TMW booking client with `lecture` (from request body), `seats: 1`, `first_name`, `last_name`, `email`, `phone`, `zip_code`, `source`, `news_subscribed` — fatal
6. Write snapshot to `info_anmeldungen` — non-fatal
7. Fire CAPI Lead event — non-fatal (unchanged)
8. Remove: all Resend calls, `appendRegistration` (Google Sheets)

Request body gains: `lectureId: number`, `newsSubscribed: boolean`. Removes: `isoDate`, `eventDate`, `eventTime`, `eventType`, `meetLink`, `teacherName`.

### RegistrationForm component update
Add `news_subscribed` checkbox below the phone field, unchecked by default. Label: "Ja, ich möchte den Newsletter erhalten." Pass `lectureId` from the `TMEvent` prop through to the fetch body.

### Email responsibility after migration
TMW owns all Infoabend email communication: confirmation, reminder, Leiter-Benachrichtigung. Resend is used exclusively for Veranstaltungen (`/api/register-event`) — unchanged.

### Testing the TMW API response
Before finalising the `TMEvent` type and route body, inspect a live TMW center API response to confirm the lecture `id` field name, and make one test booking against Bennet Strauch's upcoming München lecture to observe the response shape.

## Testing Decisions

Good tests test external behavior through a stable public interface, not implementation details. Prior art: `src/lib/whatsapp.test.ts` — Vitest, pure-function assertions, no mocks.

**Unit tests (Vitest, no mocks):**
- `splitName`: full name with space, single token, multiple spaces, leading/trailing whitespace, empty string
- `cityToPlz`: known cities (München correct PLZ), unknown city returns `""`, URL-encoded input decoded correctly

**Integration test:**
- TMW booking client called against the real TMW API with Bennet Strauch's test lecture — verify 2xx response and that the returned object contains a booking ID. Skipped in CI if `TMW_API_KEY` is absent.

No unit tests for the route or Supabase writer — glue code validated end-to-end by the integration test and manual browser testing.

## Out of Scope

- Multi-step wizard (explicitly rejected)
- PLZ as a user-visible form field
- Seat count selector (always 1)
- Any changes to `/api/register-event` (Veranstaltungen path untouched)
- IP geolocation via external API
- Wiring `active_locales` to the locale switcher

## Further Notes

- Empty `last_name: ""` is the first attempt; if TMW returns 400, fallback to `"-"`. Confirm during test booking.
- Once `info_anmeldungen` is confirmed working, remove the Google Sheets paragraph from `/datenschutz`.
- `tmw_registration_id` column type (integer vs text) depends on what the TMW API returns — confirm during testing.
