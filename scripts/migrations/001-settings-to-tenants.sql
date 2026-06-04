-- 001 · settings -> tenants  (Issue #40, parent #39)
--
-- Renames the Phase-1 `settings` table to `tenants` and adds every column
-- needed for multi-tenancy, then backfills the existing München row.
--
-- BEFORE RUNNING: replace REPLACE_WITH_ADMIN_PASSWORD below with the real
-- München admin password. The migration hashes it with bcrypt (pgcrypto)
-- so the plaintext never lands in the database. Do NOT commit the edited
-- password back to git — edit it only in the Supabase SQL editor.
--
-- Idempotency: not idempotent. Run once. Re-running fails on the rename.

create extension if not exists pgcrypto;

-- 1. Rename the table (preserves existing whatsapp/contact/active_locales data).
alter table settings rename to tenants;

-- 2. Add the new multi-tenancy columns (nullable for now; tightened after backfill).
alter table tenants
  add column hostname            text,
  add column admin_password_hash text,
  add column from_email          text,
  add column instagram_link      text,
  add column city                text,
  add column center_image_url    text,
  add column tmw_center_ids      int[] not null default '{}',
  add column impressum_content   text;

-- 3. Backfill the München row. Existing settings values (whatsapp_*, contact_*,
--    active_locales) are already present from the rename and are left untouched.
update tenants set
  hostname            = 'tm-muenchen.de',
  city                = 'München',
  instagram_link      = 'https://www.instagram.com/muenchentranszendiert',
  from_email          = 'info@tm-muenchen.de',
  tmw_center_ids      = '{108,109}',
  admin_password_hash = crypt('REPLACE_WITH_ADMIN_PASSWORD', gen_salt('bf')),
  impressum_content   = $impressum$**Angaben gemäß § 5 TMG**
Transzendentale Meditation München e.V.
Guldeinstraße 47
80639 München
Deutschland

**Kontakt**
Telefon: +49 163 7354 836
E-Mail: info@tm-muenchen.de

**Vertretungsberechtigter Vorstand**
Christoph Färber (1. Vorsitzender)
Wolfgang Arden (2. Vorsitzender)

**Vereinsregister**
Eingetragen im Vereinsregister des Amtsgerichts München
Registernummer: 14188

**Zugehörigkeit**
Transzendentale Meditation München e.V. ist Teil des nationalen TM-Netzwerks und arbeitet in Zusammenarbeit mit und unter Lizenz der nationalen Organisation für Transzendentale Meditation (meditation.de).

**Inhaltlich verantwortlich nach § 18 Abs. 2 MStV**
Bennet Strauch
Guldeinstraße 47
80639 München$impressum$
where tenant = 'muenchen';

-- 4. Enforce constraints now that the one row is fully populated.
alter table tenants
  alter column hostname            set not null,
  alter column admin_password_hash set not null,
  add constraint tenants_hostname_unique unique (hostname);
