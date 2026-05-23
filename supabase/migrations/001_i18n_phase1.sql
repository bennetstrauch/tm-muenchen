-- translation_cache: stores Claude-translated dynamic content
-- source_hash is SHA-256 of the original German text
create table if not exists translation_cache (
  id              uuid primary key default gen_random_uuid(),
  source_hash     text not null,
  locale          text not null,
  translated_text text not null,
  created_at      timestamptz not null default now(),
  unique (source_hash, locale)
);

-- teacher_languages: which locales a teacher teaches in, plus optional bio overrides
create table if not exists teacher_languages (
  teacher_name text not null,
  locale       text not null,
  bio_override text,
  created_at   timestamptz not null default now(),
  updated_at   timestamptz not null default now(),
  primary key (teacher_name, locale)
);

-- auto-update updated_at on teacher_languages changes
create or replace function set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger teacher_languages_updated_at
  before update on teacher_languages
  for each row execute procedure set_updated_at();

-- settings: per-tenant site configuration (one row per center)
-- Phase 1: single row for 'muenchen'. Phase 2: one row per tenant.
create table if not exists settings (
  tenant           text primary key,
  active_locales   text[] not null default '{de}',
  whatsapp_enabled boolean not null default false,
  whatsapp_link    text,
  contact_email    text not null,
  contact_phone    text not null
);

-- Seed Munich settings
insert into settings (tenant, active_locales, whatsapp_enabled, whatsapp_link, contact_email, contact_phone)
values (
  'muenchen',
  '{de,en,fr,es}',
  true,
  'https://chat.whatsapp.com/JyYjiLgQ7dn4ewQLedUVC4',
  'info@tm-muenchen.de',
  '+49 163 7354 836'
)
on conflict (tenant) do nothing;

-- Enable RLS on all tables.
-- All access is server-side via the service_role key, which bypasses RLS.
-- This prevents accidental exposure if the anon key ever leaks.
alter table translation_cache  enable row level security;
alter table teacher_languages  enable row level security;
alter table settings           enable row level security;
