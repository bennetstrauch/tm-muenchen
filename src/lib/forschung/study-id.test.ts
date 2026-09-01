import { describe, it, expect } from 'vitest';
import { studyId } from './study-id';
import type { ParsedCitation } from './parse-citation';

const cit = (o: Partial<ParsedCitation>): ParsedCitation => ({
  authors: 'Abrams AI, Siegel LM',
  title: 'The Transcendental Meditation program and rehabilitation at Folsom State Prison',
  journal: 'Criminal Justice and Behavior',
  year: 1978,
  abstract: 'irrelevant to identity',
  ...o,
});

describe('studyId', () => {
  it('is a short stable hex id', () => {
    const id = studyId(cit({}), 'raw');
    expect(id).toMatch(/^[0-9a-f]{16}$/);
  });

  it('is deterministic for the same citation identity', () => {
    expect(studyId(cit({}), 'raw A')).toBe(studyId(cit({}), 'raw B'));
  });

  it('ignores the abstract so a re-edited abstract does not create a duplicate row', () => {
    expect(studyId(cit({ abstract: 'v1' }), 'raw')).toBe(studyId(cit({ abstract: 'v2 rewritten' }), 'raw'));
  });

  it('ignores casing and whitespace noise in the identity fields', () => {
    const a = studyId(cit({ authors: 'Abrams AI, Siegel LM', title: 'The  Program' }), 'raw');
    const b = studyId(cit({ authors: 'abrams ai,  siegel lm', title: 'the program' }), 'raw');
    expect(a).toBe(b);
  });

  it('distinguishes two different studies', () => {
    expect(studyId(cit({ year: 1978 }), 'raw')).not.toBe(studyId(cit({ year: 1979 }), 'raw'));
  });

  it('falls back to the raw cell when the citation has no parsed title', () => {
    const a = studyId(cit({ title: '' }), 'Some unparseable citation blob');
    const b = studyId(cit({ title: '' }), 'A different unparseable blob');
    expect(a).not.toBe(b);
    expect(a).toMatch(/^[0-9a-f]{16}$/);
  });
});
