-- 002 · operational tables  (Issue #41, parent #39)
--
-- Creates the three Supabase tables that replace the Google Sheets tabs:
--   vorlagen        (event templates)
--   veranstaltungen (events)
--   anmeldungen     (registrations)
--
-- Every row is tenant-scoped via `tenant text NOT NULL REFERENCES tenants(tenant)`.
-- All ids are uuid with gen_random_uuid() defaults. Column names are snake_case
-- to match the existing schema; the #45 rewrite maps them to the camelCase types.
--
-- Requires: 001-settings-to-tenants.sql (tenants table must exist).
-- Order matters: vorlagen before veranstaltungen (vorlage_id FK),
-- veranstaltungen before anmeldungen (veranstaltung_id FK).

-- ---------------------------------------------------------------------------
-- vorlagen — Vorlage = Veranstaltung & { name }
-- ---------------------------------------------------------------------------
create table vorlagen (
  id                           uuid primary key default gen_random_uuid(),
  tenant                       text not null references tenants(tenant),
  name                         text not null default '',
  title                        text not null default '',
  subtitle                     text not null default '',
  description                  text not null default '',
  long_description             text not null default '',
  date                         date,
  time                         text not null default '',
  location                     text not null default '',
  is_online                    boolean not null default false,
  online_link                  text not null default '',
  hosts                        text not null default '',
  price                        text not null default '',
  target_audience              text not null default '',
  notes                        text not null default '',
  reminder1_hours              int not null default 24,
  reminder2_hours              int not null default 0,
  registration_open            boolean not null default true,
  visible                      boolean not null default true,
  is_priority                  boolean not null default false,
  image_url                    text,
  auch_fuer_nicht_meditierende boolean not null default false,
  slug                         text,
  end_time                     text,
  reminder_subject1            text,
  reminder_body1               text,
  reminder_subject2            text,
  reminder_body2               text
);

create index vorlagen_tenant_idx on vorlagen (tenant);

-- ---------------------------------------------------------------------------
-- veranstaltungen — Veranstaltung type
-- ---------------------------------------------------------------------------
create table veranstaltungen (
  id                           uuid primary key default gen_random_uuid(),
  tenant                       text not null references tenants(tenant),
  title                        text not null default '',
  subtitle                     text not null default '',
  description                  text not null default '',
  long_description             text not null default '',
  date                         date not null,
  time                         text not null default '',
  location                     text not null default '',
  is_online                    boolean not null default false,
  online_link                  text not null default '',
  hosts                        text not null default '',
  price                        text not null default '',
  target_audience              text not null default '',
  notes                        text not null default '',
  reminder1_hours              int not null default 24,
  reminder2_hours              int not null default 0,
  registration_open            boolean not null default true,
  visible                      boolean not null default true,
  is_priority                  boolean not null default false,
  image_url                    text,
  auch_fuer_nicht_meditierende boolean not null default false,
  slug                         text,
  vorlage_id                   uuid references vorlagen(id) on delete set null,
  end_time                     text,
  reminder_subject1            text,
  reminder_body1               text,
  reminder_subject2            text,
  reminder_body2               text,
  whatsapp_posted_at           timestamptz
);

create index veranstaltungen_tenant_idx on veranstaltungen (tenant);
create index veranstaltungen_tenant_date_idx on veranstaltungen (tenant, date);

-- ---------------------------------------------------------------------------
-- anmeldungen — EventRegistrationRecord + veranstaltung_id FK
-- ---------------------------------------------------------------------------
create table anmeldungen (
  id               uuid primary key default gen_random_uuid(),
  tenant           text not null references tenants(tenant),
  veranstaltung_id uuid references veranstaltungen(id) on delete set null,
  timestamp        timestamptz not null default now(),
  event_id         text not null default '',
  event_title      text not null default '',
  event_date       text not null default '',
  name             text not null default '',
  email            text not null default '',
  phone            text,
  tm_lehrer        text,
  datum_erlernen   text
);

create index anmeldungen_tenant_idx on anmeldungen (tenant);
create index anmeldungen_veranstaltung_idx on anmeldungen (veranstaltung_id);
