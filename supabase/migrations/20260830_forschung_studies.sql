-- Forschung: the global TM & TM-Sidhi research corpus (~461 studies).
--
-- Per ADR 0012 this data is NOT tenant-scoped — every center shows the identical
-- library, so there is deliberately no `tenant` column. The primary key is a
-- stable content hash of the citation identity (authors|title|year), computed by
-- scripts/import-forschung.ts, so re-importing an updated spreadsheet edition
-- upserts each study in place instead of duplicating it.
--
-- Column H of the source sheet mashes citation + abstract into one cell; it is
-- parsed best-effort into authors/title/journal/year/abstract, and the raw cell
-- is always retained in citation_raw (and citation_raw_de) as the display fallback.

create table if not exists studies (
  id               text primary key,          -- stable content hash (see study-id.ts)
  topic            text not null,             -- col A: Health · Mental Potential · Social Behavior · World Peace
  field            text,                      -- col B: Field + Collected-Papers ref
  specialty        text,                      -- col C
  specific_results text,                      -- col D: card headline
  is_rct_meta      boolean not null default false,  -- col E populated with RCT/Meta
  year             integer,                   -- col F
  authors          text,                      -- parsed from col H (best-effort)
  title            text,                      -- parsed from col H (best-effort)
  journal          text,                      -- parsed from col H (best-effort)
  abstract         text,                      -- parsed from col H (best-effort), EN
  abstract_de      text,                      -- parsed from the row-matched "Alle Forschung" sheet
  citation_raw     text not null,             -- flattened col H, EN — always-correct fallback
  citation_raw_de  text,                      -- flattened col H, DE — always-correct fallback
  doi_url          text,                      -- enrichment: inline / CrossRef / override; null when unmatched
  updated_at       timestamptz not null default now()
);

-- Filtered browsing (Topic, RCT toggle) and year sorting happen client-side on the
-- full corpus, but these indexes keep the initial load and any server ordering cheap.
create index if not exists studies_topic_idx on studies (topic);
create index if not exists studies_year_idx on studies (year desc);
