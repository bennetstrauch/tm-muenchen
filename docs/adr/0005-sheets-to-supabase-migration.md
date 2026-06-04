# ADR 0005 — Migrate Registrations and Veranstaltungen from Google Sheets to Supabase

## Status
Accepted

## Context

Phase 1 used Google Sheets as a database for three data types:
- **Anmeldungen** — Infoabend and event registrations
- **Veranstaltungen** — manually managed center events (group meditations, retreats, etc.)
- **Vorlagen** — email templates

This worked for a single center with low volume. Multi-tenancy breaks the model: each new center would need their own Google Sheet, requiring Bennet to create and share a Sheet per onboarding. There is no practical way to query across tenants or enforce schema consistency.

Google Sheets was always a pragmatic Phase 1 choice, not a long-term store.

## Decision

**All three data types move to Supabase** with a `tenant` column for row-level isolation.

```
veranstaltungen  (tenant, id, ...)
anmeldungen      (tenant, id, veranstaltung_id, ...)
vorlagen         (tenant, id, ...)
```

München's existing Sheet data is migrated via a **one-time script**: read all rows from each Sheet tab, write to Supabase with `tenant = 'muenchen'`. Google Sheets become read-only archives after the script runs and counts are verified.

The admin UI already has tabs for Veranstaltungen, Anmeldungen, and Vorlagen — they read/write Supabase instead of Sheets after the migration. Center admins see only their own tenant's rows (query always filters `WHERE tenant = current_tenant`). No UI changes needed for isolation; it is enforced at the data layer.

## Consequences

- Onboarding a new center requires no Sheet setup — they start with empty Supabase rows.
- Center colleagues lose direct Google Sheets access. The admin UI is the management interface.
- The existing `sheets.ts` integration is deleted after migration. `veranstaltungen.ts` and registration route handlers are rewritten to use the Supabase client.
- ADR 0003 already established Supabase as the settings and translation cache store. This decision extends that foundation to operational data.
- Registrations reference `veranstaltungen` rows by foreign key — referential integrity is enforced in Supabase, not possible in Sheets.
