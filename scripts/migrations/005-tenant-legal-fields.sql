-- 005 · tenant legal fields (Datenschutz Verantwortlicher)
--
-- Adds the per-tenant data controller for the Datenschutz page:
-- legal_entity  — the responsible legal body (Verein) or full name of the
--                 individual when the center is run freelance
-- legal_address — postal address, multiline (Straße \n PLZ Ort)
-- Backfills München; the remaining tenants are filled via the super-admin
-- form once their legal data is known.
--
-- Requires: 001-settings-to-tenants.sql (tenants table must exist).

alter table tenants
  add column if not exists legal_entity  text not null default '',
  add column if not exists legal_address text not null default '';

update tenants set
  legal_entity  = 'Transzendentale Meditation München e.V.',
  legal_address = E'Guldeinstraße 47\n80639 München'
where tenant = 'muenchen' and legal_entity = '';
