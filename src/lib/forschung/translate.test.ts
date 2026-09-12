import { describe, it, expect } from 'vitest';
import { pendingAbstracts, translationFileToRows } from './translate';

describe('pendingAbstracts', () => {
  it('returns studies with source text and no committed translation', () => {
    const result = pendingAbstracts([{ id: 'a', abstract: 'English abstract.' }], {});
    expect(result).toEqual([{ id: 'a', abstract: 'English abstract.' }]);
  });

  it('skips studies whose abstract is already translated', () => {
    const result = pendingAbstracts(
      [{ id: 'a', abstract: 'English abstract.' }],
      { a: { abstract: 'Deutsche Übersetzung.' } },
    );
    expect(result).toEqual([]);
  });

  it('skips studies with no English abstract (empty or null)', () => {
    const result = pendingAbstracts(
      [
        { id: 'a', abstract: '' },
        { id: 'b', abstract: null },
        { id: 'c', abstract: '   ' },
      ],
      {},
    );
    expect(result).toEqual([]);
  });

  it('re-translates when a different field exists but abstract does not', () => {
    const result = pendingAbstracts(
      [{ id: 'a', abstract: 'English abstract.' }],
      { a: { specialty: 'Kardiovaskulär' } },
    );
    expect(result).toEqual([{ id: 'a', abstract: 'English abstract.' }]);
  });

  it('trims the source text it hands on for translation', () => {
    const result = pendingAbstracts([{ id: 'a', abstract: '  padded  ' }], {});
    expect(result).toEqual([{ id: 'a', abstract: 'padded' }]);
  });
});

describe('translationFileToRows', () => {
  const now = '2026-09-12T00:00:00.000Z';

  it('flattens each study/field into a locale-scoped row', () => {
    const rows = translationFileToRows('de', { a: { abstract: 'Deutsch.' } }, now);
    expect(rows).toEqual([
      { study_id: 'a', locale: 'de', field: 'abstract', value: 'Deutsch.', updated_at: now },
    ]);
  });

  it('emits one row per field across multiple studies', () => {
    const rows = translationFileToRows(
      'de',
      { a: { abstract: 'A.' }, b: { abstract: 'B.', specialty: 'S.' } },
      now,
    );
    expect(rows).toHaveLength(3);
    expect(rows).toContainEqual({ study_id: 'b', locale: 'de', field: 'specialty', value: 'S.', updated_at: now });
  });

  it('drops empty values so a placeholder never overwrites the English fallback', () => {
    const rows = translationFileToRows('de', { a: { abstract: '   ' } }, now);
    expect(rows).toEqual([]);
  });
});
