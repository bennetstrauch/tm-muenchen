## Problem Statement

Visitors to tm-muenchen.de from non-German-speaking backgrounds — including people interested in learning TM who speak English, French, or Spanish — see the entire site in German with no way to switch. Munich's teachers (including Bennet) teach in multiple languages, but the site does not reflect this. Prospective students cannot assess TM in their native language, reducing trust and conversion. Additionally, as TM München prepares to offer this platform to other European centers, multi-language support is a prerequisite.

## Solution

Add full i18n support to the site using next-intl, with German as the authoritative source language and automatic Claude-powered translation into English, French, and Spanish. A language switcher appears in the top bar. Teachers are filtered by teaching language. Transactional emails (Infoabend confirmation + reminder) are sent in the registrant's language. Translation of static content is fully automated via GitHub Actions with a lock file for manually-refined strings.

## User Stories

1. As a prospective student who speaks English, I want to read the entire landing page in English, so that I can understand TM without a language barrier.
2. As a prospective student who speaks French, I want to see the site in French, so that I can decide whether to attend an Infoabend.
3. As a prospective student who speaks Spanish, I want to read all sections of the site in Spanish, so that I feel the offer is made for me.
4. As a visitor, I want the site to automatically display in my browser's default language (if supported), so that I don't have to manually switch on every visit.
5. As a returning visitor, I want the site to remember my language preference, so that I always see the site in my chosen language without re-selecting.
6. As a visitor, I want to switch languages from anywhere on the page, so that I can compare content across languages.
7. As a visitor, I want all navigation menu items to be in my chosen language, so that the experience is consistent.
8. As a visitor, I want the Infoabend dates and times to be presented in my chosen language's date format, so that I can read them naturally.
9. As an English-speaking visitor, I want to see the registration form for an Infoabend in English, so that I can fill it in confidently.
10. As a French-speaking visitor who registers for an Infoabend, I want to receive my confirmation email in French, so that I understand the details.
11. As a Spanish-speaking visitor who registers for an Infoabend, I want to receive my reminder email (the day before) in Spanish, so that I don't miss the session.
12. As a visitor, I want to see TM teacher profiles in my language, so that I can read their bios without language barriers.
13. As an English-speaking visitor, I want to see only teachers who teach in English, so that I know who I can work with.
14. As a visitor whose language has no matching teacher, I want to see all teachers anyway, so that I still get the social proof section.
15. As a visitor, I want to read Trustpilot reviews in my language, so that testimonials feel relevant.
16. As a visitor, I want TM-specific terms like "Méditation Transcendantale" (FR) and "Meditación Trascendental" (ES) to appear correctly in each language, so that the page feels professionally localised.
17. As a visitor, I want the abbreviation "TM" to appear as "MT" in French and Spanish, so that the text reads correctly in those languages.
18. As an admin, I want to assign teaching languages to each teacher, so that the site filters correctly per locale.
19. As an admin, I want to edit each teacher's bio per language, so that I can override poor automatic translations with better copy.
20. As an admin, I want to choose which languages are active on the site, so that I can launch with DE+EN first and add FR/ES later.
21. As a developer, I want German-string changes to trigger automatic translation via GitHub Actions, so that translations stay in sync without manual effort.
22. As a developer, I want to mark specific strings as translation-locked, so that manually refined translations are never auto-overwritten.
23. As a developer, I want a TM-specific translation glossary, so that Claude API consistently uses correct terminology across all locales.
24. As a developer, I want dynamic content (teacher bios, TMW API events) to be translated once and cached in Supabase, so that we don't make repeated API calls on every page revalidation.
25. As a developer, I want the registration API to store the registrant's locale, so that emails can be rendered in the correct language.

## Implementation Decisions

### Routing
- next-intl with locale-prefix middleware. DE has no prefix (`/`), others are prefixed: `/en`, `/fr`, `/es`.
- URL slugs for themes remain in German across all locales (e.g. `/en/schlaf`, not `/en/sleep`). Can be changed later without breaking changes.
- Locale priority on first visit: `localStorage` key `tm_locale` → `Accept-Language` browser header → `de` (default).
- On locale switch: update URL to new prefix + write `localStorage`.

### Static translation
- All static strings extracted into `/messages/de.json` (source of truth).
- next-intl generates typed `useTranslations()` hooks from this schema.
- `/messages/en.json`, `fr.json`, `es.json` are auto-generated — never edited directly except via lock overrides.
- `translation-locks.json`: flat map of message keys to `true`. Locked keys are skipped by the auto-translate script.
- `translation-glossary.json`: defines fixed term mappings per locale (e.g. `"TM" → "MT"` for FR/ES, `"Transzendentale Meditation" → "Méditation Transcendantale"` for FR). Claude API receives this as a system instruction on every translation call.

### Auto-translation workflow
- GitHub Action triggers on push to `main` when `messages/de.json` changes.
- Script computes diff between current `de.json` and a committed snapshot `messages/de.snapshot.json`.
- Only changed/added keys are sent to Claude API (not the full file).
- Claude is instructed to follow `translation-glossary.json` and return JSON with only the requested keys.
- Results written to `en.json`, `fr.json`, `es.json` (skipping locked keys).
- `de.snapshot.json` is updated to match current `de.json`.
- All changes committed directly to `main` by the Action bot.

### Dynamic content translation
- New Supabase project introduced. Two tables for Phase 1:
  - `translation_cache (id, source_hash, locale, translated_text, created_at)` — `source_hash` is SHA-256 of the original German text.
  - `teacher_languages (teacher_name, locale, bio_override, created_at, updated_at)` — `teacher_name` matches the TMW API name field.
