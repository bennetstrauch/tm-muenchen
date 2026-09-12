import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getStudies } from './studies';

// Proxy-based Supabase chain mock (same pattern as veranstaltungen.test.ts).
// from() dispatches per table so we can supply both the base `studies` rows and
// the `study_translations` overlay rows. eq() calls are captured to assert that
// Forschung applies NO tenant filter (ADR 0012 — the corpus is not tenant-scoped).
function makeChain(result: unknown, captured: { eqCalls: [string, unknown][] }): unknown {
  return new Proxy({} as Record<string, unknown>, {
    get(_, key: string) {
      if (key === 'then') return (fn: (v: unknown) => unknown) => Promise.resolve(result).then(fn);
      if (key === 'eq') return (col: string, val: unknown) => {
        captured.eqCalls.push([col, val]);
        return makeChain(result, captured);
      };
      return (..._args: unknown[]) => makeChain(result, captured);
    },
  });
}

function mockSupabase(studiesData: unknown, translationsData: unknown = []) {
  const captured = { eqCalls: [] as [string, unknown][] };
  const client = {
    from: (table: string) =>
      makeChain(
        { data: table === 'study_translations' ? translationsData : studiesData, error: null },
        captured,
      ),
  };
  return { client, captured };
}

vi.mock('../supabase', () => ({ getSupabase: vi.fn() }));
import { getSupabase } from '../supabase';

function useClient(client: unknown) {
  vi.mocked(getSupabase).mockReturnValue(client as unknown as ReturnType<typeof getSupabase>);
}

const DB_ROW = {
  id: 'abc123',
  topic: 'Health',
  field: 'Physiological',
  specialty: 'Cardiovascular',
  specific_results: 'Reduced Hypertension',
  is_rct_meta: true,
  year: 1989,
  authors: 'Alexander CN',
  title: 'Transcendental Meditation, mindfulness, and longevity',
  journal: 'Journal of Personality and Social Psychology',
  abstract: 'A meticulously controlled randomized study…',
  citation_raw: 'Alexander CN … 1989 57(6):950-964 …',
  doi_url: 'https://doi.org/10.1037/0022-3514.57.6.950',
  updated_at: '2026-08-30T00:00:00Z',
};

const tr = (field: string, value: string, locale = 'de') => ({ study_id: 'abc123', locale, field, value });

describe('getStudies', () => {
  beforeEach(() => vi.clearAllMocks());

  it('maps a snake_case DB row to a camelCase Study, English display when locale is en', async () => {
    useClient(mockSupabase([DB_ROW]).client);

    const [study] = await getStudies('en');

    expect(study).toMatchObject({
      id: 'abc123',
      topic: 'Health',
      specialty: 'Cardiovascular',
      specialtyLabel: 'Cardiovascular',
      specificResults: 'Reduced Hypertension',
      abstract: 'A meticulously controlled randomized study…',
      abstractPending: false,
      isRctMeta: true,
      year: 1989,
      doiUrl: 'https://doi.org/10.1037/0022-3514.57.6.950',
    });
  });

  it('overlays translated display text over the English base for the given locale', async () => {
    const translations = [
      tr('specific_results', 'Verringerte Hypertonie'),
      tr('specialty', 'Herz-Kreislauf'),
    ];
    useClient(mockSupabase([DB_ROW], translations).client);

    const [study] = await getStudies('de');

    expect(study.specificResults).toBe('Verringerte Hypertonie');
    expect(study.specialtyLabel).toBe('Herz-Kreislauf');
  });

  it('keeps topic/specialty as canonical English keys even when a label is translated', async () => {
    useClient(mockSupabase([DB_ROW], [tr('specialty', 'Herz-Kreislauf')]).client);

    const [study] = await getStudies('de');

    expect(study.specialty).toBe('Cardiovascular');
    expect(study.specialtyLabel).toBe('Herz-Kreislauf');
  });

  it('falls back to the English abstract and flags it pending when no translation exists', async () => {
    useClient(mockSupabase([DB_ROW], [tr('specific_results', 'Verringerte Hypertonie')]).client);

    const [study] = await getStudies('de');

    expect(study.abstract).toBe('A meticulously controlled randomized study…');
    expect(study.abstractPending).toBe(true);
  });

  it('does not flag pending for the English source locale', async () => {
    useClient(mockSupabase([DB_ROW]).client);

    const [study] = await getStudies('en');

    expect(study.abstractPending).toBe(false);
  });

  it('applies NO tenant filter (Forschung is global — ADR 0012)', async () => {
    const { client, captured } = mockSupabase([DB_ROW], [tr('specialty', 'Herz-Kreislauf')]);
    useClient(client);

    await getStudies('de');

    expect(captured.eqCalls.some(([col]) => col === 'tenant')).toBe(false);
  });

  it('returns an empty array when the corpus is empty', async () => {
    useClient(mockSupabase([]).client);
    expect(await getStudies('de')).toEqual([]);
  });

  it('throws when the studies query returns null (masking an error as empty is wrong — craft R1)', async () => {
    useClient(mockSupabase(null).client);
    await expect(getStudies('de')).rejects.toThrow();
  });
});
