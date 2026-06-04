-- 003 · teacher_languages tenant column  (Issue #42, parent #39)
--
-- Adds a tenant column to the existing teacher_languages table, backfills all
-- current rows with 'muenchen', moves the primary key to (tenant, teacher_name,
-- locale), then drops the DEFAULT so future inserts must pass tenant explicitly.
--
-- Requires: 001-settings-to-tenants.sql (tenants table must exist for the FK).
-- Assumes the current PK is (teacher_name, locale).

-- 1. Add the column with a temporary DEFAULT so existing rows backfill in place.
alter table teacher_languages
  add column tenant text not null default 'muenchen' references tenants(tenant);

-- 2. Repoint the primary key to include tenant.
alter table teacher_languages drop constraint teacher_languages_pkey;
alter table teacher_languages
  add constraint teacher_languages_pkey primary key (tenant, teacher_name, locale);

-- 3. Drop the DEFAULT — column stays NOT NULL but now requires an explicit value.
alter table teacher_languages alter column tenant drop default;
