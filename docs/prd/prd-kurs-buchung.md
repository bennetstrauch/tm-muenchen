## Problem Statement

Visitors who have already decided to learn TM have no way to book a course directly on tm-muenchen.de. They are sent away to the national site (meditation.de), where the booking flow is a multi-step modal that is not optimised for mobile, repeats teacher names on every slot button, and uses an outdated layout. Conversion from ad traffic to course registration is effectively zero from our site.

## Solution

Add a **TM-Kurs** section to the landing page (after the Abschluss-CTA section) that fetches live course dates from the TMW API, lets the visitor pick a Persönliche Unterweisung slot, fills in their contact details, reviews their booking, and confirms — all inline on the page, mobile-first, without leaving tm-muenchen.de.

The section is toggled per tenant in the admin Einstellungen tab and can be limited to specific active locales.

## User Stories

1. As a visitor who wants to learn TM, I want to see upcoming TM-Kurs dates on the site, so that I know when I can start.
2. As a visitor, I want to expand a course date and see available time slots, so that I can pick one that fits my schedule.
3. As a visitor on a gender-restricted course, I want to see slots grouped as "Für Frauen" and "Für Männer", so that I understand I will be taught by a same-gender teacher.
4. As a visitor on a non-gender-restricted course, I want to see all available slots in a single list without gender headers, so that the UI is not unnecessarily complicated.
5. As a visitor, I want to see the teacher's photo and name once per gender group, not repeated on every slot button, so that the view is clean and easy to scan.
6. As a visitor, I want slot buttons to show only the start time (not duration), so that the buttons are concise.
7. As a visitor, I want already-booked slots hidden, so that I only see options I can actually choose.
8. As a visitor, I want to see the three Folgetreffen dates in a compact line below the slot grid (e.g. "Sa 11:00, 27. Juni · So 14:30 · Mo 19:00"), so that I know which days to keep free before committing.
9. As a visitor, I want a sticky "Weiter" CTA to appear as soon as I select a slot, so that I always know how to proceed without scrolling to a bottom button.
10. As a visitor, I want the sticky CTA to disappear when I scroll completely past the expanded course card, so that it does not clutter the page once the card is off-screen.
11. As a visitor, I want to click "Alternative Termine auf Anfrage" inside the expanded card and have the individual appointment request form open inline in the same card, so that I never have to leave the page.
12. As a visitor viewing a course section with no available courses (or a language not enabled for courses), I want the individual appointment request form to appear pre-opened in the section, so that I always have a path forward.
13. As a visitor, I want to click "Weiter" and enter my contact details in step 2 of the inline flow, so that I can complete the booking without navigating away.
14. As a visitor, I want to enter my Geschlecht (Frau / Mann / divers), so that the TMW system has the required field.
15. As a visitor, I want to enter my date of birth via a three-field masked input (DD · MM · YYYY) that auto-advances between fields, so that entering the date is fast and error-free on mobile.
16. As a visitor, I want to enter my PLZ and have the city field auto-fill from a static German PLZ dataset, so that I do not have to type my city name manually.
17. As a visitor, I want my browser native autocomplete to fill in my street address, so that I do not have to retype it.
18. As a visitor, I want a "Zurück" button in step 2 that returns me to my selected slot (with the selection preserved), so that I can change my time without starting over.
19. As a visitor, I want step 3 to show me a summary of my personal data and all four appointment dates (Persönliche Unterweisung + 3 Folgetreffen) before I confirm, so that I can review everything in one place.
20. As a visitor, I want to confirm that I can attend all four Treffen by checking a mandatory checkbox, so that I understand the full commitment.
21. As a visitor, I want to confirm that the course fee is known to me by checking a mandatory checkbox, so that the cost is transparent.
22. As a visitor, I want to click the hyperlinked word "Kursgebühr" in the fee checkbox and see a clear modal listing all three fee tiers (Normal, Familien, Stipendium), so that I know exactly what I will be paying before I confirm.
23. As a visitor, I want the fee modal to be displayed in my locale's language, so that the information is accessible to non-German speakers.
24. As a visitor, I want to optionally subscribe to the TM newsletter via a third checkbox, so that I can stay informed without it being mandatory.
25. As a visitor, I want a "Jetzt anmelden" submit button at the bottom of the review step (not sticky), so that I consciously confirm after reviewing everything.
26. As a visitor, I want a "Zurück" link on the review step that takes me back to the contact form, so that I can fix mistakes.
27. As a visitor, I want to see a clear success state after booking, so that I know my registration was received.
28. As a visitor, I want to receive a confirmation email from TMW after booking, so that I have a record of my appointment.
29. As a center admin, I want to toggle the course booking section on or off in the Einstellungen tab, so that I can hide it when no courses are scheduled.
30. As a center admin, when I enable course booking, I want to choose which of my active locales show the course section, so that I can offer it in German only even if the site also runs in English.
31. As a center admin, I want German to always be selected and non-deselectable in the course locale picker, so that the section always works for German-speaking visitors.
32. As a developer, I want the TMW API response to be parsed and typed in a dedicated courses lib module, so that the data shape is tested and encapsulated from the UI.
33. As a developer, I want the PLZ-to-city lookup to be a pure function over a static dataset, so that it is free, GDPR-clean, and testable without mocking.
34. As a developer, I want course booking to write a non-fatal backup row to Supabase kurs_anmeldungen, so that we have a local audit trail independent of TMW.

