import { describe, it, expect, beforeEach, vi } from "vitest";
import bcrypt from "bcryptjs";

const existingHash = bcrypt.hashSync("old-password", 10);

const mockFrom = vi.fn();
const mockUpdate = vi.fn();
const mockEq = vi.fn();
const mockSelect = vi.fn();
const mockSingle = vi.fn();

vi.mock("@/lib/supabase", () => ({
  getSupabase: () => ({ from: mockFrom }),
}));

beforeEach(() => {
  vi.resetModules();
  mockFrom.mockReset();
  mockUpdate.mockReset();
  mockEq.mockReset();
  mockSelect.mockReset();
  mockSingle.mockReset();

  mockEq.mockResolvedValue({ data: { tenant: "berlin" }, error: null });
  mockUpdate.mockReturnValue({ eq: mockEq });
  mockSingle.mockResolvedValue({ data: { tenant: "berlin", admin_password_hash: existingHash }, error: null });
  mockSelect.mockReturnValue({ eq: () => ({ single: mockSingle }) });
  mockFrom.mockReturnValue({ update: mockUpdate, select: mockSelect });
});

function makePut(slug: string, body: object): Request {
  return new Request(`http://localhost/api/super-admin/tenants/${slug}`, {
    method: "PUT",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("PUT /api/super-admin/tenants/[slug]", () => {
  it("hashes a new password when provided", async () => {
    const { PUT } = await import("./route");
    await PUT(makePut("berlin", {
      hostname: "tm-berlin.de",
      city: "Berlin",
      password: "new-password",
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
    }), { params: Promise.resolve({ slug: "berlin" }) });

    const updatedRow = mockUpdate.mock.calls[0][0];
    expect(await bcrypt.compare("new-password", updatedRow.admin_password_hash)).toBe(true);
  });

  it("preserves the existing hash when password field is blank", async () => {
    const { PUT } = await import("./route");
    await PUT(makePut("berlin", {
      hostname: "tm-berlin.de",
      city: "Berlin",
      password: "",
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
    }), { params: Promise.resolve({ slug: "berlin" }) });

    const updatedRow = mockUpdate.mock.calls[0][0];
    expect(updatedRow.admin_password_hash).toBe(existingHash);
  });
});
