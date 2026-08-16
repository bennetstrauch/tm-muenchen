-- teacher_contacts · per-teacher contact info shown on the public teacher card.
--
-- One row per (tenant, teacher_name). email/phone are the teacher's own values;
-- use_center_contacts=true means the card shows the tenant's center contacts
-- instead. A partial unique index makes the DB the source of truth for the
-- "at most one teacher per tenant uses the center contacts" rule; the admin UI
-- and the /api/admin/lehrer PUT handler enforce it earlier for a better message.

create table teacher_contacts (
  tenant text not null references tenants(tenant),
  teacher_name text not null,
  email text,
  phone text,
  use_center_contacts boolean not null default false,
  created_at timestamptz not null default now(),
  primary key (tenant, teacher_name)
);

create unique index teacher_contacts_one_center_per_tenant
  on teacher_contacts (tenant)
  where use_center_contacts;

alter table teacher_contacts enable row level security;
