import { describe, it, expect } from 'vitest';
import { pendingHeadlines, resolveHeadline } from './headline';

describe('pendingHeadlines', () => {
  it('returns studies with source signal and no committed headline', () => {
    const result = pendingHeadlines(
      [{ id: 'a', specificResults: 'TC', title: 'A fourth state of consciousness', abstract: 'Long abstract.' }],
      {},
    );
    expect(result).toEqual([
      { id: 'a', specificResults: 'TC', title: 'A fourth state of consciousness', abstract: 'Long abstract.' },
    ]);
  });

  it('skips studies that already have a committed headline', () => {
    const result = pendingHeadlines(
      [{ id: 'a', specificResults: 'TC', title: 'Title', abstract: 'Abstract' }],
      { a: 'A fourth state of consciousness beyond waking' },
    );
    expect(result).toEqual([]);
  });

  it('skips studies with no source signal at all', () => {
    const result = pendingHeadlines(
      [{ id: 'a', specificResults: '', title: '', abstract: '   ' }],
      {},
    );
    expect(result).toEqual([]);
  });

  it('keeps a study when only one source field is present', () => {
    const result = pendingHeadlines(
      [{ id: 'a', specificResults: '', title: 'A real academic title', abstract: '' }],
      {},
    );
    expect(result).toHaveLength(1);
  });
});

describe('resolveHeadline', () => {
  const row = { headline: 'English headline', specific_results: 'Reduced Hypertension' };

  it('prefers a translated headline above everything', () => {
    expect(resolveHeadline({ headline: 'Deutsche Überschrift', specific_results: 'Alt' }, row)).toBe(
      'Deutsche Überschrift',
    );
  });

  it('falls back to a translated specific_results before the English headline', () => {
    expect(resolveHeadline({ specific_results: 'Reduzierter Bluthochdruck' }, row)).toBe(
      'Reduzierter Bluthochdruck',
    );
  });

  it('uses the canonical English headline when no translation exists', () => {
    expect(resolveHeadline({}, row)).toBe('English headline');
  });

  it('falls back to the raw specific_results when there is no headline at all', () => {
    expect(resolveHeadline({}, { headline: null, specific_results: 'Reduced Hypertension' })).toBe(
      'Reduced Hypertension',
    );
  });

  it('returns an empty string when nothing is available', () => {
    expect(resolveHeadline({}, { headline: null, specific_results: null })).toBe('');
  });
});
