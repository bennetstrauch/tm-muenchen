import { describe, it, expect, beforeEach, afterEach } from "vitest";
import bcrypt from "bcryptjs";

const correctHash = bcrypt.hashSync("correct-password", 10);

function loginRequest(body: object): Request {
  return new Request("http://localhost/api/super-admin/login", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
}

beforeEach(() => {
  process.env.ADMIN_TOKEN_SECRET = "test-secret";
  process.env.SUPER_ADMIN_PASSWORD_HASH = correctHash;
});

afterEach(() => {
  delete process.env.SUPER_ADMIN_PASSWORD_HASH;
});

describe("super-admin login", () => {
  it("sets a super-admin-session cookie when the password matches", async () => {
    const { POST } = await import("./route");
    const res = await POST(loginRequest({ password: "correct-password" }));
    expect(res.status).toBe(200);
    expect(res.headers.get("set-cookie")).toMatch(/super-admin-session=/);
  });

  it("returns 401 and sets no cookie when the password is wrong", async () => {
    const { POST } = await import("./route");
    const res = await POST(loginRequest({ password: "wrong-password" }));
    expect(res.status).toBe(401);
    expect(res.headers.get("set-cookie")).toBeNull();
  });

  it("returns 500 when SUPER_ADMIN_PASSWORD_HASH is not configured", async () => {
    delete process.env.SUPER_ADMIN_PASSWORD_HASH;
    const { POST } = await import("./route");
    const res = await POST(loginRequest({ password: "correct-password" }));
    expect(res.status).toBe(500);
  });
});
