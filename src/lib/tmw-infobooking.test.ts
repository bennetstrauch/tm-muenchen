import { describe, it, expect, vi, afterEach } from 'vitest';
import { requestInfoTermin } from './tmw-infobooking';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

afterEach(() => {
  vi.clearAllMocks();
});

const BASE_PARAMS = {
  first_name: 'Anna',
  last_name: 'Müller',
  email: 'anna@example.com',
  center: 42,
};

describe('requestInfoTermin', () => {
  it('posts to the TMW infobooking URL', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ id: 99 }) });
    await requestInfoTermin(BASE_PARAMS);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://tmw.meditation.de/api/infobooking',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('sends Authorization header with TMW_API_KEY', async () => {
    process.env.TMW_API_KEY = 'test-key';
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ id: 99 }) });
    await requestInfoTermin(BASE_PARAMS);
    const [, options] = mockFetch.mock.calls[0] as [string, RequestInit & { headers: Record<string, string> }];
    expect(options.headers['Authorization']).toBe('Token test-key');
  });

  it('sends required fields in request body', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ id: 99 }) });
    await requestInfoTermin(BASE_PARAMS);
    const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(options.body as string);
    expect(body).toMatchObject({
      first_name: 'Anna',
      last_name: 'Müller',
      email: 'anna@example.com',
      center: 42,
    });
  });

  it('sends optional fields when provided', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ id: 99 }) });
    await requestInfoTermin({
      ...BASE_PARAMS,
      phone_number: '+4989123456',
      message: 'Dienstags bin ich frei.',
      news_subscribed: true,
      source: 'tm-muenchen.de',
      zip_code: '80331',
    });
    const [, options] = mockFetch.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(options.body as string);
    expect(body.phone_number).toBe('+4989123456');
    expect(body.message).toBe('Dienstags bin ich frei.');
    expect(body.news_subscribed).toBe(true);
    expect(body.source).toBe('tm-muenchen.de');
    expect(body.zip_code).toBe('80331');
  });

  it('returns the TMW registration id on success', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ id: 123 }) });
    const id = await requestInfoTermin(BASE_PARAMS);
    expect(id).toBe(123);
  });

  it('throws on non-2xx response', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 400, text: async () => 'Bad Request' });
    await expect(requestInfoTermin(BASE_PARAMS)).rejects.toThrow('400');
  });
});
