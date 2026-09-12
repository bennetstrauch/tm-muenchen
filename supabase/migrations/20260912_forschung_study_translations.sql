-- Forschung study text in languages other than the source-of-record English.
--
-- Per ADR 0013: translated Anzeigetext (display text) lives here as an overlay on
-- the canonical English `studies` row, keyed by (study_id, locale, field). A new
-- research-only locale (e.g. Croatian later, ADR 0012) is then just new rows —
-- no schema change. Like `studies` this is NOT tenant-scoped (no `tenant` column):
-- every center shows the identical corpus.
--
-- `field` names a translatable display column of a study (e.g. 'specific_results',
-- 'specialty', 'abstract'). Taxonomy keys (topic/specialty on `studies`) stay
-- English and are never overwritten — only their display label is translated here.
-- `study_id` is not a FK: the corpus is import-driven and both tables are upserted
-- by scripts/import-forschung.ts, which guarantees referential consistency.

create table if not exists study_translations (
  study_id   text not null,          -- references studies.id (import-enforced)
  locale     text not null,          -- Forschung locale: 'de' | 'fr' | 'es' | …
  field      text not null,          -- translatable field name, e.g. 'abstract'
  value      text not null,
  updated_at timestamptz not null default now(),
  primary key (study_id, locale, field)
);

-- The read path fetches every translation for one locale in a single query.
create index if not exists study_translations_locale_idx on study_translations (locale);
