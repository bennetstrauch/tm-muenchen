# TM München – Domain Glossary

## Infoabend
A free, non-binding introductory session (~60 min) where people learn what TM is, how it differs from other techniques, and can ask questions. Offered both online and in-person in Munich. This is the **primary conversion goal** of the landing page — getting visitors to sign up for one.

> Canonical term: **Infoabend** (not "Infovortrag", not "Info-Termin", not "Infovortrag")

## Baum des Lebens
An interactive tree visualization of TM benefits, planned as a separate page (`/lebensbaum`). The tree is the main navigation metaphor: trunk = TM technique, roots = tradition/teaching, earth = pure consciousness (spirituality), 4 main branches = benefit domains (Geistiges Potenzial, Gesundheit, Beziehung/Sozialverhalten, Gesellschaft/Weltfrieden), leaves = specific subtopics (e.g. Herz-Kreislauf, Angst, Burnout).

**Narrative entry sequence (Phase 1):**
1. Withered tree on screen with question: *„Was braucht dieser Baum, um wieder aufzublühen?"*
2. User chooses from 3 options — only **„Wurzeln wässern"** (alt: „Wurzeln gießen") works; the two distractors **„Äste reparieren"** and **„Blätter besprühen"** yield no result
3. Bloom animation plays — tree comes alive
4. Short text line lands the message (e.g. „TM versorgt die Wurzel deines Lebens")
5. Two paths: primary CTA „Infoabend entdecken" + secondary „Entdecke die 4 Lebensbereiche ↓"

**Phase 2:** Clickable branches (4 Lebensbereiche) + subtopic leaves become explorable after bloom.

**Phase 3 (Vision):** Detail pop-ups per topic with scientific studies; life-energy slider; flowing sap animation.

**Animation approach:** Sequential bottom-up — roots → trunk → branches → leaves, ~1–2s per layer. The sequence *is* the metaphor (user literally sees the root supplying everything).

**SVG asset spec (for artist):** One Illustrator file, separate layers/groups: Erde/Boden · Wurzeln · Stamm · Ast 1 (Geistiges Potenzial) · Ast 2 (Gesundheit) · Ast 3 (Soziale Beziehungen) · Ast 4 (Gesellschaft/Weltfrieden) · Blätter · Früchte. Two colour states per layer: withered (brown/grey) and bloomed (green/warm) — as separate layers or named swatches. Art direction: organic/illustrative (not icon-style). Draw directly in Illustrator on Lenovo touchscreen.

**Tech approach:** Illustrative SVG — looks like art, technically interactive. Two SVG states (withered + bloomed) animated with CSS/JS per layer group.

**i18n:** All text on `/lebensbaum` (question, 3 choice labels, post-bloom message, CTAs) uses the standard i18n system (DE source, auto-translated to EN/FR/ES by GitHub Action). The SVG artwork is language-neutral — no text embedded in the SVG itself.

MVP scope: Phase 1 narrative sequence only. Branches, leaves, and everything beyond are deferred.

> Canonical term: **Baum des Lebens** (not "Tree of Life", not "Lebensbaum" as a term — the route is `/lebensbaum` but the concept is "Baum des Lebens")

## /entdecken
A route that duplicates the existing landing page (`/`) with a redesigned hero. Purpose: test the new hero concept without touching the primary conversion page. Strategy: validate on `/entdecken`, then switch `/` if it outperforms.

**Hero differences vs. `/`:**
- Background: `tm-waves.mp4` looping video (wavy water animation, from Lorenzo project) with dark gradient overlay
- TopBar: starts fully transparent (white logo/text) over the video; transitions to current blue + opaque on scroll (`window.scrollY > 10`, 250ms transition)
- Headline (i18n-aware): DE — *"Entdecke, wie eine einfache Entspannungstechnik alle Bereiche deines Lebens verbessern kann."*
- CTA (MVP): single button — **"Infoabend entdecken"** → scrolls to Anmeldeformular
- "Interaktive Tour starten" button: hidden until `/lebensbaum` is live

**Everything below the hero**: identical to `/`.

**Implementation (shipped 2026-06-23):**
- Route: `src/app/[locale]/(entdecken)/entdecken/page.tsx` — own route group so it gets a separate layout without affecting `(site)` pages
- `components/entdecken-hero.tsx` — client component: looping `<video>`, gradient overlay, i18n headline + CTA
- Transparent TopBar: `ScrollHeader` (`top-bar/scroll-header.tsx`) is a thin client wrapper around `<header>`; it attaches a scroll listener only when `transparent={true}` and exposes `data-transparent` on the element. Sub-components (NavMenu, TopBarLogo, ContactButtons) use `group-data-[transparent=true]:` Tailwind variants for white colouring — no JS, no props on those components.
- `SiteShell` (`components/site-shell.tsx`) holds the shared layout (TopBar + NavPanel + Footer + StickyCta + CookieBanner). Both `(site)/layout.tsx` and `(entdecken)/layout.tsx` are one-liners that call it; the only difference is `transparentBar={true}` on the latter.
- `PageClient` gained an optional `heroSlot` prop — passing `null` suppresses the built-in Hero so `EntdeckenPage` can render `EntdeckenHero` above it and reuse everything else unchanged.
- Copy: `Entdecken.headline` and `Entdecken.cta` live in `de.json` and are included in the copy-subset → editable by Jochen via the Texte tab.

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

### Hero images

Configured in `src/content.ts`. Each theme has an `images: HeroImage[]` array; currently all themes share `STRESS_IMAGES`. One image is picked randomly per page load.

`HeroImage.focus` is CSS `object-position` (e.g. `"50% 45%"`). The hero is `min-h-[100dvh]` with `object-cover`, so the crop differs significantly between mobile (portrait) and desktop (landscape) — focus must be set to keep the subject visible in both. On mobile, left/right edges get cut; on desktop, top/bottom get cut.

**Current pool** (`STRESS_IMAGES`, `src/content.ts`): stock photos 3, 4, 5, 8, 9 + all 11 meditator photos from `/hero/ourmeditators/`. Stock 6 and 10 are commented out (missing from disk); 12 and 15 removed.

**Future: per-theme image sets.** The `images` field already supports per-theme arrays (e.g. `innere-freude` already has its own). When there are enough photos, give each theme its own curated set — e.g. `schlaf` → calm/night/rest images, `angst` → open/nature/stillness, `innere-freude` → joyful/warm. The meditator photos in `/hero/ourmeditators/` are a good source to draw from once themes are differentiated.

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

Email structure: greeting with leader's first name → registrant details (name, email, phone, TM-Lehrer) → Magic-Link button → sign-off "Dein [centerName] IT-Team 😉" (centerName from `tenant.center_banner_label ?? \`TM Center ${tenant.city}\``)

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
Shared form used for both creating and editing E-Mail Aktionen (custom and reminder overrides). Fields: Veranstaltung (locked when editing), Betreff, Nachricht (plain text, injected into center email template with automatic "Hallo [Name]," salutation per recipient; sign-off and footer use `centerName` / `contactPhone` from tenant config), Sendezeit (Jetzt / Planen with datetime picker), Empfänger (read-only count). Optional preview button + mandatory preview/confirmation modal on "Jetzt senden" (server-rendered iframe showing exact email HTML).

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
Client-side ad-conversion tracking for Instagram/Facebook campaigns. Pixel ID is per-tenant, stored in `tenants.meta_pixel_id` (nullable — tenants with no pixel ID skip the cookie banner and CAPI entirely). Known values: `muenchen` → `2767733383607726`, `deutschland` → `1114987708855861`.

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
  → hidden if show_meditators_section = false OR whatsapp_link is blank
  → link URL: whatsapp_link from tenants row (no fallback — blank = hidden)

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
whatsapp_enabled             bool      (shows WhatsApp icon in top-bar contact buttons)
whatsapp_link                text      (community/group join URL; null = hide WhatsApp sections entirely)
whatsapp_number              text      (nullable; wa.me link target — falls back to contact_phone when null)
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
show_meditators_section      bool      (default true; if false, Veranstaltungen section hidden, /events redirects to /, WhatsApp CTA hidden)
```

Unknown hostnames redirect to `tm-muenchen.de`. Local dev resolves tenant via `DEV_TENANT` env var.

### Auth

One hashed password per tenant row. Admin logs in at their own domain's `/admin` — tenant is implicit from hostname, no username needed. Super-admin (Bennet) accesses `/super-admin` via `SUPER_ADMIN_PASSWORD_HASH` env var. See ADR 0006.

### Tenant threading

`middleware.ts` sets `x-tenant` request header. `getCurrentTenant()` in `lib/tenant.ts` reads it and fetches the full tenant row from Supabase, wrapped in React `cache()` for per-request memoization (one DB call per request regardless of how many components call it).

### Data isolation

All operational data tables include a `tenant` column. Queries always filter `WHERE tenant = current_tenant`. Center admins see only their own data. Super-admin sees across all tenants via a tenant filter.

Affected tables: `veranstaltungen`, `anmeldungen`, `info_anmeldungen`, `info_anfragen`, `vorlagen`, `teacher_languages`. See ADR 0005 for the migration of Veranstaltungen and Anmeldungen from Google Sheets.

### Registration data model

Three distinct registration types with separate storage:

| Type | Route | Primary | Secondary |
|---|---|---|---|
| **Infoabend** | `/api/register` | TMW API (system of record) | Supabase `info_anmeldungen` (platform metadata) |
| **Individueller Info-Termin** | `/api/info-anfrage` | TMW API for DE; Supabase for all | Emails via Resend |
| **Veranstaltungen** | `/api/register-event` | Supabase `anmeldungen` | — |

**`info_anmeldungen`** is a full backup of each Infoabend registration plus platform metadata. Write to TMW is primary and fatal; Supabase write is secondary and non-fatal. Fields: `tenant`, `locale`, `has_consent`, `meta_pixel_event_id`, `tmw_registration_id` (returned by TMW on booking), `name`, `email`, `phone`, `event_date`, `event_time`, `event_type`, `source` (hostname), `news_subscribed`, `created_at`.

**`info_anfragen`** stores individual appointment requests. Fields: `tenant`, `locale`, `name`, `email`, `phone`, `message` (availability note), `source`, `tmw_registration_id`, `news_subscribed`, `city`, `created_at`. Supabase write is non-fatal.

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

## Individueller Info-Termin

A flow for visitors who want a personal appointment rather than a group Infoabend. Triggered by "Individuellen Termin anfragen" in the events section — an inline-expanding form (no page navigation) with fields: Name, E-Mail, Telefon (optional), Verfügbarkeit free-text (optional), Newsletter-Checkbox.

On submit, `POST /api/info-anfrage`:
1. Validates name + email — 400 if missing
2. Splits name + derives zip_code from Vercel city header
3. **DE locale only**: calls TMW `POST /api/infobooking` via `requestInfoTermin()` — fatal if fails. TMW sends their own confirmation email to the visitor.
4. Writes to `info_anfragen` — non-fatal
5. Sends center notification email (always, German) to `tenant.contact_email` via Resend
6. **Non-DE locales only**: sends warm user confirmation email in visitor's locale via Resend. DE skipped because TMW already sends one.

`IndividualAppointment` component in `events.tsx` appears in two places: empty-events state and below the event list. State machine: `idle | submitting | success | error`, same pattern as `RegistrationForm`.

Email strings for this flow live in `lib/email-info-anfrage.ts` (inline string map, same pattern as `lib/email.ts`). TMW infobooking client: `lib/tmw-infobooking.ts` → `requestInfoTermin()`. Data layer: `lib/info-anfragen.ts` → `insertInfoAnfrage()`.

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
| Info-Anfrage Bestätigung (DE) | TMW (automatic via infobooking API) |
| Info-Anfrage Bestätigung (EN/FR/ES) | Resend (us) — warm/personal tone |
| Info-Anfrage Center-Benachrichtigung | Resend (us) — always, German |
| Veranstaltungen Bestätigung | Resend (us) |
| Veranstaltungen Erinnerung | Resend (us) |
| Veranstaltungen Leiter-Benachrichtigung | Resend (us) — Magic Link email |

Once TMW Write-Access is live, `/api/register` drops all Resend calls entirely.

For Resend (Veranstaltungen emails only): single verified sender domain **`post.meditation.de`** shared across all tenants. **Status: verified ✓ (2026-06-19)**. Resend domain id: `8d9af522-05f2-4f53-9e25-e840043d2cba`, region eu-west-1.

DNS records at Alfahosting (all verified):
| Typ | Name | Wert | Priorität |
|-----|------|------|-----------|
| TXT | `resend._domainkey.post` | `p=MIGfMA0GCSqGSIb3DQEBAQUAA4GNADCBiQKBgQDZmc3oMJG+cuz64AWnM1d+qIYBpakG973NeXIsmzet+jBeQiS3u45nbfmS+bNiYszCIJIjoTdDvVEb8BwVcSK4kjJJVeGCf8z9325blCmyjnwcMCi7O9+frF5SpsJhFSRIdBitGjpJ41IMxHo4FKShBZkc2YevQJ4iljYfkk9Y+QIDAQAB` | — |
| MX | `send.post` | `feedback-smtp.eu-west-1.amazonses.com` | 10 |
| TXT | `send.post` | `v=spf1 include:amazonses.com ~all` | — |

Tenant `from_email` values (set 2026-06-19):
- `muenchen` → `TM München <muenchen@post.meditation.de>`
- `freiburg` → `TM Freiburg <freiburg@post.meditation.de>`
- `deutschland` → `TM Deutschland <deutschland@post.meditation.de>`

All Resend `emails.send()` calls include `replyTo: tenant.contact_email` (camelCase — the Resend v6 SDK maps this to the `Reply-To` header; snake_case `reply_to` is silently ignored). Affected files: `register-event/route.ts`, `admin/email-send/route.ts`, `cron/send-emails/route.ts`, `admin/whatsapp-email/route.ts`.

**Forwarding safeguard (planned, not yet implemented):** Replies to `{slug}@post.meditation.de` that bypass Reply-To (e.g. from email clients that ignore it) currently go nowhere — the `send.post.meditation.de` MX record is for SES bounce feedback, not a real inbox. Future: add MX for `post.meditation.de` → ImprovMX, automate alias creation (`{slug}@post.meditation.de → contact_email`) via ImprovMX API when a tenant is created or their `contact_email` changes. Blocked on ImprovMX account setup. See issue #87.

Why `post.meditation.de` and not `info.meditation.de`: `info.meditation.de` is the national tenant's Vercel hostname (CNAME), which conflicts with MX records in DNS. `post.meditation.de` is a dedicated mail subdomain with no CNAME. Both `info.meditation.de` and `tm-muenchen.de` removed from Resend.

`tenants.from_email` stores the Resend sender address per tenant, used only for Veranstaltungen emails. Format: `"TM {City} <{slug}@post.meditation.de>"` (Resend supports display-name format). Example: `TM München <muenchen@post.meditation.de>`. Tenants without a meditators section (e.g. `deutschland`) leave `from_email` blank.

## Copy-Editor

A tenant admin who reviews and edits global landing page copy. Currently: Jochen (Freiburg center admin, TM teacher). Copy edits are global — they affect all tenants because `de.json` is shared.

The admin "Texte" tab exposes a curated **copy subset** (defined in `copy-subset.ts`) — the sections of `de.json` a copy editor would legitimately change (e.g. ForWhom descriptions, WhyTm benefits, HowItWorks steps, Entdecken hero). UI chrome, aria labels, and format strings are excluded. Adding a new section to the editable subset requires a deliberate code change.

The Texte tab is **only visible to tenants with `can_edit_copy = true`** (a column in the `tenants` table, default false). Currently only Freiburg has this enabled. This prevents other center admins from accidentally editing global copy.

On save, the admin commits the updated `de.json` via GitHub API → auto-translate Action fires → EN/FR/ES updated automatically. See ADR 0008.

## Visuelle Textbearbeitung (geplant)

Two problems with the current Texte tab:

1. **Coverage gap** — not all content keys in `de.json` are exposed in the form (section headings, Wissenschaft section, InfoabendPreview, TrustBadges, etc.). Fixed by extending `copy-subset.ts` — no new UI.

2. **Discovery gap** — Jochen can see text on the page and want to change it, but can't find the matching field in the form without memorising the structure.

### Decided approach: split-view with click-to-highlight (MVP)

A "Vorschau" toggle in the Texte tab opens a split layout: form on the left, live site iframe on the right. Clicking text on the page (b2 direction) scrolls the form to the matching field and highlights it. Editing still happens in the form — not inline.

**Why not true inline editing (click-on-page → edit right there):** `useTranslations()` returns plain strings, not React elements. Making strings clickable inline would require replacing every `{t('key')}` JSX call with `<EditableText k="key" />` across ~30 component files, most of which are server components. That's a 5–10 day refactor justified only if more copy editors are added.

**Why not a library (Puck, Builder.io, TinaCMS, Sanity overlays):** All require migrating to a different CMS model. We'd still build the editing layer ourselves; the library just adds a migration cost.

### MVP implementation plan (when built)

1. Texte tab gets a "Vorschau anzeigen" toggle button
2. Toggle opens a split layout: form (left, ~40%) + iframe (right, ~60%)
3. Iframe loads the landing page with a `?tm-preview=<token>` query param
4. Middleware detects the param (token = current admin session hmac), injects a small `<script>` before `</body>`
5. The injected script:
   - Fetches current de.json values from `/api/admin/texte`
   - Builds a reverse map `{ textValue → i18nKey }`
   - Scans the DOM for text nodes matching known copy-subset values
   - Wraps matches in `<span data-tm-key="...">` with subtle hover outline
   - On click, fires `window.parent.postMessage({ type: 'tm-select', key }, '*')`
6. Texte tab listens for `postMessage`, scrolls to + highlights (yellow flash) the matching `<textarea>` or `<input>`
7. Iframe is same-origin → postMessage unrestricted

**Auth:** only visible to tenants with `can_edit_copy = true`, same as the Texte tab itself. The `?tm-preview` token is verified by the existing admin session.

**Fragility note:** Text matching works well for long unique German sentences (most copy-subset values). Short strings (button labels, single words) may not be unique enough to match reliably — those fields would simply not be clickable, but the form is still there as fallback.

**Non-goal:** real-time preview (iframe does not update as you type — only after save). Rich text editing. Per-tenant copy overrides. Structural page editing (layout, sections, images).

## Copy-Änderungsbenachrichtigung

An automated email sent to the copy editor (Jochen) when `de.json` changes on `main` via a push that was NOT made by the copy editor or the auto-translate bot. Lists changed strings as old → new pairs in German. Sent via Resend. Triggered by a GitHub Action (separate from translate.yml).

Purpose: keeps Jochen informed when Bennet adds new sections or rewrites existing copy, so he can review it for accuracy and tone.

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

For other tenants, the full content is overridden via `tenant.impressum_content` (HTML or plain text). The fallback `MuenchenImpressum` component is München-specific. Contact email uses `tenant.contact_email`. Page title is dynamic via `generateMetadata`.

## Datenschutz

Static German-language page at `/datenschutz`. Same locale-notice behaviour as Impressum. Covers:
- Anmeldeformular (Infoabend registration) — currently stored in Google Sheets; will migrate to TMW API (primary) + Supabase `info_anmeldungen` (secondary) once TMW Write-Access is granted
- Supabase (teacher data, settings, translation cache)
- Vercel (hosting)
- Meta Pixel (only after cookie consent)

Google Sheets section can be removed once registration data is fully migrated to Supabase.

Contact email in the body uses `tenant.contact_email`. Page title is dynamic via `generateMetadata`. The address and legal entity ("Transzendentale Meditation München e.V.") remain München-specific — no multi-tenant override pattern yet (unlike Impressum).

## Baum des Lebens — Team & Rollen

### Rollenverteilung

| Person | Hauptverantwortung |
|---|---|
| Bennet | Vision, Nutzerreise, Strategie, Entwicklung |
| Sebastian | Baumlogik, Themenstruktur, Hüter der Metapher |
| Maike | Content-System, Texte, Redaktion (Phase 2+) |
| Schwester | Illustration, Look & Feel — SVG-Artwork |

**Sebastian als "Hüter der Metapher":** Bei jeder neuen Idee die Kontrollfrage: *Unterstützt das noch die Baum-Idee, oder macht es die Geschichte komplexer?* Die ursprüngliche Eleganz (Wurzel = Quelle, Äste = Lebensbereiche) muss durch alle Phasen erhalten bleiben.

**Maike als Content-Architektin (Phase 2):** Aufbau einer strukturierten Content-Datenbank (Google Sheets o.ä.) für alle Blatt-Inhalte:

| Ast | Unterthema | Kurztext | Langtext | Studien | Video |
|---|---|---|---|---|---|
| Gesundheit | Schlaf | … | … | Studie XY | … |

Diese Datenbank speist später die Detailseiten / Pop-ups automatisch.

### Parallelspuren (Phase 1)

Phase 1 (Narrative-Sequenz) braucht **keinen Content-Workshop** — sie ist vollständig spezifiziert. Alles läuft parallel:

- **Schwester**: SVG zeichnen (Brief: organic/illustrative, Ebenen per `layer-*` ID, kein Text eingebettet, zwei Farbzustände — vertrocknet + aufgeblüht). Referenz: `treeOfLife/treeOfLifeDraft.jpg`
- **Agent/Entwickler**: Issues #80 → #81 → #82 sofort umsetzbar
- **Sebastian + Maike**: Workshop für Phase 2 — Inhalte der Äste, Blätter, Studien

Phase 2 benötigt den Workshop **bevor** die Branch-Navigation gebaut wird.
