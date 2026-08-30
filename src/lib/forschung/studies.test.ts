import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getStudies } from './studies';

// Proxy-based Supabase chain mock (same pattern as veranstaltungen.test.ts).
// Any method returns the chain; eq calls are captured so we can assert that
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

function mockSupabase(data: unknown) {
  const captured = { eqCalls: [] as [string, unknown][] };
  const client = { from: (_: string) => makeChain({ data, error: null }, captured) };
  return { client, captured };
}

vi.mock('../supabase', () => ({ getSupabase: vi.fn() }));
import { getSupabase } from '../supabase';

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
  abstract_de: 'Eine sorgfältig kontrollierte randomisierte Studie…',
  citation_raw: 'Alexander CN … 1989 57(6):950-964 …',
  citation_raw_de: 'Alexander CN … 1989 … Eine sorgfältig …',
  doi_url: 'https://doi.org/10.1037/0022-3514.57.6.950',
  updated_at: '2026-08-30T00:00:00Z',
};

describe('getStudies', () => {
  beforeEach(() => vi.clearAllMocks());

  it('maps a snake_case DB row to a camelCase Study', async () => {
    const { client } = mockSupabase([DB_ROW]);
    vi.mocked(getSupabase).mockReturnValue(client as unknown as ReturnType<typeof getSupabase>);

    const result = await getStudies();

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'abc123',
      topic: 'Health',
      specificResults: 'Reduced Hypertension',
      isRctMeta: true,
      year: 1989,
      abstractDe: 'Eine sorgfältig kontrollierte randomisierte Studie…',
      citationRaw: 'Alexander CN … 1989 57(6):950-964 …',
      citationRawDe: 'Alexander CN … 1989 … Eine sorgfältig …',
      doiUrl: 'https://doi.org/10.1037/0022-3514.57.6.950',
    });
  });

  it('applies NO tenant filter (Forschung is global — ADR 0012)', async () => {
    const { client, captured } = mockSupabase([DB_ROW]);
    vi.mocked(getSupabase).mockReturnValue(client as unknown as ReturnType<typeof getSupabase>);

    await getStudies();

    expect(captured.eqCalls.some(([col]) => col === 'tenant')).toBe(false);
  });

  it('returns an empty array when the table is empty', async () => {
    const { client } = mockSupabase(null);
    vi.mocked(getSupabase).mockReturnValue(client as unknown as ReturnType<typeof getSupabase>);

    expect(await getStudies()).toEqual([]);
  });
});
