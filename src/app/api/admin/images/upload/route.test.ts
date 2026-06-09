import { describe, it, expect, vi, beforeEach } from "vitest";

vi.mock("sharp", () => ({
  default: () => ({
    resize: () => ({
      webp: () => ({
        toBuffer: async () => Buffer.from("fake-webp"),
      }),
    }),
  }),
}));

const putMock = vi.fn(async (path: string) => ({ url: `https://blob.vercel.app/${path}` }));
vi.mock("@vercel/blob", () => ({ put: putMock }));

vi.mock("@/lib/tenant", () => ({
  getCurrentTenant: vi.fn(async () => ({ tenant: "muenchen" })),
}));

beforeEach(() => {
  putMock.mockClear();
});

function makeImageFile(name = "photo.jpg", type = "image/jpeg"): File {
  return new File([new Uint8Array([1, 2, 3])], name, { type });
}

function makeRequest(file: File, prefix?: string): Request {
  const form = new FormData();
  form.append("file", file);
  if (prefix !== undefined) form.append("prefix", prefix);
  return new Request("http://localhost/api/admin/images/upload", {
    method: "POST",
    body: form,
  });
}

describe("image upload route", () => {
  it("stores under events/ when no prefix is given", async () => {
    const { POST } = await import("./route");
    await POST(makeRequest(makeImageFile()));
    expect(putMock.mock.calls[0][0]).toMatch(/^events\//);
  });

  it("stores under center/{tenant}/ when prefix=center", async () => {
    const { POST } = await import("./route");
    await POST(makeRequest(makeImageFile(), "center"));
    expect(putMock.mock.calls[0][0]).toMatch(/^center\/muenchen\//);
  });

  it("falls back to events/ for an unknown prefix", async () => {
    const { POST } = await import("./route");
    await POST(makeRequest(makeImageFile(), "../../etc/passwd"));
    expect(putMock.mock.calls[0][0]).toMatch(/^events\//);
  });

  it("returns the blob url on success", async () => {
    const { POST } = await import("./route");
    const res = await POST(makeRequest(makeImageFile()));
    const data = await res.json();
    expect(data.url).toMatch(/^https:\/\/blob\.vercel\.app\//);
  });

  it("returns 400 when no file is attached", async () => {
    const { POST } = await import("./route");
    const form = new FormData();
    const req = new Request("http://localhost/api/admin/images/upload", {
      method: "POST",
      body: form,
    });
    const res = await POST(req);
    expect(res.status).toBe(400);
  });

  it("returns 400 for non-image MIME types", async () => {
    const { POST } = await import("./route");
    const pdf = new File([new Uint8Array([1])], "doc.pdf", { type: "application/pdf" });
    const res = await POST(makeRequest(pdf));
    expect(res.status).toBe(400);
  });
});
