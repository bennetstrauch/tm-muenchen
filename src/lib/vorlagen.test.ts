import { describe, it, expect, vi, beforeEach } from 'vitest';
import { getAllVorlagen, createVorlage } from './vorlagen';

function makeChain(result: unknown, captured: { lastInsert: unknown; eqCalls: [string, unknown][] }): unknown {
  return new Proxy({} as Record<string, unknown>, {
    get(_, key: string) {
      if (key === 'then') return (fn: (v: unknown) => unknown) => Promise.resolve(result).then(fn);
      if (key === 'single') return () => Promise.resolve(result);
      if (key === 'insert') return (data: unknown) => {
        captured.lastInsert = data;
        return makeChain({ data: { id: 'test-uuid', ...(data as object) }, error: null }, captured);
      };
      if (key === 'eq') return (col: string, val: unknown) => {
        captured.eqCalls.push([col, val]);
        return makeChain(result, captured);
      };
      return (..._args: unknown[]) => makeChain(result, captured);
    },
  });
}

function mockSupabase(data: unknown) {
  const captured = { lastInsert: null as unknown, eqCalls: [] as [string, unknown][] };
  const client = { from: (_: string) => makeChain({ data, error: null }, captured) };
  return { client, captured };
}

vi.mock('./supabase', () => ({ getSupabase: vi.fn() }));
import { getSupabase } from './supabase';

const DB_ROW = {
  id: 'uuid-v1',
  tenant: 'muenchen',
  name: 'Infoabend Vorlage',
  title: 'Infoabend',
  subtitle: '',
  description: '',
  long_description: '',
  date: null,
  time: '19:00',
  location: 'München',
  is_online: false,
  online_link: '',
  hosts: '',
  price: '',
  target_audience: '',
  notes: '',
  reminder1_hours: 24,
  reminder2_hours: 0,
  registration_open: true,
  visible: true,
  is_priority: false,
  image_url: null,
  auch_fuer_nicht_meditierende: false,
  slug: null,
  end_time: null,
  reminder_subject1: null,
  reminder_body1: null,
  reminder_subject2: null,
  reminder_body2: null,
};

describe('getAllVorlagen', () => {
  beforeEach(() => vi.clearAllMocks());

  it('returns vorlagen mapped to the Vorlage type', async () => {
    const { client } = mockSupabase([DB_ROW]);
    vi.mocked(getSupabase).mockReturnValue(client as ReturnType<typeof getSupabase>);

    const result = await getAllVorlagen('muenchen');

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({
      id: 'uuid-v1',
      name: 'Infoabend Vorlage',
      longDescription: '',
      isOnline: false,
      reminder1Hours: 24,
    });
  });
});

describe('createVorlage', () => {
  beforeEach(() => vi.clearAllMocks());

  it('inserts with tenant and name', async () => {
    const { client, captured } = mockSupabase(null);
    vi.mocked(getSupabase).mockReturnValue(client as ReturnType<typeof getSupabase>);

    await createVorlage({
      name: 'Test Vorlage', title: '', subtitle: '', description: '', longDescription: '',
      date: '', time: '', location: '', isOnline: false, onlineLink: '', hosts: '',
      price: '', targetAudience: '', notes: '', reminder1Hours: 24, reminder2Hours: 0,
      registrationOpen: true, visible: true, isPriority: false, auchFuerNichtMeditierende: false,
    }, 'muenchen');

    const inserted = captured.lastInsert as Record<string, unknown>;
    expect(inserted.tenant).toBe('muenchen');
    expect(inserted.name).toBe('Test Vorlage');
  });
});
