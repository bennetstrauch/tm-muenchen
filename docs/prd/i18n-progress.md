# i18n Phase 1 — Progress

PRD: docs/prd-i18n-phase1.md

## Status

| Area | Item | Status |
|---|---|---|
| Routing | `[locale]` dynamic segment, middleware, DE prefix-free | ✅ done |
| Static translation | `messages/de.json` source of truth + EN/FR/ES generated | ✅ done |
| Language switcher | Globe icon in TopBar, locale written to `localStorage` | ✅ done |
| Events | Locale-aware date formatting + event type labels | ✅ done |
| Supabase schema | `translation_cache`, `teacher_languages`, `settings` tables | ✅ done |
| Translation cache | `lib/translate.ts` — SHA-256 cache → Claude fallback | ✅ done |
| Teacher filter | `getTeachers(locale?)` — Supabase query + bio_override | ✅ done |
| Teacher bio translation | Translate API bios via `getTranslation()` | ✅ done |
| Admin — Lehrer tab | Language assignments + bio overrides per teacher | ❌ not started |
| Admin — Einstellungen tab | Active locales, WhatsApp toggle, contact info | ❌ not started |
| Registration locale | `locale` field in POST body + Sheets column H | ❌ not started |
| Localised emails | Confirmation + reminder in registrant's language | ❌ not started |

## Notes

- Teacher filter and bio translation are a single PR — they share `getTeachers(locale)` and `getTranslation()`.
- Admin tabs (Lehrer + Einstellungen) are independent of each other but both depend on the Supabase schema being live.
- Registration locale must land before localised emails — emails need the locale stored per registration.
- Implement in order: Teacher filter → Admin Lehrer → Admin Einstellungen → Registration locale → Localised emails.
- After each area: run `npx tsc --noEmit`, test on dev server, commit.
