import { describe, it, expect, beforeEach, vi } from "vitest";

const tenant = {
  tenant: "muenchen",
  meta_pixel_id: "PIX123",
  meta_pixel_capi_token: "TOK123",
  plz_abfrage: false,
  track_without_consent: false,
};

vi.mock("@/lib/tenant", () => ({
  getCurrentTenant: vi.fn(async () => tenant),
}));
vi.mock("@/lib/tmw-booking", () => ({
  bookInfoabend: vi.fn(async () => ({ id: 999 })),
}));
vi.mock("@/lib/info-anmeldungen", () => ({
  insertInfoAnmeldung: vi.fn(async () => {}),
}));
vi.mock("@/lib/capi", () => ({
  sendCapiLead: vi.fn(async () => {}),
}));
vi.mock("@/lib/geo", () => ({
  resolveGeo: () => ({ city: "München", zip_code: "80331" }),
  isValidPlz: (v: string) => /^\d{4,5}$/.test(v),
}));

import { sendCapiLead } from "@/lib/capi";
import { insertInfoAnmeldung } from "@/lib/info-anmeldungen";

function makeRequest(body: Record<string, unknown>): Request {
  return new Request("http://localhost/api/register", {
    method: "POST",
    headers: { "content-type": "application/json", host: "tm-muenchen.de" },
    body: JSON.stringify(body),
  });
}

const validBody = {
  name: "Max Mustermann",
  email: "max@example.com",
  phone: "0170 1234567",
  lectureId: 1,
  eventDate: "Sa., 11. April 2026",
  eventTime: "19:00",
  eventType: "Online",
  eventId: "evt-1",
};

beforeEach(() => {
  vi.mocked(sendCapiLead).mockClear();
  vi.mocked(insertInfoAnmeldung).mockClear();
  tenant.track_without_consent = false;
});

describe("POST /api/register — consent vs. tracking", () => {
  it("consent-first tenant: opted-in visitor gets full CAPI PII and has_consent=true", async () => {
    const { POST } = await import("./route");
    await POST(makeRequest({ ...validBody, trackingAllowed: true }));

    expect(insertInfoAnmeldung).toHaveBeenCalledWith(
      expect.objectContaining({ has_consent: true }),
    );
    expect(sendCapiLead).toHaveBeenCalledWith(
      expect.objectContaining({ email: "max@example.com", name: "Max Mustermann" }),
    );
  });

  it("consent-first tenant: non-consenting visitor sends no PII and has_consent=false", async () => {
    const { POST } = await import("./route");
    await POST(makeRequest({ ...validBody, trackingAllowed: false }));

    expect(insertInfoAnmeldung).toHaveBeenCalledWith(
      expect.objectContaining({ has_consent: false }),
    );
    expect(sendCapiLead).toHaveBeenCalledWith(
      expect.objectContaining({ email: undefined, name: undefined, phone: undefined }),
    );
  });

  it("track-without-consent tenant: tracked visitor gets full CAPI PII but has_consent stays false", async () => {
    tenant.track_without_consent = true;
    const { POST } = await import("./route");
    await POST(makeRequest({ ...validBody, trackingAllowed: true }));

    // has_consent must remain truthful — the visitor never opted in.
    expect(insertInfoAnmeldung).toHaveBeenCalledWith(
      expect.objectContaining({ has_consent: false }),
    );
    expect(sendCapiLead).toHaveBeenCalledWith(
      expect.objectContaining({ email: "max@example.com" }),
    );
  });

  it("track-without-consent tenant: opted-out visitor sends no PII (Widerspruch honoured)", async () => {
    tenant.track_without_consent = true;
    const { POST } = await import("./route");
    await POST(makeRequest({ ...validBody, trackingAllowed: false }));

    expect(insertInfoAnmeldung).toHaveBeenCalledWith(
      expect.objectContaining({ has_consent: false }),
    );
    expect(sendCapiLead).toHaveBeenCalledWith(
      expect.objectContaining({ email: undefined, phone: undefined }),
    );
  });
});
