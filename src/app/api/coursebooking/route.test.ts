import { describe, it, expect, vi, beforeEach } from 'vitest';

const mockBookCourse = vi.fn();
const mockInsertKursAnmeldung = vi.fn();
const mockGetCurrentTenant = vi.fn(async () => ({ tenant: 'muenchen' }));

vi.mock('@/lib/course-booking', () => ({ bookCourse: mockBookCourse }));
vi.mock('@/lib/kurs-anmeldungen', () => ({ insertKursAnmeldung: mockInsertKursAnmeldung }));
vi.mock('@/lib/tenant', () => ({ getCurrentTenant: mockGetCurrentTenant }));

beforeEach(() => {
  vi.clearAllMocks();
  mockInsertKursAnmeldung.mockResolvedValue(undefined);
});

function makeRequest(body: object) {
  return new Request('http://localhost/api/coursebooking', {
    method: 'POST',
    headers: { 'content-type': 'application/json', host: 'tm-muenchen.de' },
    body: JSON.stringify(body),
  });
}

const VALID_BODY = {
  slot: 123,
  first_name: 'Maria',
  last_name: 'Huber',
  email: 'maria@example.com',
  gender: 'F',
  birthdate: '24.12.1990',
  locale: 'de',
};

describe('POST /api/coursebooking', () => {
  it('returns 400 when slot is missing', async () => {
    const { POST } = await import('./route');
    const { slot: _, ...body } = VALID_BODY;
    const res = await POST(makeRequest(body));
    expect(res.status).toBe(400);
  });

  it('returns 400 when email is missing', async () => {
    const { POST } = await import('./route');
    const { email: _, ...body } = VALID_BODY;
    const res = await POST(makeRequest(body));
    expect(res.status).toBe(400);
  });

  it('returns 400 when gender is missing', async () => {
    const { POST } = await import('./route');
    const { gender: _, ...body } = VALID_BODY;
    const res = await POST(makeRequest(body));
    expect(res.status).toBe(400);
  });

  it('returns 400 when birthdate is missing', async () => {
    const { POST } = await import('./route');
    const { birthdate: _, ...body } = VALID_BODY;
    const res = await POST(makeRequest(body));
    expect(res.status).toBe(400);
  });

  it('calls bookCourse with the correct payload and returns { id }', async () => {
    mockBookCourse.mockResolvedValueOnce({ id: 42 });
    const { POST } = await import('./route');
    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.id).toBe(42);
    expect(mockBookCourse).toHaveBeenCalledWith(expect.objectContaining({
      slot: 123,
      email: 'maria@example.com',
      gender: 'F',
      birthdate: '24.12.1990',
    }));
  });

  it('returns 502 when bookCourse throws', async () => {
    mockBookCourse.mockRejectedValueOnce(new Error('TMW down'));
    const { POST } = await import('./route');
    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(502);
  });

  it('still returns 200 when Supabase backup fails', async () => {
    mockBookCourse.mockResolvedValueOnce({ id: 7 });
    mockInsertKursAnmeldung.mockRejectedValueOnce(new Error('Supabase down'));
    const { POST } = await import('./route');
    const res = await POST(makeRequest(VALID_BODY));
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(data.id).toBe(7);
  });
});
