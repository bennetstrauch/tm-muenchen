# TM München – Domain Glossary

## Infoabend
A free, non-binding introductory session (~60 min) where people learn what TM is, how it differs from other techniques, and can ask questions. Offered both online and in-person in Munich. This is the **primary conversion goal** of the landing page — getting visitors to sign up for one.

> Canonical term: **Infoabend** (not "Infovortrag", not "Info-Termin", not "Infovortrag")

## Page structure (confirmed)
Rationale: convince early → remove friction + sign up in the middle → deepen for hesitant visitors late → second-chance CTA at end.

1. **Hero** — emotional headline ("Endlich wirklich abschalten. / Ohne Anstrengung."), single primary CTA, next dates with SVG calendar icon. No bottom brand block ("Transzendentale Meditation" + subtitle removed). "regeneriert tiefer als Schlaf" dropped from hero — belongs in WhyTM/Wissenschaft. Hero is purely benefit-led + action.
2. **Trust-Badges** — 3 visible: "✔ Persönlich unterrichtet · ✔ Einfach und mühelos · ✔ Von Millionen weltweit praktiziert". Remaining 3 ("Keine Konzentration nötig", "Ohne Gedanken stoppen", "400+ wissenschaftliche Studien") hidden behind a plain down-arrow (no text). Arrow does NOT flip. Auto-contracts when badge strip scrolls out of viewport. Zeit-Investment (20 min) NOT here. Long science claim ("meistuntersuchte Technik weltweit") belongs as headline in Wissenschaft section, not as badge.
3. **So läuft der Infoabend ab** (id="infoabend") — directly before Termine; structure: heading → 2 info cards → bullet points. Cards: "Format" (30 Min. · Online) + "Kosten" (Kostenlos & unverbindlich). "vor Ort in München" omitted from card (visible in event listings). Orange subtitle line ("Kostenlos · Unverbindlich · ca. 60 Minuten") removed — redundant with cards. Duration updated from 60 to 30 min.
4. **Nächste Infoabende** — signup section (id="anmeldung")
5. **Für wen?** — pain-point tabs with symptom language + bullets (all except Innere Freude rewritten). Intentionally placed *after* signup so hesitant visitors who skip the form can self-identify and return.
6. **Testimonials** — single featured quote with background image (Jerry Seinfeld placeholder; keep as-is)
7. **Was TM einzigartig macht** — WhyTm section
8. **Was andere sagen** — 6 curated testimonial cards with photo-header design. Sources: nationally known figures from meditation.de (Eckart Stein approval; photos + quotes + translations approved). Cards: portrait photo header, quote, expandable "Mehr lesen" for long quotes, small source link where available. Carousel: 1 per slide mobile, 2 per slide desktop. Trustpilot badge removed entirely. Content hardcoded in `content.ts` + `messages/{locale}.json`. People: Gottfried Vollmer, Karin Pirc (Ärztin), Hugh Jackman (Schauspieler), Dr. Wolfgang Schachinger (Arzt), Michel Hubert (Bankdirektor i.R.), Paul McCartney (Musiker). Future: München community quotes; admin request flow for new testimonials.
9. **CenterBanner** — center info
10. **Wissenschaft & Forschung** (id="wissenschaft") — CountUp animated stats (700+ Studien, 10 Mio+ Praktizierende, 50 Jahre Forschung) + institution logo strip (Stanford Medicine, Yale School of Medicine, Harvard Medical School, NIH) each linking to a representative study. Deferred: animated bar charts (anxiety 2×, cortisol −30%, hospital −56%); interactive study cards grid.
11. **Teachers** (id="lehrer") — personal trust
12. **So funktioniert es** (id="wie-es-funktioniert") — "what happens after the Infoabend"; for hesitant visitors who scroll past signup
13. **Abschluss-CTA** (id="abschluss-cta") — "Finde heraus, ob TM zu dir passt"

## Theme
A themed variant of the landing page targeting a specific audience segment via a distinct hero headline, subtitle, images, and ForWhom default tab. Each theme has its own URL slug.

