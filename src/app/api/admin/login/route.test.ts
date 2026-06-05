import { describe, it, expect, beforeEach, vi } from "vitest";
import bcrypt from "bcryptjs";

const passwordHash = bcrypt.hashSync("correct-password", 10);

vi.mock("@/lib/tenant", () => ({
  getCurrentTenant: vi.fn(async () => ({
    tenant: "muenchen",
    admin_password_hash: passwordHash,
  })),
}));

beforeEach(() => {
  process.env.ADMIN_TOKEN_SECRET = "test-secret";
});

function loginRequest(body: object): Request {
  return new Request("http://localhost/api/admin/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

describe("admin login", () => {
  it("sets a session cookie when the password matches the tenant hash", async () => {
    const { POST } = await import("./route");
    const res = await POST(loginRequest({ password: "correct-password" }));
    expect(res.status).toBe(200);
    expect(res.headers.get("set-cookie")).toMatch(/admin-session=/);
  });

  it("returns 401 and sets no cookie when the password is wrong", async () => {
    const { POST } = await import("./route");
    const res = await POST(loginRequest({ password: "wrong-password" }));
    expect(res.status).toBe(401);
    expect(res.headers.get("set-cookie")).toBeNull();
  });
});
