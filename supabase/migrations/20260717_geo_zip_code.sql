-- IP-resolved postal code (from Vercel geo headers), stored alongside city
-- purely so PLZ data quality can be verified later. See ADR 0010.
alter table info_anmeldungen add column if not exists zip_code text;
alter table info_anfragen   add column if not exists zip_code text;