## Implementation Decisions

### New lib modules

**`lib/courses.ts`**
Single export: `getCourses(centerIds: number[]): Promise<TMCourse[]>`. Fetches from `GET /api/center/{id}/courses` (with ISR revalidation like `lib/events.ts`), merges results across center IDs, filters out courses whose date is in the past, filters each course's slots to only those where `booked === "no"`, and removes any course that has zero available slots after filtering.

Types:
```ts
type CourseSlot = {
  pk: number;
  time: string;         // "HH:MM"
  teacherName: string;
  teacherImage: string; // image_url from API
  teacherGender: "M" | "F";
};

type TMCourse = {
  date: string;              // ISO "2026-07-11"
  genderRestricted: boolean;
  slots: CourseSlot[];       // only available (booked === "no")
  followUps: { date: string; time: string }[]; // up to 3, in-person only
};
```

**`lib/plz-city.ts`**
Single export: `lookupCityByPlz(plz: string): string | null`. Pure function over a bundled static JSON dataset of German PLZ-to-city mappings. No external API call. Returns `null` for unknown PLZs. Inverse of existing `lib/geo.ts` (city-to-PLZ) which serves a different purpose.

**`lib/course-booking.ts`**
Single export: `bookCourse(params: CourseBookingParams): Promise<{ id: number }>`. Wraps `POST /api/coursebooking` on TMW. Required params mirror the API contract: `slot`, `first_name`, `last_name`, `email`, `gender` ("M"|"F"|"X"), `birthdate` (DD.MM.YYYY format). Optional: `phone_number`, `address1`, `zip_code`, `city`, `news_subscribed`, `source`. Throws on non-2xx.

**`lib/kurs-anmeldungen.ts`**
Single export: `insertKursAnmeldung(data: KursAnmeldungRow): Promise<void>`. Writes to Supabase table `kurs_anmeldungen`. Non-fatal — caller catches and logs on failure. Pattern mirrors `lib/info-anfragen.ts`.

### New API route

**`api/coursebooking/route.ts`** — POST handler:
1. Validates required fields (`slot`, `first_name`, `last_name`, `email`, `gender`, `birthdate`) — returns 400 if missing.
2. Calls `bookCourse()` — fatal if this fails (returns 502).
3. Calls `insertKursAnmeldung()` — non-fatal, wrapped in try/catch.
4. Returns `{ id }` on success.

No auth required (public booking endpoint).

### New component

**`components/courses.tsx`** — Client component. Receives `courses: TMCourse[]` and `locale: string` as props from the server page. Internal state machine per expanded card:

```
idle
→ (click course row)       → expanded(step: 1, selectedSlot: null)
→ (select slot)            → expanded(step: 1, selectedSlot: pk)
→ (click sticky Weiter)    → expanded(step: 2)
→ (submit contact form)    → expanded(step: 3)
→ (click Jetzt anmelden)   → success | error
→ (click Zurück from 2)    → expanded(step: 1, selectedSlot preserved)
→ (click Zurück from 3)    → expanded(step: 2)
```

Sub-components (within the same file unless large):
- `CourseRow` — collapsed row: course date + teacher first names + "Termin wählen" button
- `SlotStep` — step 1: gender groups (if genderRestricted), teacher photo + name once, slot time buttons, Folgetreffen compact bar, sticky CTA via IntersectionObserver on card container
- `ContactStep` — step 2: Vorname, Nachname, E-Mail, Telefon (optional), Geschlecht (Frau/Mann/divers), Geburtsdatum (3-field), PLZ + Stadt (PLZ auto-fills city via lookupCityByPlz), Straße (browser native autocomplete), Newsletter checkbox
- `ReviewStep` — step 3: personal data summary, all 4 dates, 3 checkboxes, submit button at bottom
- `KursgebührModal` — fee tier info modal, triggered by hyperlink in checkbox label; all copy i18n-keyed and translated
- `DobInput` — three-field masked DD / MM / YYYY, auto-advances on 2 digits entered, composes to DD.MM.YYYY string for API

Gender grouping: when `genderRestricted`, partition slots by `teacherGender`; render "Für Frauen" section only if F slots exist, "Für Männer" only if M slots exist. When not restricted, render all slots together without headers.

### Schema changes

**Supabase `tenants` table** — add two columns:
- `show_courses boolean NOT NULL DEFAULT false`
- `course_locales text[] NOT NULL DEFAULT '{de}'`

**New Supabase table `kurs_anmeldungen`:**
```sql
id               uuid DEFAULT gen_random_uuid() PRIMARY KEY,
tenant           text NOT NULL,
slot_pk          integer NOT NULL,
tmw_booking_id   integer,
first_name       text NOT NULL,
last_name        text NOT NULL,
email            text NOT NULL,
phone            text,
gender           text NOT NULL,
birthdate        text NOT NULL,
address1         text,
zip_code         text,
city             text,
news_subscribed  boolean NOT NULL DEFAULT false,
locale           text NOT NULL,
source           text,
created_at       timestamptz NOT NULL DEFAULT now()
```

