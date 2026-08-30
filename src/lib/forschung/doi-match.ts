import type { ParsedCitation } from './parse-citation';

// The subset of a CrossRef /works item we rely on for matching.
export type CrossRefWork = {
  DOI?: string;
  title?: string[];
  author?: { family?: string; given?: string }[];
  issued?: { 'date-parts'?: number[][] };
};

const DOI_TOKEN = /10\.\d{4,9}\/[^\s"<>]+/;

// Studies whose citation cell already carries a DOI (or dx.doi.org URL) — the
// cheapest, most reliable hits, applied before any network lookup.
export function extractInlineDoi(rawCitation: string): string | null {
  const match = (rawCitation ?? '').match(DOI_TOKEN);
  if (!match) return null;
  const doi = match[0].replace(/[.,;)\]]+$/, '');
  return `https://doi.org/${doi}`;
}

function normalizeWords(s: string): string[] {
  return (s ?? '')
    .toLowerCase()
    .replace(/[^\p{L}\p{N}\s]/gu, ' ')
    .split(/\s+/)
    .filter(Boolean);
}

function titleSimilarity(a: string, b: string): number {
  const setA = new Set(normalizeWords(a));
  const setB = new Set(normalizeWords(b));
  if (setA.size === 0 || setB.size === 0) return 0;
  let shared = 0;
  for (const w of setA) if (setB.has(w)) shared++;
  const union = new Set([...setA, ...setB]).size;
  return shared / union;
}

function resultYear(work: CrossRefWork): number | undefined {
  return work.issued?.['date-parts']?.[0]?.[0];
}

// A DOI is stored only when the CrossRef result is a confident match for the
// parsed citation: near-identical title, publication year within a year (print
// vs. online lag), and the first author present. Anything softer stays linkless.
export function isConfidentDoiMatch(citation: ParsedCitation, result: CrossRefWork): boolean {
  if (!result.DOI) return false;
  if (!citation.title) return false;

  const titleOk = titleSimilarity(citation.title, result.title?.[0] ?? '') >= 0.8;

  const ry = resultYear(result);
  const yearOk = citation.year != null && ry != null && Math.abs(citation.year - ry) <= 1;

  const family = result.author?.[0]?.family?.toLowerCase();
  const authorOk = !!family && citation.authors.toLowerCase().includes(family);

  return titleOk && yearOk && authorOk;
}
