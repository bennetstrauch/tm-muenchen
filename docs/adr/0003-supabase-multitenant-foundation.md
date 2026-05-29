# ADR 0003 — Supabase as Translation Store and Multi-Tenant Config Foundation

## Status
Accepted

## Context

i18n Phase 1 introduced two needs that Google Sheets cannot serve:

1. **Dynamic translation cache** — teacher bios and TMW event descriptions arrive from the TMW API in German. They must be translated once per locale and cached so the site doesn't make repeated Claude API calls on every ISR revalidation cycle. The cache must be queryable by `(source_hash, locale)`.

2. **Per-center configuration** — the site needs a place to store which locales are active, WhatsApp settings, and contact details. The same schema must extend cleanly to multiple TM centers in Phase 2 (multi-tenancy).

Google Sheets was considered but rejected: it has no indexed lookup, no upsert semantics, and would require a full sheet read to find a single cached translation — too slow and fragile for ISR.

## Options considered

| Option | Cost | Indexed lookup | Multi-tenant ready | Notes |
|---|---|---|---|---|
| Google Sheets | 0 € | ✗ | ✗ | Already used for registrations; wrong tool for cache |
| Supabase (Postgres) | 0 € free tier | ✓ | ✓ | Row-level tenant isolation, strong typing via generated client |
| Upstash Redis | 0–10 € | ✓ | Possible | Good for pure cache; no relational config story |
| PlanetScale / Neon | 0 € | ✓ | ✓ | Viable but adds another vendor; Supabase covers both needs |

## Decision

**Supabase** — one project, three tables:

```
translation_cache (source_hash, locale, translated_text)
  — unique on (source_hash, locale); SHA-256 of German source text as key

teacher_languages (teacher_name, locale, bio_override)
  — per-teacher per-locale language flag + optional bio override

settings (tenant, active_locales, whatsapp_enabled, whatsapp_link, contact_email, contact_phone)
  — one row per center; tenant = 'muenchen' for Phase 1
```

The `settings.tenant` column is the multi-tenancy hook. Phase 1 uses a single well-known row (`tenant = 'muenchen'`). Phase 2 (other centers) adds more rows — no schema migration needed.

`translation_cache` has no `tenant` column intentionally: translations are language-only, not center-specific. A French translation of "Was ist TM?" is the same regardless of which center asks.

## Consequences

- `SUPABASE_URL` and `SUPABASE_SERVICE_ROLE_KEY` must be set in Vercel environment variables.
- `lib/supabase.ts` holds the typed client and schema types — keep it as the single import point.
- Phase 2 multi-tenancy requires: a `tenant` lookup on page load (from domain or subdomain), threading the resolved tenant string into `getSettings()`, and a per-center admin login. No schema changes.
- The free Supabase tier (500 MB DB, 2 GB egress) is sufficient for Phase 1 and likely Phase 2 across a handful of German centers.
- `translation_cache` grows unboundedly. A periodic cleanup job (delete rows older than 90 days) should be added before Phase 2 to avoid hitting storage limits.
