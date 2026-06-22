import { describe, it, expect, vi, beforeEach } from 'vitest';

const FAKE_SHA = 'sha-abc';
const FAKE_DE = {
  Themes: { stress: { headline0: 'Endlich abschalten.', headline1: 'Ohne Anstrengung.', subtitle: 'sub' } },
  ForWhom: { item0Title: 'Stress-Titel', item0Description: 'Beschreibung' },
  AbschlussCta: { heading: 'Heading', body: 'Body' },
};

const mockRead = vi.fn(async () => ({ content: FAKE_DE, sha: FAKE_SHA }));
const mockCommit = vi.fn(async () => {});

vi.mock('@/lib/github-copy', () => ({
  readDeCopy: mockRead,
  commitDeCopy: mockCommit,
}));

// Mock admin session gate — allow by default
vi.mock('@/lib/admin-api-gate', () => ({
  isAuthorizedAdminApi: vi.fn(async () => true),
}));

vi.mock('@/lib/tenant', () => ({
  getCurrentTenant: vi.fn(async () => ({ tenant: 'muenchen' })),
}));

beforeEach(() => {
  vi.clearAllMocks();
  mockRead.mockResolvedValue({ content: FAKE_DE, sha: FAKE_SHA });
  mockCommit.mockResolvedValue(undefined);
});

function makeRequest(method: string, body?: unknown): Request {
  return new Request('http://localhost/api/admin/texte', {
    method,
    headers: { 'content-type': 'application/json', 'cookie': 'admin-session=test' },
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe('GET /api/admin/texte', () => {
  it('returns only subset keys from de.json', async () => {
    const { GET } = await import('./route');
    const res = await GET(makeRequest('GET'));
    expect(res.status).toBe(200);
    const data = await res.json() as Record<string, string>;
    // Subset keys are returned
    expect(data['Themes.stress.headline0']).toBe('Endlich abschalten.');
    expect(data['ForWhom.item0Title']).toBe('Stress-Titel');
    // Non-subset keys are not returned
    expect(data['Hero']).toBeUndefined();
  });

  it('returns 401 for unauthenticated requests', async () => {
    const { isAuthorizedAdminApi } = await import('@/lib/admin-api-gate');
    vi.mocked(isAuthorizedAdminApi).mockResolvedValueOnce(false);
    const { GET } = await import('./route');
    const res = await GET(makeRequest('GET'));
    expect(res.status).toBe(401);
  });
});

describe('PUT /api/admin/texte', () => {
  it('commits only allowed subset keys, ignoring non-subset keys', async () => {
    const { PUT } = await import('./route');
    const res = await PUT(makeRequest('PUT', {
      'Themes.stress.headline0': 'Neuer Titel',
      'Hero.badge': 'HACKED', // not in subset — should be ignored
    }));
    expect(res.status).toBe(200);
    const [committed] = mockCommit.mock.calls[0] as unknown as [Record<string, unknown>, string];
    // Subset key updated
    const themes = committed['Themes'] as Record<string, Record<string, Record<string, string>>>;
    expect(themes.stress.headline0).toBe('Neuer Titel');
    // Non-subset key untouched
    expect((committed['Hero'] as Record<string, string>)?.badge).not.toBe('HACKED');
  });

  it('passes the sha from readDeCopy to commitDeCopy', async () => {
    const { PUT } = await import('./route');
    await PUT(makeRequest('PUT', { 'Themes.stress.headline0': 'X' }));
    const [, sha] = mockCommit.mock.calls[0] as unknown as [unknown, string];
    expect(sha).toBe(FAKE_SHA);
  });

  it('returns 401 for unauthenticated requests', async () => {
    const { isAuthorizedAdminApi } = await import('@/lib/admin-api-gate');
    vi.mocked(isAuthorizedAdminApi).mockResolvedValueOnce(false);
    const { PUT } = await import('./route');
    const res = await PUT(makeRequest('PUT', {}));
    expect(res.status).toBe(401);
  });
});
