-- Drop the pre-ADR-0013 per-language columns on `studies`.
--
-- studies.abstract_de and studies.citation_raw_de held the German sheet's column H,
-- which is still English (see ADR 0013) — so they only duplicated the English base
-- columns and were never read. German (and every other locale) now lives in
-- study_translations as an overlay. A new locale is new rows there, not new columns.
--
-- Safe to run after the abstract batch has populated study_translations
-- (data/forschung/translations/de.json → npm run import-forschung).

alter table studies drop column if exists abstract_de;
alter table studies drop column if exists citation_raw_de;
