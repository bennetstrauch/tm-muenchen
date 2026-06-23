import { describe, it, expect, vi, afterEach } from 'vitest';
import { readDeCopy, commitDeCopy, GitHubConflictError } from './github-copy';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

afterEach(() => vi.clearAllMocks());

const FAKE_CONTENT = { Hero: { badge: 'Test' } };
const ENCODED = Buffer.from(JSON.stringify(FAKE_CONTENT, null, 2)).toString('base64');
const FAKE_SHA = 'abc123';

describe('readDeCopy', () => {
  it('calls the GitHub contents API for messages/de.json', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ content: ENCODED + '\n', sha: FAKE_SHA }),
    });
    await readDeCopy();
    const [url] = mockFetch.mock.calls[0] as [string, RequestInit];
    expect(url).toContain('messages/de.json');
    expect(url).toContain('api.github.com');
  });

  it('sends Authorization header', async () => {
    process.env.GITHUB_COPY_TOKEN = 'ghp_test';
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ content: ENCODED + '\n', sha: FAKE_SHA }),
    });
    await readDeCopy();
    const [, options] = mockFetch.mock.calls[0] as [string, RequestInit & { headers: Record<string, string> }];
    expect(options.headers['Authorization']).toBe('token ghp_test');
  });

  it('returns parsed content and sha', async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ content: ENCODED + '\n', sha: FAKE_SHA }),
    });
    const result = await readDeCopy();
    expect(result.sha).toBe(FAKE_SHA);
    expect(result.content).toEqual(FAKE_CONTENT);
  });

  it('throws on non-2xx response', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404, text: async () => 'Not Found' });
    await expect(readDeCopy()).rejects.toThrow('404');
  });
});

describe('commitDeCopy', () => {
  it('sends the SHA in the request body', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    await commitDeCopy(FAKE_CONTENT, FAKE_SHA);
    const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(options.body as string);
    expect(body.sha).toBe(FAKE_SHA);
  });

  it('uses the admin bot commit author and [skip-notify] message', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({}) });
    await commitDeCopy(FAKE_CONTENT, FAKE_SHA);
    const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(options.body as string);
    expect(body.message).toContain('[skip-notify]');
    expect(body.committer.email).toBe('admin-bot@tm-muenchen.de');
  });

  it('throws on non-2xx response', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 422, text: async () => 'Unprocessable' });
    await expect(commitDeCopy(FAKE_CONTENT, FAKE_SHA)).rejects.toThrow('422');
  });

  it('throws GitHubConflictError on 409 (stale SHA conflict)', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 409, text: async () => 'Conflict' });
    await expect(commitDeCopy(FAKE_CONTENT, FAKE_SHA)).rejects.toBeInstanceOf(GitHubConflictError);
  });
});
