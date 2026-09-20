-- anmeldungen · store the Resend id of each scheduled reminder email so a
-- Verschiebung (event date/time change) can move or cancel them. See ADR 0014.
-- Nullable: a registration may have 0–2 scheduled reminders depending on the
-- event's reminder1_hours / reminder2_hours and whether the time was still in
-- the future at signup.

alter table anmeldungen
  add column reminder1_email_id text,
  add column reminder2_email_id text;
