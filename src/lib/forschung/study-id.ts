import { createHash } from 'node:crypto';
import type { ParsedCitation } from './parse-citation';

// The primary key of a study is a stable content hash of its citation identity —
// authors, title, year — so re-importing an updated spreadsheet edition upserts
// each study in place instead of duplicating it. The abstract is deliberately
// excluded: light abstract edits between editions must not mint a new row. When
// parsing failed to find a title, we fall back to the raw cell so unparseable
// rows still get a stable, distinct id.
function normalize(s: string): string {
  return (s ?? '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}]+/gu, ' ')
    .trim();
}

export function studyId(citation: ParsedCitation, rawCitation: string): string {
  const basis = citation.title
    ? `${normalize(citation.authors)}|${normalize(citation.title)}|${citation.year ?? ''}`
    : normalize(rawCitation);
  return createHash('sha1').update(basis).digest('hex').slice(0, 16);
}
