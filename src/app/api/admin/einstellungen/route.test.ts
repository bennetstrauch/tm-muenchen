import { describe, it, expect, beforeEach, vi } from "vitest";
import { checkAdminRequest } from "@/lib/admin-api-gate";

const tenantRow = {
  tenant: "muenchen",
  hostname: "tm-muenchen.de",
  admin_password_hash: "$2a$super-secret-hash",
  active_locales: ["de", "en"],
  whatsapp_enabled: true,
  whatsapp_link: "https://chat.whatsapp.com/x",
  whatsapp_number: "+49123456789",
  contact_email: "a@b.de",
  contact_phone: "123",
  from_email: "x",
  instagram_link: "y",
  city: "München",
  center_image_url: "https://blob.example.com/center/muenchen/photo.webp",
  tmw_center_ids: [1],
  impressum_content: "z",
  logo_url: null,
  logo_label: null,
  infoabend_duration_minutes: 30,
  show_teachers: true,
  show_meditators_section: true,
  center_banner_label: null,
};

vi.mock("@/lib/tenant", () => ({
  getCurrentTenant: vi.fn(async () => tenantRow),
}));

vi.mock("@/lib/admin-api-gate", () => ({
  checkAdminRequest: vi.fn(async () => true),
}));

const eq = vi.fn(async () => ({ error: null }));
const update = vi.fn(() => ({ eq }));
const from = vi.fn(() => ({ update }));
vi.mock("@/lib/supabase", () => ({ getSupabase: () => ({ from }) }));

beforeEach(() => {
  from.mockClear();
  update.mockClear();
  eq.mockClear();
});

function makeRequest(method: string, body?: unknown): Request {
  return new Request("http://localhost/api/admin/einstellungen", {
    method,
    headers: { "content-type": "application/json", "cookie": "admin-session=test" },
    body: body ? JSON.stringify(body) : undefined,
  });
}

describe("admin Einstellungen", () => {
  it("GET returns only the editable settings, including center_image_url and whatsapp_number, never the password hash", async () => {
    const { GET } = await import("./route");
    const data = await (await GET(makeRequest("GET"))).json();
    expect(data).toEqual({
      active_locales: ["de", "en"],
      whatsapp_enabled: true,
      whatsapp_link: "https://chat.whatsapp.com/x",
      whatsapp_number: "+49123456789",
      contact_email: "a@b.de",
      contact_phone: "123",
      center_image_url: "https://blob.example.com/center/muenchen/photo.webp",
      infoabend_duration_minutes: 30,
      show_meditators_section: true,
    });
    expect(data).not.toHaveProperty("admin_password_hash");
    expect(data).not.toHaveProperty("hostname");
  });

  it("PUT writes center_image_url and whatsapp_number along with other editable columns", async () => {
    const { PUT } = await import("./route");
    const req = new Request("http://localhost/api/admin/einstellungen", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        active_locales: ["de"],
        whatsapp_enabled: true,
        whatsapp_link: "https://chat.whatsapp.com/x",
        whatsapp_number: "+49123456789",
        contact_email: "new@b.de",
        contact_phone: "999",
        center_image_url: "https://blob.example.com/center/muenchen/new.webp",
      }),
    });

    const res = await PUT(req);

    expect(res.ok).toBe(true);
    expect(update).toHaveBeenCalledWith({
      active_locales: ["de"],
      whatsapp_enabled: true,
      whatsapp_link: "https://chat.whatsapp.com/x",
      whatsapp_number: "+49123456789",
      contact_email: "new@b.de",
      contact_phone: "999",
      center_image_url: "https://blob.example.com/center/muenchen/new.webp",
      infoabend_duration_minutes: 30,
      show_meditators_section: true,
    });
  });

  it("GET returns 401 for unauthenticated requests", async () => {
    vi.mocked(checkAdminRequest).mockResolvedValueOnce(false);
    const { GET } = await import("./route");
    const res = await GET(makeRequest("GET"));
    expect(res.status).toBe(401);
  });

  it("PUT returns 401 for unauthenticated requests", async () => {
    vi.mocked(checkAdminRequest).mockResolvedValueOnce(false);
    const { PUT } = await import("./route");
    const res = await PUT(makeRequest("PUT", {}));
    expect(res.status).toBe(401);
  });

  it("PUT ignores sensitive fields even when passed in the body", async () => {
    const { PUT } = await import("./route");
    const req = new Request("http://localhost/api/admin/einstellungen", {
      method: "PUT",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        active_locales: ["de"],
        whatsapp_enabled: false,
        whatsapp_link: null,
        contact_email: "new@b.de",
        contact_phone: "999",
        center_image_url: null,
        admin_password_hash: "HACKED",
        tenant: "berlin",
        hostname: "evil.de",
      }),
    });

    await PUT(req);

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const written = (update.mock.calls as any[][])[0][0];
    expect(written).not.toHaveProperty("admin_password_hash");
    expect(written).not.toHaveProperty("tenant");
    expect(written).not.toHaveProperty("hostname");
  });
});
