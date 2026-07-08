import { describe, it, expect, beforeEach, vi } from "vitest";
import bcrypt from "bcryptjs";

const mockFrom = vi.fn();
const mockSelect = vi.fn();
const mockOrder = vi.fn();
const mockInsert = vi.fn();
const mockSingle = vi.fn();

vi.mock("@/lib/supabase", () => ({
  getSupabase: () => ({ from: mockFrom }),
}));

beforeEach(() => {
  vi.resetModules();
  mockFrom.mockReset();
  mockSelect.mockReset();
  mockOrder.mockReset();
  mockInsert.mockReset();
  mockSingle.mockReset();

  mockOrder.mockResolvedValue({ data: [], error: null });
  mockSelect.mockReturnValue({ order: mockOrder });
  mockInsert.mockReturnValue({ select: () => ({ single: mockSingle }) });
  mockSingle.mockResolvedValue({ data: { tenant: "berlin" }, error: null });
  mockFrom.mockReturnValue({ select: mockSelect, insert: mockInsert });
});

function makeRequest(method: string, body?: object): Request {
  return new Request("http://localhost/api/super-admin/tenants", {
    method,
    headers: { "content-type": "application/json" },
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe("GET /api/super-admin/tenants", () => {
  it("returns all tenant rows", async () => {
    const rows = [
      { tenant: "muenchen", hostname: "tm-muenchen.de", city: "München" },
      { tenant: "berlin", hostname: "tm-berlin.de", city: "Berlin" },
    ];
    mockOrder.mockResolvedValue({ data: rows, error: null });

    const { GET } = await import("./route");
    const res = await GET();
    expect(res.status).toBe(200);
    const body = await res.json();
    expect(body).toHaveLength(2);
    expect(body[0].tenant).toBe("muenchen");
  });
});

describe("POST /api/super-admin/tenants", () => {
  it("hashes the plaintext password before inserting", async () => {
    const { POST } = await import("./route");
    await POST(makeRequest("POST", {
      tenant: "berlin",
      hostname: "tm-berlin.de",
      city: "Berlin",
      password: "plain-text",
      active_locales: ["de"],
      tmw_center_ids: "200",
      contact_email: "info@tm-berlin.de",
      contact_phone: "030123",
      from_email: "info@tm-berlin.de",
      instagram_link: "",
      whatsapp_enabled: false,
      whatsapp_link: "",
      center_image_url: "",
      impressum_content: "",
    }));

    const insertedRow = mockInsert.mock.calls[0][0];
    expect(insertedRow.admin_password_hash).toBeDefined();
    expect(insertedRow.admin_password_hash).not.toBe("plain-text");
    expect(await bcrypt.compare("plain-text", insertedRow.admin_password_hash)).toBe(true);
  });

  it("saves meditators_*_url fields; empty string becomes null", async () => {
    const { POST } = await import("./route");
    await POST(makeRequest("POST", {
      tenant: "juechen",
      hostname: "tm.yoga-und-meditation.com",
      city: "Jüchen",
      password: "pw",
      active_locales: ["de"],
      tmw_center_ids: "190",
      contact_email: "a@b.de",
      contact_phone: "0",
      from_email: "",
      instagram_link: "",
      whatsapp_enabled: false,
      whatsapp_link: "",
      center_image_url: "",
      impressum_content: "",
      meditators_ueberpruefung_url: "https://yoga-und-meditation.com/checking",
      meditators_vertiefung_url: "",
      meditators_treffen_url: "https://yoga-und-meditation.com/treffen",
      meditators_fortgeschrittenentechniken_url: "",
    }));
    const row = mockInsert.mock.calls[0][0];
    expect(row.meditators_ueberpruefung_url).toBe("https://yoga-und-meditation.com/checking");
    expect(row.meditators_vertiefung_url).toBeNull();
    expect(row.meditators_treffen_url).toBe("https://yoga-und-meditation.com/treffen");
    expect(row.meditators_fortgeschrittenentechniken_url).toBeNull();
  });

  it("saves legal_entity and legal_address for the Datenschutz Verantwortlicher block", async () => {
    const { POST } = await import("./route");
    await POST(makeRequest("POST", {
      tenant: "berlin",
      hostname: "tm-berlin.de",
      city: "Berlin",
      password: "pw",
      active_locales: ["de"],
      tmw_center_ids: "200",
      contact_email: "a@b.de",
      contact_phone: "0",
      from_email: "a@b.de",
      instagram_link: "",
      whatsapp_enabled: false,
      whatsapp_link: "",
      center_image_url: "",
      impressum_content: "",
      legal_entity: "Transzendentale Meditation Berlin e.V.",
      legal_address: "Beispielstraße 1\n10115 Berlin",
    }));

    const insertedRow = mockInsert.mock.calls[0][0];
    expect(insertedRow.legal_entity).toBe("Transzendentale Meditation Berlin e.V.");
    expect(insertedRow.legal_address).toBe("Beispielstraße 1\n10115 Berlin");
  });

  it("parses comma-separated tmw_center_ids into an int array", async () => {
    const { POST } = await import("./route");
    await POST(makeRequest("POST", {
      tenant: "berlin",
      hostname: "tm-berlin.de",
      city: "Berlin",
      password: "pw",
      active_locales: ["de"],
      tmw_center_ids: "200, 201",
      contact_email: "a@b.de",
      contact_phone: "0",
      from_email: "a@b.de",
      instagram_link: "",
      whatsapp_enabled: false,
      whatsapp_link: "",
      center_image_url: "",
      impressum_content: "",
    }));

    const insertedRow = mockInsert.mock.calls[0][0];
    expect(insertedRow.tmw_center_ids).toEqual([200, 201]);
  });
});
