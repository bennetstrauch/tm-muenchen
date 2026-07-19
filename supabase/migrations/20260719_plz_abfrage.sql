-- PLZ-Abfrage: when true, the Infoabend sign-up form shows a soft PLZ field and
-- the typed PLZ is preferred over IP inference. Off by default = today's behaviour.
alter table tenants add column if not exists plz_abfrage boolean not null default false;
