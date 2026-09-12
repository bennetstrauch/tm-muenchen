import { describe, it, expect } from 'vitest';
import { filterStudies, specialtiesForTopic } from './filter-studies';
import type { Study } from './studies';

function makeStudy(overrides: Partial<Study> & { id: string }): Study {
  return {
    topic: 'Health',
    field: 'Physiological',
    specialty: 'Cardiovascular',
    specialtyLabel: 'Cardiovascular',
    specificResults: 'Reduced hypertension',
    isRctMeta: false,
    year: 1989,
    authors: 'Alexander CN',
    title: 'A study of transcendental meditation',
    journal: 'Journal of Personality',
    abstract: 'A randomized controlled trial on blood pressure.',
    abstractPending: false,
    citationRaw: '',
    ...overrides,
  };
}

const CORPUS: Study[] = [
  makeStudy({
    id: 'a',
    topic: 'Health',
    specialty: 'Cardiovascular',
    title: 'TM and blood pressure',
    abstract: 'Hypertension outcomes improved.',
    isRctMeta: true,
  }),
  makeStudy({
    id: 'b',
    topic: 'Health',
    specialty: 'Respiratory',
    title: 'TM and asthma',
    abstract: 'Lung function measured.',
    isRctMeta: false,
  }),
  makeStudy({
    id: 'c',
    topic: 'Mental Potential',
    specialty: 'Cognitive',
    title: 'Creativity and intelligence',
    abstract: 'Improvements in blood flow to the brain.',
    isRctMeta: true,
  }),
  makeStudy({
    id: 'd',
    topic: 'World Peace',
    specialty: 'Conflict',
    title: 'Group practice and social coherence',
    abstract: 'Reduced conflict during assemblies.',
    isRctMeta: false,
  }),
];

describe('filterStudies', () => {
  it('returns all studies when no criteria are given', () => {
    expect(filterStudies(CORPUS, {})).toHaveLength(4);
  });

  it('matches a keyword against the title', () => {
    const result = filterStudies(CORPUS, { keyword: 'asthma' });
    expect(result.map((s) => s.id)).toEqual(['b']);
  });

  it('matches a keyword against the abstract', () => {
    const result = filterStudies(CORPUS, { keyword: 'hypertension' });
    expect(result.map((s) => s.id)).toEqual(['a']);
  });

  it('matches keywords case-insensitively', () => {
    expect(filterStudies(CORPUS, { keyword: 'BLOOD' }).map((s) => s.id)).toEqual(['a', 'c']);
  });

  it('narrows by Topic', () => {
    const result = filterStudies(CORPUS, { topic: 'Health' });
    expect(result.map((s) => s.id)).toEqual(['a', 'b']);
  });

  it('narrows by Specialty within a Topic', () => {
    const result = filterStudies(CORPUS, { topic: 'Health', specialty: 'Respiratory' });
    expect(result.map((s) => s.id)).toEqual(['b']);
  });

  it('returns nothing when the Specialty belongs to a different Topic', () => {
    const result = filterStudies(CORPUS, { topic: 'Health', specialty: 'Cognitive' });
    expect(result).toHaveLength(0);
  });

  it('returns only RCT/Meta-analysis studies when rctOnly is set', () => {
    const result = filterStudies(CORPUS, { rctOnly: true });
    expect(result.map((s) => s.id)).toEqual(['a', 'c']);
  });

  it('composes keyword + Topic + RCT toggle', () => {
    const result = filterStudies(CORPUS, { keyword: 'blood', topic: 'Health', rctOnly: true });
    expect(result.map((s) => s.id)).toEqual(['a']);
  });

  it('ignores an empty or whitespace-only keyword', () => {
    expect(filterStudies(CORPUS, { keyword: '   ' })).toHaveLength(4);
  });
});

describe('specialtiesForTopic', () => {
  it('lists the unique specialties within a Topic, sorted', () => {
    expect(specialtiesForTopic(CORPUS, 'Health')).toEqual(['Cardiovascular', 'Respiratory']);
  });

  it('returns an empty list for an unknown Topic', () => {
    expect(specialtiesForTopic(CORPUS, 'Nonexistent')).toEqual([]);
  });

  it('excludes blank specialties', () => {
    const corpus = [makeStudy({ id: 'x', topic: 'Health', specialty: '' })];
    expect(specialtiesForTopic(corpus, 'Health')).toEqual([]);
  });
});
