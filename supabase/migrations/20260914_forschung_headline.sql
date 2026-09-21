-- Forschung: a generated, human-readable English card headline per study (Slice 3a).
--
-- The card headline was the source sheet's terse "Specific Results" cell (col D),
-- which is sometimes a cryptic stub ("TC", "PTSD"). scripts/generate-headlines.ts
-- writes one short factual English headline per study into a committed JSON
-- (data/forschung/headlines.json), and scripts/import-forschung.ts applies it here.
-- English is the source of record (ADR 0013), so it is a `studies` column; the
-- DE/FR/ES headline is a 'headline' field in study_translations (Slice 3b).
-- Falls back to specific_results at read time (see resolveHeadline) when null.

alter table studies add column if not exists headline text;