Theme design principle: **pain-point language for ad targets** (what the visitor suffers), **outcome language for seekers** (what TM gives). `/depression` slug is too clinical — retired.

What a theme changes:
- Hero headline, subtitle, images (images may be reused across themes — visitor scrolls down and won't notice)
- Pre-selected ForWhom tab (matching the theme's pain point)
- Potentially: a theme-specific study highlight in the Wissenschaft section

What a theme does NOT change: page structure, sections, copy outside the hero.

Theme-switching arrows in the hero exist but are rarely used — real visitors scroll down. Themes are primarily for routing different ad audiences to the right entry point.

Target theme set (confirmed):
- `/` → stress — "Endlich wirklich abschalten." (primary ad target)
- `/schlaf` → Schlaf & Regeneration
- `/fokus` → Fokus & Klarheit  
- `/erschoepfung` → Emotionale Erschöpfung (replaces `/depression`)
- `/angst` → Angst & innere Unruhe
- `/innere-freude` → Innere Freude (outcome-oriented; test as ad target)

## Ad targeting
Primary ad audience: **Stress/Überlastung** (broadest funnel, universal pain point) → lands on `/`
Secondary audiences via theme variants (TBD slugs)
"Innere Freude" to be tested as ad target alongside Stress.

## Navigation (hamburger menu)
Hamburger menu stays on the landing page. Rationale: existing meditators who land on `/` need to find `/events`; ad visitors rarely click hamburger menus. The `/events` link stays as the last item. Only change needed: rename "Nächste Infovorträge" → "Nächste Infoabende" in nav copy.

## Conversion hypothesis
Two root causes for low conversion from Instagram ads:
- **Trust gap (A):** Page doesn't convince — visitors doubt and leave
- **Friction gap (B):** Visitors don't know what happens when they sign up; Infoabend format is never explained; CTA unclear

Both apply. B is likely the bigger factor.

## Leiter-Benachrichtigung
Automatic notification email sent to event leader(s) when a new Veranstaltung registration comes in. Triggered in `register-event/route.ts`. Host email resolved via TMW API first-name lookup (hosts field contains first names e.g. "Bennet, Malena"). Non-matched names silently skipped.

Email structure: greeting with leader's first name → registrant details (name, email, phone, TM-Lehrer) → Magic-Link button → sign-off "Dein TM-München-IT-TEAM 😉"

## Magic Link
A time-limited, event-scoped admin access token embedded in the Leiter-Benachrichtigung email. Allows the recipient to view registrations and manage emails for one specific event without logging in.

- Format: HMAC-SHA256 token (payload: eventId + expiry timestamp; secret from env `ADMIN_TOKEN_SECRET`)
- Expiry: 30 days after the event date
- URL: `/admin?tab=anmeldungen&event=<eventId>&token=<token>`
- Scope: single event — Anmeldungen tab (read) + E-Mails tab (read + compose/send), both locked to that event. Other admin tabs still require normal login.
- If token is expired or invalid: show login prompt

## E-Mail Aktion
A stored email sent or scheduled to all registrants of a specific Veranstaltung. Persisted in the "E-Mail Aktionen" Google Sheet tab. Two kinds exist:

- **Benutzerdefiniert** — free-form email composed by an admin or Leiter. Can be sent immediately or scheduled for a future datetime.
- **Erinnerung** — automated reminder derived from the event's `reminder1Hours` / `reminder2Hours` fields. Body text can be overridden per event (`reminderBody1`, `reminderBody2` columns in Veranstaltungen sheet). Scheduled time is calculated from event date/time minus the configured hours offset, but can be manually overridden. Upcoming reminders appear as derived (virtual) entries in the E-Mails tab; a real row is written to E-Mail Aktionen when the reminder is actually sent (sent log).

Canonical term: **E-Mail Aktion** (not "E-Mail", not "Broadcast", not "Kampagne")

## Admin-Komponentenarchitektur

```
admin/page.tsx          — Server component: fetches all data (events, registrations,
                          email actions, vorlagen) via Google Sheets; resolves tenant
                          + auth (session cookie or magic-link token); passes everything
                          as props to AdminClient.

AdminClient             — Single large client component owning all admin state:
                          events[], vorlagen[], mode (list/new/edit). Renders tab bar
                          and delegates to tab sub-components. Holds setEvents so that
                          event edits in the Veranstaltungen tab stay in sync everywhere.

EmailActionsTab         — Owns actions[] state (email actions list). Holds localEvents[]
                          (copy of events prop) so that reminder-hour saves can update
                          the derived-reminders display without a page reload. Also
                          receives registrationsByEvent (Record<eventId, count>) for
                          showing expected recipient counts on pending actions.
                          Mounts ComposeForm when composing/editing.

ComposeForm             — Stateless form for new/edit-action/edit-reminder. Calls:
                            onSaved(action?)   — EmailActionsTab refetches or patches actions[]
                            onEventUpdated(ev) — EmailActionsTab patches localEvents[]
                          Both callbacks are needed: a reminder save changes an event
                          field (reminder hours), not an email action.
```

### Token-header flow (Magic Link / Leiter mode)

`page.tsx` passes `tokenHeader` and `tokenEventId` to AdminClient → EmailActionsTab → ComposeForm. Each component builds a `tokenHeaders` object (`x-admin-token` + `x-admin-token-event`) that is spread into every admin API fetch. Without these headers the proxy gate returns 401 for magic-link sessions.

### registrationsByEvent

Computed in AdminClient from `eventRegistrations[]` (Google Sheets "Veranstaltungen Anmeldungen" tab) as `Record<eventId, count>`. Passed to EmailActionsTab, which shows `~N` for pending email actions before send, and the real `recipientCount` after. Shows `—` when count is 0 (no registrations yet, or migration not done — see ADR 0005).

## E-Mails Tab (Admin)
Top-level admin tab showing all E-Mail Aktionen across all Veranstaltungen, with an event filter dropdown (same pattern as Anmeldungen tab). Displays upcoming automated Erinnerungen (derived from event fields) alongside stored custom emails and the sent log. Leiter see a scoped version via Magic Link (their event only). Entry point for composing new E-Mail Aktionen.

## E-Mail Compose Form
Shared form used for both creating and editing E-Mail Aktionen (custom and reminder overrides). Fields: Veranstaltung (locked when editing), Betreff, Nachricht (plain text, injected into TM München email template with automatic "Hallo [Name]," salutation per recipient), Sendezeit (Jetzt / Planen with datetime picker), Empfänger (read-only count). Optional preview button + mandatory preview/confirmation modal on "Jetzt senden" (server-rendered iframe showing exact email HTML).

## WhatsApp Community

The center runs a **WhatsApp Community** (not a group) for existing meditators to receive event announcements and updates.

Invite link: `https://chat.whatsapp.com/L8cvH1LG3cu5aavhZkte3D`

### Where it appears on the public site

- **Header (TopBar)**: WhatsApp icon shown **only on `/events`** — not on the landing page or theme pages. Instagram icon shown on all pages.
- **`/events` page**: Standalone CTA block below the event list — "Keine Events verpassen — tritt unserer WhatsApp-Community bei."
- **Registration success state** (after event sign-up): Always show WhatsApp join button with copy like "Ankündigungen auf WhatsApp für neue Events erhalten?" — no opt-in checkbox, just a visible CTA the user can ignore.

WhatsApp tracking: no localStorage flag for "already joined" — CTA always shown, small and non-intrusive.

### Admin: WhatsApp post generation

In the Veranstaltungen tab, each event row has a **"WhatsApp-Post erstellen"** button. Clicking expands an inline panel (no page navigation) with:

- Optional admin greeting (top, above title)
- Pre-filled generated post text (editable)
- Optional freetext addition (below the link)
- Grußformel field (default: "Liebe Grüße", editable)
- Leiter names pulled automatically from event `hosts` field

Generated text format:
```
[Optionale Begrüßung]

🧘 [Titel]
[Untertitel, wenn vorhanden]

📅 [Datum], [Uhrzeit] Uhr
📍 [Online / Ort]
[Preis, wenn vorhanden]

Jetzt anmelden:
tm-muenchen.de/events?open=[slug]

[Freitext-Zusatz, wenn vorhanden]

Liebe Grüße,
[Leiter1], [Leiter2]
```

Two action buttons:
1. **"WhatsApp öffnen"** — opens `wa.me/?text=[encoded]`, marks event as posted automatically on click
2. **"Text als E-Mail senden"** — shows resolved Leiter email addresses (same lookup logic as Leiter-Benachrichtigung), sends via Resend, marks as posted on success

**"Als gepostet markieren"** is automatic (no manual button). Posted status stored in Veranstaltungen Sheet as `whatsappPostedAt` column — reserved for future use (e.g. "Update schicken?" prompt when Zeit/Ort changes on a posted event — deferred).

Note: WhatsApp messages are plaintext — no hidden link text possible. Event URL is always visible; use the clean slug format `tm-muenchen.de/events?open=[slug]`.

## Instagram

Handle: `https://www.instagram.com/muenchentranszendiert`

Instagram icon shown in TopBar on **all pages** (landing page, theme variants, `/events`).

## Meta Pixel
Client-side ad-conversion tracking for Instagram/Facebook campaigns. Pixel ID: `2767733383607726`.

Fires three standard events:
- `PageView` — on every page load after consent
- `ViewContent` — when a visitor opens the Infoabend registration form (Anmelden button clicked)
- `Lead` — when a registration is successfully submitted

**Consent**: Pixel only loads after explicit opt-in via the Cookie-Banner. Consent stored in `localStorage` key `tm_cookie_consent`. Not loaded on admin pages (consistent with Vercel Analytics exclusion).

**Cookie-Banner**: Custom bottom-bar component (no external CMP library). One sentence of copy + "Akzeptieren" / "Ablehnen" buttons. Styled in the site's blue/gold theme. Shown only on first visit; subsequent visits read localStorage directly.

## Sprachen (i18n)

Supported locales: **DE** (source, no URL prefix), **EN** (`/en`), **FR** (`/fr`), **ES** (`/es`). Per-center configurable in Phase 2 (multi-tenancy).

Locale priority on first visit: `localStorage` key `tm_locale` → `Accept-Language` browser header → `de`.

URL slugs for theme pages remain German across all locales (e.g. `/en/schlaf`, not `/en/sleep`).

### TM abbreviation per locale
The abbreviation "TM" is locale-specific — every standalone "TM" string must use an i18n key:
- DE/EN: **TM**
- FR/ES: **MT** (Méditation Transcendantale / Meditación Trascendental)

### Translation architecture
- **Static strings**: next-intl JSON files (`/messages/de.json` is source of truth; `en.json`, `fr.json`, `es.json` are auto-generated).
- **Translation engine**: Claude API. Follows `translation-glossary.json` for TM-specific terms.
- **Auto-translation**: GitHub Action on push to `main` when German strings change. Detects delta vs. `de.snapshot.json`, translates only changed keys, commits back directly.
- **Lock file**: `translation-locks.json` — keys listed here are never auto-overwritten.
- **Dynamic content** (teacher bios, TMW API event text): translated via Claude API and persisted in Supabase `translation_cache` table (keyed by SHA-256 of source text + locale). Cache hit = no API call.

### Teacher language filter
Each teacher can have up to 4 teaching languages, stored in Supabase `teacher_languages` table (not from TMW API). When a visitor views the site in locale X, only teachers who teach in X are shown. Fallback: if no teacher matches, all teachers are shown. Teacher language assignment and per-locale bio overrides are managed in the Admin "Lehrer" tab.

### Language switcher
Globe icon in the TopBar, to the RIGHT of the hamburger menu icon (both on the left side of the header). Opens an inline dropdown of active locales. Selecting a locale navigates to the locale-prefixed URL and writes `tm_locale` to `localStorage`.

### Admin tabs added for i18n
- **Lehrer**: assign teaching languages per teacher, edit bio override per locale.
- **Einstellungen**: choose active locales for this site, WhatsApp toggle + link, contact info.

### End-to-end language flow

```
Visitor arrives
  → locale resolved: localStorage(tm_locale) → Accept-Language → "de"
  → next-intl middleware rewrites URL to [locale] segment
  → page rendered in resolved locale

Static UI strings
  → next-intl reads /messages/{locale}.json at render time
  → de.json is source of truth; EN/FR/ES auto-translated by GitHub Action on push

Dynamic content (teacher bios, event descriptions from TMW API)
  → lib/translate.ts: SHA-256(source text + locale) → Supabase translation_cache lookup
  → cache hit → return cached translation (no API call)
  → cache miss → Claude API → store in cache → return

Teacher section
  → getTeachers(locale) fetches TMW API → deduplicates by name
  → queries Supabase teacher_languages WHERE locale = X
  → if rows exist: filter to matching teachers + apply bio_override where set
  → if no rows: show all teachers (fallback)
  → bios translated via translation_cache (after filter, before render)
  → teachers shuffled randomly on each ISR cycle (no single teacher always first)

Visitor registers for Infoabend
  → locale sent in POST body to /api/register
  → confirmation + reminder emails rendered in that locale (locale-keyed string map in lib/email.ts)
  → locale appended as column H in Google Sheets "Info Anmeldungen"
  → reminder scheduled via Resend for 9:00 AM Munich time the day before

WhatsApp button (TopBar)
  → visibility controlled by Supabase settings row (tenant = "muenchen") → whatsapp_enabled
  → link URL: whatsapp_link from settings, falling back to content.ts default

⚠️  active_locales is stored in Supabase settings but NOT yet wired to the locale switcher
    or middleware. The switcher still shows all locales from routing.ts. Wiring requires
    middleware changes — deferred to Phase 2.
```

## Multi-Tenancy (Phase 2)

Deployment model: single Vercel deployment, multi-tenant by hostname. Next.js middleware resolves hostname → tenant config. Design updates deploy once and affect all centers simultaneously. See ADR 0004.

### Tenant

A TM center running on this platform. Identified by a short text slug (e.g. `muenchen`, `berlin`) which is the primary key of the `tenants` table. Externally identified by hostname (`tm-muenchen.de`, `tm-berlin.de`, any domain format). The slug is also used for TMW API city lookup, hero/CenterBanner image selection, and filtering all tenant-scoped Supabase rows.

### Tenant config (`tenants` table)

Replaces the Phase 1 `settings` table. One row per center:

```
tenant                       text  PK  (slug, e.g. 'muenchen')
hostname                     text      (e.g. 'tm-muenchen.de')
admin_password_hash          text
active_locales               text[]
whatsapp_enabled             bool
whatsapp_link                text
contact_email                text
contact_phone                text
from_email                   text      (Resend sender address for Veranstaltungen emails only)
instagram_link               text      (default: https://www.instagram.com/tmdeutschland)
city                         text      (display name, e.g. 'München')
center_image_url             text      (nullable; falls back to München default)
tmw_center_ids               int[]     (TMW API center IDs for this tenant)
impressum_content            text      (free text; legal entity varies — Verein, individual, etc.)
logo_url                     text      (nullable; overrides /tm-logo.svg in TopBar)
logo_label                   text      (nullable; overrides "map pin + city" in TopBar — if set, map pin is hidden)
infoabend_duration_minutes   int       (default 30; InfoabendPreview formats as "X Min.")
show_teachers                bool      (default true; if false, Teachers section is not rendered)
center_banner_label          text      (nullable; overrides "TM CENTER {city}" eyebrow in CenterBanner)
```

Unknown hostnames redirect to `tm-muenchen.de`. Local dev resolves tenant via `DEV_TENANT` env var.

### Auth

One hashed password per tenant row. Admin logs in at their own domain's `/admin` — tenant is implicit from hostname, no username needed. Super-admin (Bennet) accesses `/super-admin` via `SUPER_ADMIN_PASSWORD_HASH` env var. See ADR 0006.

### Tenant threading

`middleware.ts` sets `x-tenant` request header. `getCurrentTenant()` in `lib/tenant.ts` reads it and fetches the full tenant row from Supabase, wrapped in React `cache()` for per-request memoization (one DB call per request regardless of how many components call it).

### Data isolation

All operational data tables include a `tenant` column. Queries always filter `WHERE tenant = current_tenant`. Center admins see only their own data. Super-admin sees across all tenants via a tenant filter.

Affected tables: `veranstaltungen`, `anmeldungen`, `info_anmeldungen`, `vorlagen`, `teacher_languages`. See ADR 0005 for the migration of Veranstaltungen and Anmeldungen from Google Sheets.

### Registration data model

Two distinct registration types with separate storage:

| Type | Route | Primary | Secondary |
|---|---|---|---|
| **Infoabend** | `/api/register` | TMW API (system of record) | Supabase `info_anmeldungen` (platform metadata) |
| **Veranstaltungen** | `/api/register-event` | Supabase `anmeldungen` | — |

**`info_anmeldungen`** is a full backup of each Infoabend registration plus platform metadata. Write to TMW is primary and fatal; Supabase write is secondary and non-fatal. Google Sheets logging is removed once this table is live. Fields: `tenant`, `locale`, `has_consent`, `meta_pixel_event_id`, `tmw_registration_id` (returned by TMW on booking), `name`, `email`, `phone`, `event_date`, `event_time`, `event_type`, `source` (hostname), `news_subscribed`, `created_at`.

**`anmeldungen`** is the system of record for Veranstaltungen registrations (internal center events not managed in TMW). Fields: `tenant`, `event_id`, `event_title`, `event_date`, `name`, `email`, `phone`, `tm_lehrer`, `datum_erlernen`.

**Migration status (as of 2026-06-17):**
- `veranstaltungen` → ✅ Supabase
- `vorlagen` → ✅ Supabase
- Veranstaltungen `anmeldungen` → ✅ Supabase
- Infoabend registrations → 🔄 in progress (TMW Write-Access granted; `info_anmeldungen` table + form wiring pending)

## Infoabend Registration Flow

Registration form fields (single step): **Name** (single field), **E-Mail**, **Telefon** (optional), **Newsletter-Checkbox** (unchecked by default).

On submit, `/api/register`:
1. Splits Name on first space → `first_name` + `last_name` (empty string if no space; fallback `"-"` if TMW rejects empty)
2. Derives `zip_code` from Vercel `x-vercel-ip-city` header via hardcoded city→PLZ map; `""` for unknown cities
3. Reads `source` from `host` request header (e.g. `"tm-muenchen.de"`)
4. Calls TMW `POST /api/booking` with `lecture` PK, `seats: 1`, `first_name`, `last_name`, `email`, `phone`, `zip_code`, `source`, `news_subscribed` — **fatal if this fails**
5. Writes full snapshot to Supabase `info_anmeldungen` — non-fatal
6. Fires CAPI Lead event — non-fatal

TMW handles all Infoabend confirmation, reminder, and Leiter-Benachrichtigung emails automatically. Resend is not used for Infoabend registrations.

### Teachers (multi-tenant)

`teacher_languages` table gains a `tenant` column: `(tenant, teacher_name, locale, bio_override)` with PK `(tenant, teacher_name, locale)`. Teachers are sourced from the TMW API using the tenant's `tmw_center_ids`. The admin Lehrer tab shows all teachers returned by the API for this tenant's center IDs; language assignments and bio overrides are stored in `teacher_languages`.

### TMW center ID discovery

When onboarding a new center, Bennet enters `tmw_center_ids` manually in the super-admin UI. A "Test" button verifies the IDs by hitting `https://tmw.meditation.de/api/center/{id}` and showing **upcoming lecture count + teacher names** per ID, or an error if the ID is invalid. Discovery (city name → ID lookup) is a separate script (`scripts/find-tmw-center.ts`), not part of the UI.

### Landing page content

Shared across all tenants — hero copy, section text, and testimonials are not per-tenant. CenterBanner uses `tenants.city` for the city name and `tenants.center_image_url` for the image (falls back to München default).

### Super-admin

Route: `/super-admin`. Protected by `SUPER_ADMIN_PASSWORD_HASH` env var (not in the `tenants` table — super-admin manages the tenants table, so storing the hash there would be circular). Allows Bennet to create and edit tenants (all `tenants` fields) and onboard new centers without code changes.

UI: login → tenant list → single create/edit form (all fields, required fields marked). After save: redirect to tenant list. `active_locales` shown as checkboxes; `tmw_center_ids` as comma-separated text input. Blank password on edit preserves the existing hash.

Hash generation: `npm run hash-password <password>` (uses `bcryptjs`; output is pasted into Vercel env vars).

### Session auth

`lib/admin-session.ts` uses a generic `subject: string` — either a tenant slug (center admin) or `'super-admin'`. Functions: `createSession(subject)` / `verifySession(token, subject)`. Cookie names: `admin-session` (center) and `super-admin-session` (super-admin). Both protected in the proxy middleware.

### Email sending (multi-tenant)

One shared Resend account managed by Bennet. Resend Free Tier allows only 1 verified sender domain — per-center domains are not viable without a paid plan.

**Decided strategy:** minimal Resend usage — only for emails TMW does not cover.

Email responsibilities after TMW Write-Access integration:

**Clean split:** TMW owns all Infoabend email communication; Resend owns all Veranstaltungen email communication.

| Email type | Sender |
|---|---|
| Infoabend Bestätigung | TMW (automatic on registration write) |
| Infoabend Erinnerung | TMW (automatic on registration write) |
| Infoabend Leiter-Benachrichtigung | TMW (automatic on registration write) |
| Veranstaltungen Bestätigung | Resend (us) |
| Veranstaltungen Erinnerung | Resend (us) |
| Veranstaltungen Leiter-Benachrichtigung | Resend (us) — Magic Link email |

Once TMW Write-Access is live, `/api/register` drops all Resend calls entirely.

For Resend (Veranstaltungen emails only): single shared sender domain for all tenants — volume is too low to justify per-tenant domains. Candidate: `meditation.de` subdomain (pending admin approval) or a neutral platform domain (~10 €/year).

`tenants.from_email` stores the Resend sender address per tenant, used only for Veranstaltungen emails.

## Footer

A slim footer shown on the landing page and all theme variants (site layout), but **not** on `/events`. Contains three things:

1. **Nationale Website** — text link + button to `meditation.de` ("Erfahre mehr über TM auf unserer nationalen Website" / "Zur nationalen Website")
2. **Legal links** — Impressum · Datenschutz
3. **Vereinsname** — "Transzendentale Meditation München e.V."

Design principle: clean and minimal — one row on desktop, stacked on mobile.

## Impressum

Static German-language page at `/impressum` (under `[locale]` routing). Content is hardcoded German — not run through the i18n/auto-translate system, as it is a legal text specific to German law. A notice is shown when `locale !== 'de'` informing the visitor the page is only available in German.

Legal entity: **Transzendentale Meditation München e.V.**
Address: Guldenstraße 47, 80639 München
1. Vorsitzender: Christoph Fereber
2. Vorsitzender: Wolfgang Arden
Registergericht: Amtsgericht München (VR-Nummer: [Placeholder — to be filled in])
Contact: +49 163 7354 836 · info@tm-muenchen.de

In Phase 2 (multi-tenancy), these fields move to Supabase `tenants` table.

## Datenschutz

Static German-language page at `/datenschutz`. Same locale-notice behaviour as Impressum. Covers:
- Anmeldeformular (Infoabend registration) — currently stored in Google Sheets; will migrate to TMW API (primary) + Supabase `info_anmeldungen` (secondary) once TMW Write-Access is granted
- Supabase (teacher data, settings, translation cache)
- Vercel (hosting)
- Meta Pixel (only after cookie consent)

Google Sheets section can be removed once registration data is fully migrated to Supabase.