### Modified modules

**`app/[locale]/(site)/page.tsx`** — conditionally fetch `getCourses(tenant.tmw_center_ids)` only when `tenant.show_courses && tenant.course_locales.includes(locale)`; pass result and locale to `<Courses />` rendered after `<AbschlussCta />`. If condition is false, pass empty array so the section renders the IndividualAppointment pre-opened fallback.

**`components/abschluss-cta.tsx`** — update heading copy to "Finde heraus, wie sehr TM dein Leben bereichern kann".

**Admin Einstellungen route** — add `show_courses` and `course_locales` to the GET response and the PUT allowlist. Same sensitive-field guard pattern as existing fields.

**Admin Einstellungen UI** — add "Kurs-Buchung anzeigen" toggle; when enabled, reveal a locale-picker with checkboxes for each `active_locale` (DE always checked and pointer-events-none/disabled).

**Super-admin tenant form** — expose the same two fields.

### i18n

All UI copy for the Kurse section goes into `de.json` under a `Courses` namespace and is auto-translated via the existing GitHub Action. The fee modal copy (tier names, amounts, installment note) is also i18n-keyed and translated. TMW handles the post-booking confirmation email — we send nothing.

### API contract

`POST https://tmw.meditation.de/api/coursebooking`
Required: `slot` (integer pk), `first_name`, `last_name`, `email`, `gender` ("M"/"F"/"X"), `birthdate` ("DD.MM.YYYY").
Optional: `phone_number`, `address1`, `address2`, `zip_code`, `city`, `message`, `news_subscribed`, `source`.

`GET https://tmw.meditation.de/api/center/{id}/courses`
Returns array. Each item: `date` (German string), `gender_restricted` (boolean), `follow_up1/2/3` (German datetime strings), `follow_up1/2/3_online` (boolean), `slots[]` with `pk`, `booked` ("yes"/"no"), `time` ("HH:MM"), `duration`, `teacher.{name, image_url, gender}`.

## Testing Decisions

Good tests verify external behaviour (inputs, outputs, observable side effects) — not internal implementation.

**`lib/courses.ts`** — Unit tests with fixture API responses:
- Booked slots are excluded from returned courses.
- Courses in the past are excluded.
- `follow_up_online: true` entries are excluded from followUps.
- A course with zero available slots after filtering is excluded entirely.
- Parsing of German date format produces correct ISO date.

**`lib/plz-city.ts`** — Unit tests:
- Known PLZ returns correct city.
- Unknown PLZ returns null.
- PLZ with leading zeros handled correctly.

**`lib/course-booking.ts`** — Integration test skipped in CI (`describe.skipIf(!process.env.TMW_API_KEY)`), same pattern as `tmw-booking.test.ts`. Asserts numeric `id` returned.

**`api/coursebooking/route.ts`** — Route tests with mocked `bookCourse` and Supabase:
- Missing required field returns 400.
- Valid request calls bookCourse with correct payload and returns `{ id }`.
- TMW failure (bookCourse throws) returns 502.
- Supabase failure is swallowed; response is still 200 with `{ id }`.

**Admin Einstellungen route** — Extend existing test:
- GET response includes `show_courses` and `course_locales`.
- PUT writes `show_courses` and `course_locales`.
- PUT does not write fields outside the explicit allowlist (sensitive-field guard).

Prior art for all tests: `src/lib/tmw-booking.test.ts`, `src/lib/geo.test.ts`, `src/app/api/admin/einstellungen/route.test.ts`.

## Out of Scope

- Price display on the collapsed course card (fee shown only via modal in step 3).
- Admin view of kurs_anmeldungen registrations (audit table only for now).
- Leiter-Benachrichtigung for course bookings (TMW handles all post-booking emails).
- Online course support (online follow-ups are filtered out; no online-only course courses exist in München data).
- Showing booked-out slots as greyed out.
- Per-tenant copy overrides for course section strings.
- Course cancellation or management flow.
- Translating the TMW confirmation email (sent by TMW in German regardless of locale).
- Infogespräch rename sweep (Infoabend → Infogespräch across code and copy) — separate task.

## Further Notes

- `teacher.gender` on the API slot (drives gender grouping in the UI) and `gender` in the booking payload (registrant's own gender) are two distinct things and must not be conflated.
- The existing `IndividualAppointment` component is reused inside the Courses section for both the "Alternative Termine auf Anfrage" inline form and the empty state. No new form needed.
- `lib/plz-city.ts` (PLZ→city for form autofill) and `lib/geo.ts` (city→PLZ for Vercel header lookup) serve different purposes and stay separate.
- Static PLZ dataset: a bundled JSON file (e.g. from the open `zuordnung_plz_ort.csv` dataset from Destatis or similar). Should be imported as a module, not fetched at runtime.
