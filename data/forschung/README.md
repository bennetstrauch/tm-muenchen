# Forschung source data

`january-2026-tm-research.xlsx` — the **"January 2026 TM & TM-Sidhi Research Spreadsheet"**,
prepared by the **Global Mother Divine Organization** (Jean Tobin). A bibliography of
published research on the Transcendental Meditation® and TM-Sidhi® programs, 1970–2026.
Source contact: `tmresearchspreadsheet@tm-women.org`.

Committed into the repo so imports are **reproducible** (per ADR 0012 and #142). To refresh
the corpus, drop the next annual edition here under the same name and re-run the import.

## Sheets

| Sheet | Rows | Lang | Role |
|---|---|---|---|
| **All Research** | 477 | EN | Source of record. Structured columns + English study text. |
| **Alle Forschung** | 477 | DE | German translation, **matched by row position** to *All Research*. |
| Sleep Studies | 12 | EN | Small curated subset (not imported in ticket 1). |
| Schlafstudien | 12 | DE | German curated subset. |

## Layout of *All Research* / *Alle Forschung*

- **Rows 1–13** — title + legend block (who prepared it, what each column means). Not data.
- **Row 14** — column header row (`GENERAL TOPIC | FIELD… | SPECIALTY AREA | SPECIFIC RESULTS | RCT /META | YEAR | | `).
- **Rows 15–475** — study rows (one study per row).
- **Row 476** — copyright/trademark footer in column A only (empty H). **Not a study — skip.**

Data-row detection: from row 15, column A non-empty **and** column H non-empty
(the footer row 476 is the only col-A-present row with an empty H).
**461 real study rows** (462 col-A-present rows from row 15, minus the footer).

## Columns (data rows)

| Col | Name | Notes |
|---|---|---|
| **A** | General Topic | One of *Health · Mental Potential · Social Behavior · World Peace*. Combined values occur (e.g. `Mental Potential & Health`). Watch trailing spaces. DE: *Gesundheit · Geistiges Potenzial · Sozialverhalten · Weltfrieden*. |
| **B** | Field + Collected-Papers ref | e.g. `Sociological   CPVol 3Pg 2093`, `Physiological`, `Psychological CP Vol6 Pg4325`. The `CP Vol x Pg y` fragment is the movement's *Collected Papers* reference, formatted inconsistently. |
| **C** | Specialty Area | e.g. `Cardiovascular`, `Rehabilitation`, `Development of Personality`, `Affective`. May carry trailing spaces or list several. |
| **D** | Specific Results | Short human headline for the finding (used as the card headline). |
| **E** | RCT / Meta flag | **Mostly empty.** Populated values: `RCT`, `Meta`, `Pilot`. ~58 RCT + ~13 Meta (~71 gold-standard; spec rounds to ~77). |
| **F** | Year | Publication year, e.g. `1978`. |
| **G** | Summary flag | `s` = a summary is provided (nearly all rows). |
| **H** | Citation + Abstract (mashed) | The hard one — see below. |

## Column H — citation + abstract in one cell

One cell holds the full academic citation immediately followed by the abstract, usually with
**no clear delimiter**:

```
Authors. Title. Journal Year Vol(Issue):Pages[. doi…] Abstract text continues here…
```

Real example (row 15):

> Abrams AI, Siegel LM. The Transcendental Meditation program and rehabilitation at Folsom
> State Prison: a cross-validation study. Criminal Justice and Behavior 1978 5(1):3-20 The
> Transcendental Meditation program in a maximum security prison was studied via
> cross-validation design. Significant differences were found between…

Parsing gotchas (drive `parseCitation` test fixtures):

- **No fixed delimiter** between citation and abstract — the abstract typically begins after
  the `Vol(Issue):Pages` token, but some rows use a newline (row 300), some don't.
- **Stored as richText**, not a plain string. Must flatten `cell.value.richText[].text`.
  The **bold run is NOT a reliable citation delimiter** — row 300 has the citation unbolded
  and `Methods:` bolded. Parse the flattened string by pattern, not by formatting.
- Inline **DOIs** already present in some cells (e.g. `doi.org/10.1080/09540121.2013.764396`,
  row 100) — cheap free DOI hits before any CrossRef lookup.
- Structured abstracts (`Objective:… Methods:… Results:… Discussion:…`, row 300).
- Multi-author lists, 1970s citation formats, missing abstracts, and *Collected Papers*-only
  references all occur — `parseCitation` is **best-effort**; the raw cell is always retained
  as `citation_raw` fallback.

## Import mapping (see #142)

`studies` table (non-tenant-scoped, ADR 0012), keyed by a stable content hash:
`topic, field, specialty, specific_results, is_rct_meta, year` from A–F; `citation_raw` = flattened H;
`authors/title/journal/year/abstract` = best-effort `parseCitation(H)`; German study text from the
row-matched *Alle Forschung* H cell; `doi_url` from inline DOI or confident CrossRef/PubMed match,
else a repo overrides file, else null.

## DOI files & reproducibility

Two repo files feed `doi_url` so the enriched corpus is reproducible from the repo alone,
without re-hitting the network:

- **`doi-overrides.json`** — hand-filled `{ studyId: doiUrl }` for studies the automated lookup
  missed or got wrong. Wins over every automated source.
- **`doi-cache.json`** — written by `npm run import-forschung:doi` (CrossRef/PubMed pass) and
  **committed**. `npm run import-forschung` re-applies it offline, so a fresh clone reproduces the
  same links. Regenerate it only when re-enriching a new edition.

Two-step refresh: `npm run import-forschung` (upsert rows + inline/override DOIs) →
`npm run import-forschung:doi` (network enrichment, updates the DB and rewrites `doi-cache.json`) →
commit the updated `doi-cache.json`.

## Translation files & reproducibility

The `studies` row is the **canonical English** source (ADR 0013). Translated study
text — currently German abstracts — lives in `study_translations` as an overlay,
generated offline and committed so the running site never calls a translation API:

- **`translations/{locale}.json`** — `{ studyId: { field: value } }`, written by
  `npm run translate-forschung`. DeepL Free drafts each English abstract into German,
  then Claude refines it against the source under the shared TM glossary
  (`src/i18n/translation-glossary.json`). Idempotent and resumable — only abstracts
  missing a committed translation are (re)done, and progress is flushed each batch,
  so a DeepL/Claude quota cutoff just means "re-run". Use `--limit N` to chunk under
  the DeepL Free monthly quota (500,000 chars).
- `npm run import-forschung` upserts these files into `study_translations` (any
  `studyId` not in the current corpus is skipped). The German structured columns
  from the *Alle Forschung* sheet (specialty, specific results) are also upserted
  as `locale='de'` rows at import time.

Requires `DEEPL_API_KEY` (free key ends in `:fx`) and `ANTHROPIC_API_KEY` in `.env.local`.
