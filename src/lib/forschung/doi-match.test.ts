import { describe, it, expect } from 'vitest';
import { extractInlineDoi, isConfidentDoiMatch } from './doi-match';
import type { ParsedCitation } from './parse-citation';

const CITATION: ParsedCitation = {
  authors: 'Alexander CN, Langer EJ, Newman RI, Chandler HM, Davies JL',
  title: 'Transcendental Meditation, mindfulness, and longevity: an experimental study with the elderly',
  journal: 'Journal of Personality and Social Psychology',
  year: 1989,
  abstract: '…',
};

// Shape mirrors a CrossRef /works item (only the fields we read).
function crossref(overrides: Partial<Parameters<typeof isConfidentDoiMatch>[1]> = {}) {
  return {
    DOI: '10.1037/0022-3514.57.6.950',
    title: ['Transcendental meditation, mindfulness, and longevity: An experimental study with the elderly'],
    author: [{ family: 'Alexander', given: 'Charles N.' }],
    issued: { 'date-parts': [[1989]] },
    ...overrides,
  };
}

describe('isConfidentDoiMatch', () => {
  it('accepts a strong match (title equal ignoring case, exact year, first author present)', () => {
    expect(isConfidentDoiMatch(CITATION, crossref())).toBe(true);
  });

  it('accepts a one-year-off publication date (print vs. online lag)', () => {
    expect(isConfidentDoiMatch(CITATION, crossref({ issued: { 'date-parts': [[1990]] } }))).toBe(true);
  });

  it('rejects a year mismatch greater than one', () => {
    expect(isConfidentDoiMatch(CITATION, crossref({ issued: { 'date-parts': [[1995]] } }))).toBe(false);
  });

  it('rejects a first-author mismatch even when the title is identical', () => {
    expect(isConfidentDoiMatch(CITATION, crossref({ author: [{ family: 'Smith', given: 'John' }] }))).toBe(false);
  });

  it('rejects a different title even when year and author match', () => {
    expect(
      isConfidentDoiMatch(CITATION, crossref({ title: ['A completely unrelated paper about something else entirely'] })),
    ).toBe(false);
  });

  it('rejects a result with no DOI', () => {
    expect(isConfidentDoiMatch(CITATION, crossref({ DOI: undefined }))).toBe(false);
  });

  it('rejects when the citation has no title to compare', () => {
    expect(isConfidentDoiMatch({ ...CITATION, title: '' }, crossref())).toBe(false);
  });
});

describe('extractInlineDoi', () => {
  it('pulls a bare doi.org DOI already present in the citation cell', () => {
    const raw = '… 2013 25(10): 1291-1297. doi.org/10.1080/09540121.2013.764396 Stress is implicated…';
    expect(extractInlineDoi(raw)).toBe('https://doi.org/10.1080/09540121.2013.764396');
  });

  it('pulls a full https dx.doi.org URL and strips a trailing newline/period', () => {
    const raw = 'Elder C … 2014 18(1):19-23. http://dx.doi.org/10.7812/TPP/13-102\nBurnout was reduced.';
    expect(extractInlineDoi(raw)).toBe('https://doi.org/10.7812/TPP/13-102');
  });

  it('returns null when no DOI is present', () => {
    expect(extractInlineDoi('Orme-Johnson DW. Autonomic stability. Psychosomatic Medicine 1973 35:341-349')).toBeNull();
  });
});
