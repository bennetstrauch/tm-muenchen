import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

const mockFetch = vi.fn();
vi.stubGlobal("fetch", mockFetch);

beforeEach(() => {
  process.env.TMW_API_KEY = "test-key";
  mockFetch.mockReset();
});

afterEach(() => {
  delete process.env.TMW_API_KEY;
});

function makeTmwResponse(overrides: object = {}) {
  return {
    name: "TM München",
    lectures: [
      { pk: 1, date: "1. Juli 2026, um 19:00", webinar_link: null },
      { pk: 2, date: "2. Juli 2026, um 19:00", webinar_link: null },
    ],
    teachers: [
      { name: "Bennet Strauch" },
      { name: "Malena Koch" },
    ],
    ...overrides,
  };
}

function makeRequest(body: object): Request {
  return new Request("http://localhost/api/super-admin/tmw-test", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("POST /api/super-admin/tmw-test", () => {
  it("returns lecture count and teacher names for a valid center ID", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => makeTmwResponse(),
    });

    const { POST } = await import("./route");
    const res = await POST(makeRequest({ centerIds: [108] }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body[108].lectureCount).toBe(2);
    expect(body[108].teachers).toEqual(["Bennet Strauch", "Malena Koch"]);
  });

  it("returns an error entry for an invalid center ID", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 404 });

    const { POST } = await import("./route");
    const res = await POST(makeRequest({ centerIds: [999] }));
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body[999].error).toBeDefined();
  });

  it("handles multiple IDs in a single request", async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => makeTmwResponse() })
      .mockResolvedValueOnce({ ok: false, status: 404 });

    const { POST } = await import("./route");
    const res = await POST(makeRequest({ centerIds: [108, 999] }));
    const body = await res.json();
    expect(body[108].lectureCount).toBe(2);
    expect(body[999].error).toBeDefined();
  });

  it("returns 500 when TMW_API_KEY is not configured", async () => {
    delete process.env.TMW_API_KEY;
    const { POST } = await import("./route");
    const res = await POST(makeRequest({ centerIds: [108] }));
    expect(res.status).toBe(500);
  });
});