- `lib/translation-cache.ts` exposes `getCachedTranslation(text, locale)`. On cache miss: call Claude API, store result, return.
- Teacher bios and TMW event descriptions are translated via this cache during Next.js ISR revalidation. Cache hit = zero API calls.

### Teacher filter
- `lib/teachers.ts` modified: `getTeachers(locale?)` fetches TMW API teachers, then queries Supabase `teacher_languages` for the given locale.
- If teachers with a matching locale entry exist, only those are returned. If none match, all teachers are returned (fallback).
- If a `bio_override` exists for the locale in `teacher_languages`, it replaces the translated API bio.

### Language switcher component
- New `components/language-switcher.tsx`.
- Placed in TopBar to the RIGHT of the hamburger icon (still left side of the header).
- Renders a small globe SVG icon button. On click: inline dropdown showing active locales (only those enabled in Einstellungen).
- Selecting a locale: navigates to the same path with new locale prefix, writes `tm_locale` to `localStorage`.

### Admin: Lehrer tab
- New tab in the existing admin panel.
- Lists teachers fetched from TMW API.
- Per teacher: language checkboxes (up to 4, from active locale set), textarea for bio override per locale (per-locale tab).
- Save writes to Supabase `teacher_languages`.

### Admin: Einstellungen tab
- New tab in the existing admin panel.
- Fields: active locales (multi-select from DE/EN/FR/ES), WhatsApp enabled toggle, WhatsApp link, contact email, contact phone.
- For Phase 1 (single-tenant Munich), config stored as a well-known Supabase row (tenant = `muenchen`). Schema is forward-compatible with multi-tenancy Phase 2.

### Registration i18n
- `api/register/route.ts` request body gains a `locale` field (`"de" | "en" | "fr" | "es"`).
- `locale` is appended to the Google Sheets registration row as column H.
- `buildConfirmationHtml` and `buildReminderHtml` in `lib/email.ts` accept a `locale` param and render subject + body in the correct language using strings from `messages/{locale}.json`.
- Email subjects are also localised (e.g. EN: `"Confirmation: TM Info Evening on [date]"`).

### Schema changes
- Supabase: `translation_cache`, `teacher_languages` tables (see above).
- Google Sheets `Info Anmeldungen` tab: new column H = `locale`.

## Testing Decisions

**What makes a good test here:** test the external behaviour of each module — inputs and outputs — without asserting on internal implementation details. Tests should run without a live Supabase or Claude API connection (inject mock adapters at the boundary).

### `lib/translation-cache.ts`
- Cache hit: given a pre-seeded row, `getCachedTranslation` returns the stored translation without calling Claude.
- Cache miss: when no row exists, the translation function is called, the result is stored, and the translated text is returned.
- Hash stability: the same input text always produces the same cache key regardless of call order.
- Locale isolation: a cached EN translation is not returned for a FR request on the same source text.

### `lib/teachers.ts` (teacher filter)
- When one teacher has a matching locale entry, only that teacher is returned.
- When multiple teachers have matching locale entries, all matching teachers are returned.
- When no teacher has a matching locale entry, all teachers from the API are returned (fallback).
- Duplicate teachers (same name across center 108 and 109) are deduplicated regardless of locale filtering.
- `bio_override` replaces the translated API bio when present for the requested locale.

### `scripts/translate.ts` (diff + lock logic)
- A key present in `de.json` but absent from `de.snapshot.json` is included in the translation delta.
- A key whose value changed between `de.json` and snapshot is included in the delta.
- A key whose value is unchanged is excluded from the delta.
- A key listed in `translation-locks.json` is excluded from the delta even if it changed.
- An empty delta produces no Claude API call.

### Locale priority resolution
- When `localStorage` contains a valid locale, that locale is returned.
- When `localStorage` is empty and `Accept-Language` contains a supported locale, that locale is returned.
- When both are absent or unsupported, `"de"` is returned.
- When `localStorage` contains an unsupported locale string, fall back to `Accept-Language` or `"de"`.

### Registration locale storage
- A POST with `locale: "en"` appends `"en"` as column H in the Sheets row.
- A POST without a `locale` field defaults to `"de"` in the Sheets row.

## Out of Scope

- Custom language addition at runtime (e.g. Polish) — Phase 2 (multi-tenancy).
- Translated URL slugs for theme pages (e.g. `/en/sleep` instead of `/en/schlaf`) — can be added later without breaking changes.
- Multi-language admin panel UI — admins are German-speaking.
- Translation of admin-composed Veranstaltungen emails — Phase 2.
- Teacher language filter UI for visitors to manually filter by teacher language — the filter is automatic based on current locale.
- Paid translation memory or TMS service (Lokalise, Crowdin) — out of budget.
- Right-to-left language support.

## Further Notes

- The abbreviation "TM" becomes "MT" in French and Spanish (Méditation Transcendantale / Meditación Trascendental). This applies to every standalone "TM" string — not just the full name. Every component that renders "TM" as a standalone string must use an i18n key, not a hardcoded string.
- Teacher bios come from the TMW API in German. The `bio_override` mechanism in the Lehrer admin tab is the escape hatch for bios that auto-translate poorly.
- The Supabase `tenants` table is NOT introduced in this phase — Einstellungen are stored as a single well-known row keyed to `muenchen`. The schema is designed so Phase 2 (multi-tenancy) simply adds more rows.
- next-intl requires all page components under `app/` to be wrapped in an `[locale]` dynamic segment. This is a one-time routing refactor that touches every page file — it is the largest single migration cost of this feature.
- The existing `content.ts` remains as the source for theme definitions and non-string config (image paths, slug definitions, forWhomIndex). next-intl message files cover translatable strings only.
