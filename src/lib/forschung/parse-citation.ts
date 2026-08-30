export type ParsedCitation = {
  authors: string;
  title: string;
  journal: string;
  year?: number;
  abstract: string;
};

// Column H of the source spreadsheet mashes a full academic citation and the
// abstract into one cell, usually with no delimiter (see data/forschung/README.md):
//
//   Authors. Title. Journal Year Vol(Issue):Pages[. doi…] Abstract text…
//
// This is a best-effort parser. The raw cell is always retained as citation_raw,
// so imperfect splits degrade display gracefully rather than losing data.

// A leading run of author entries: "Family AB, Family C, …". The first entry must
// carry an initial group so prose like "Some unstructured note" does not match.
// Unicode-aware so accented names (Gräf, Schneider) are recognised.
const AUTHORS =
  /^(\p{Lu}[\p{L}.'‘’-]+(?:\s+\p{Lu}{1,4}\.?)(?:,\s*\p{Lu}[\p{L}.'‘’-]+(?:\s+\p{Lu}{1,4}\.?)?)*)/u;

// The numeric citation tail after the year: " 5(1):3-20 ", " 29:591-596 ", " 1(2): 011 ".
const PAGES_PREFIX = /^[\s\d()\-–—:.,;]*/;

// A DOI token that sometimes sits between the pages and the abstract.
const LEADING_DOI = /^(?:doi\.?\S*|https?:\/\/\S+|10\.\d{4,9}\/\S+)\s+/i;

const YEAR = /\b(19|20)\d{2}\b/;

function tidy(s: string): string {
  return s.trim().replace(/\.$/, '').trim();
}

export function parseCitation(rawCitation: string): ParsedCitation {
  const text = (rawCitation ?? '').replace(/\s+/g, ' ').trim();

  const authorsMatch = text.match(AUTHORS);
  const authors = authorsMatch ? authorsMatch[1].replace(/[.\s]+$/, '') : '';
  const rest = (authorsMatch ? text.slice(authorsMatch[0].length) : text).replace(/^[.\s]+/, '');

  const yearMatch = rest.match(YEAR);
  const year = yearMatch ? Number(yearMatch[0]) : undefined;

  const beforeYear = yearMatch ? rest.slice(0, yearMatch.index) : rest;
  const segments = beforeYear.split(/\.\s+/).filter((s) => s.trim().length > 0);
  const title = segments.length > 1 ? tidy(segments.slice(0, -1).join('. ')) : tidy(segments[0] ?? '');
  const journal = segments.length > 1 ? tidy(segments[segments.length - 1]) : '';

  let abstract = '';
  if (yearMatch) {
    const afterYear = rest.slice((yearMatch.index ?? 0) + yearMatch[0].length);
    abstract = afterYear.replace(PAGES_PREFIX, '').replace(LEADING_DOI, '').trim();
  }

  return { authors, title, journal, year, abstract };
}
