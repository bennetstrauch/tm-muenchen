-- 004 · tenant UI configuration columns  (Issue #55)
--
-- Adds per-tenant customisation fields for logo, Infoabend duration,
-- Teachers section visibility, and CenterBanner label.
--
-- Requires: 001-settings-to-tenants.sql (tenants table must exist).

alter table tenants
  add column if not exists logo_url              text        default null,
  add column if not exists logo_label            text        default null,
  add column if not exists infoabend_duration_minutes integer not null default 30,
  add column if not exists show_teachers         boolean     not null default true,
  add column if not exists center_banner_label   text        default null;
