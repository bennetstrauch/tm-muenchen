import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { bookCourse } from './course-booking';

const mockFetch = vi.fn();

const BASE_PARAMS = {
  slot: 123,
  first_name: 'Maria',
  last_name: 'Huber',
  email: 'maria@example.com',
  gender: 'F' as const,
  birthdate: '24.12.1990',
};

describe('bookCourse', () => {
  beforeEach(() => vi.stubGlobal('fetch', mockFetch));
  afterEach(() => { vi.clearAllMocks(); vi.unstubAllGlobals(); });
  it('posts to the TMW coursebooking URL', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ id: 42 }) });
    await bookCourse(BASE_PARAMS);
    expect(mockFetch).toHaveBeenCalledWith(
      'https://tmw.meditation.de/api/coursebooking',
      expect.objectContaining({ method: 'POST' }),
    );
  });

  it('sends Authorization header with TMW_API_KEY', async () => {
    process.env.TMW_API_KEY = 'test-key';
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ id: 42 }) });
    await bookCourse(BASE_PARAMS);
    const [, opts] = mockFetch.mock.calls[0] as [string, RequestInit & { headers: Record<string, string> }];
    expect(opts.headers['Authorization']).toBe('Token test-key');
  });

  it('sends all required fields in the request body', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ id: 42 }) });
    await bookCourse(BASE_PARAMS);
    const [, opts] = mockFetch.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(opts.body as string);
    expect(body).toMatchObject({
      slot: 123,
      first_name: 'Maria',
      last_name: 'Huber',
      email: 'maria@example.com',
      gender: 'F',
      birthdate: '24.12.1990',
    });
  });

  it('sends optional fields when provided', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ id: 42 }) });
    await bookCourse({
      ...BASE_PARAMS,
      phone_number: '+4989123456',
      address1: 'Musterstraße 1',
      zip_code: '80331',
      city: 'München',
      news_subscribed: true,
      source: 'tm-muenchen.de',
    });
    const [, opts] = mockFetch.mock.calls[0] as [string, RequestInit];
    const body = JSON.parse(opts.body as string);
    expect(body.phone_number).toBe('+4989123456');
    expect(body.address1).toBe('Musterstraße 1');
    expect(body.zip_code).toBe('80331');
    expect(body.city).toBe('München');
    expect(body.news_subscribed).toBe(true);
    expect(body.source).toBe('tm-muenchen.de');
  });

  it('returns { id } on success', async () => {
    mockFetch.mockResolvedValueOnce({ ok: true, json: async () => ({ id: 99 }) });
    const result = await bookCourse(BASE_PARAMS);
    expect(result.id).toBe(99);
  });

  it('throws on non-2xx response', async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 400, text: async () => 'Bad Request' });
    await expect(bookCourse(BASE_PARAMS)).rejects.toThrow('400');
  });
});

// Integration test — requires TMW_COURSEBOOKING_TEST=1 set explicitly (read-only key is insufficient)
describe.skipIf(!process.env.TMW_COURSEBOOKING_TEST)('bookCourse integration', () => {
  it('creates a booking and returns a numeric id', async () => {
    // Uses slot pk 18602 (Bennet Strauch, München, 11. Juli 2026)
    // This will book a real slot — only run manually
    const result = await bookCourse({
      slot: 18602,
      first_name: 'Integration',
      last_name: 'Test',
      email: 'bennetstrauch@googlemail.com',
      gender: 'M',
      birthdate: '01.01.1990',
      source: 'tm-muenchen.de',
    });
    expect(typeof result.id).toBe('number');
    expect(result.id).toBeGreaterThan(0);
  });
});
