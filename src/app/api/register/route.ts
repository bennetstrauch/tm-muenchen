import { sendCapiLead } from "@/lib/capi";
import { getCurrentTenant } from "@/lib/tenant";
import { splitName } from "@/lib/name";
import { resolveGeo, isValidPlz } from "@/lib/geo";
import { lookupCityByPlz } from "@/lib/plz-city";
import { bookInfoabend } from "@/lib/tmw-booking";
import { buildSource } from "@/lib/attribution-source";
import { insertInfoAnmeldung } from "@/lib/info-anmeldungen";

type RequestBody = {
  name: string;
  email: string;
  phone?: string;
  lectureId: number;
  eventDate: string;   // "Sa., 11. April 2026" — for Supabase snapshot only
  eventTime: string;   // "19:00"
  eventType: "Online" | "Präsenz";
  locale?: string;
  eventId?: string;
  trackingAllowed?: boolean;
  newsSubscribed?: boolean;
  plz?: string;
  path?: string;
  params?: Record<string, string>;
};

function normalizePhone(phone: string): string {
  const stripped = phone.replace(/[\s().\/\-]/g, "");
  return stripped.startsWith("+") ? "00" + stripped.slice(1) : stripped;
}

export async function POST(request: Request) {
  const body: RequestBody = await request.json();
  const {
    name, email, phone, lectureId,
    eventDate, eventTime, eventType,
    locale = "de", eventId, trackingAllowed = false, newsSubscribed = false,
    plz, path = "/", params = {},
  } = body;

  if (!name?.trim() || !email?.trim()) {
    return Response.json({ error: "Pflichtfelder fehlen." }, { status: 400 });
  }

  const tenant = await getCurrentTenant();

  const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const clientUserAgent = request.headers.get("user-agent") ?? undefined;
  const eventSourceUrl = request.headers.get("referer") ?? "https://tm-muenchen.de";
  const host = request.headers.get("host") ?? "tm-muenchen.de";
  const source = buildSource(host, path, params);
  let { city, zip_code } = resolveGeo(request.headers);

  // PLZ-Abfrage: when the tenant opted in and the visitor typed a PLZ, prefer it
  // over the IP guess (blank still falls back to IP). Gated on the server flag.
  if (tenant.plz_abfrage && plz?.trim()) {
    if (!isValidPlz(plz)) {
      return Response.json({ error: "Bitte gib eine gültige PLZ ein." }, { status: 400 });
    }
    zip_code = plz.trim();
    city = lookupCityByPlz(zip_code) ?? city;
  }

  const normalizedPhone = phone ? normalizePhone(phone) : undefined;

  const { first_name, last_name: rawLastName } = splitName(name);
  const last_name = rawLastName || "'";

  // Write to TMW — primary, fatal
  let tmwId: string | null = null;
  try {
    const result = await bookInfoabend({
      lectureId,
      first_name,
      last_name,
      email,
      phone: normalizedPhone,
      seats: 1,
      source,
      zip_code,
      news_subscribed: newsSubscribed,
    });
    tmwId = String(result.id);
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Buchung fehlgeschlagen.";
    return Response.json({ error: msg }, { status: 500 });
  }

  // Write snapshot to Supabase — non-fatal
  insertInfoAnmeldung({
    tenant: tenant.tenant,
    locale,
    // Truthful record of an actual opt-in. Under track_without_consent the
    // visitor never consented, so this stays false even though we track. See ADR 0011.
    has_consent: tenant.track_without_consent ? false : trackingAllowed,
    meta_pixel_event_id: eventId ?? null,
    tmw_registration_id: tmwId,
    name,
    email,
    phone: normalizedPhone ?? null,
    event_date: eventDate,
    event_time: eventTime,
    event_type: eventType,
    source,
    city: city || null,
    zip_code: zip_code || null,
    news_subscribed: newsSubscribed,
  }).catch(err => console.error("[register] Supabase write failed:", err));

  // Facebook Conversions API — non-fatal.
  // trackingAllowed is client-authoritative by necessity: consent/opt-out lives
  // only in the browser (localStorage), so the server cannot re-derive it. It
  // already encodes the tenant mode via shouldTrack(tenant.track_without_consent).
  // Do not "harden" this into `tenant.track_without_consent && trackingAllowed`
  // — that would suppress PII for genuinely consenting visitors on normal tenants.
  if (eventId && tenant.meta_pixel_id && tenant.meta_pixel_capi_token) {
    sendCapiLead({
      pixelId: tenant.meta_pixel_id,
      capiToken: tenant.meta_pixel_capi_token,
      eventId,
      eventSourceUrl,
      clientIp: trackingAllowed ? clientIp : undefined,
      clientUserAgent,
      email: trackingAllowed ? email : undefined,
      name: trackingAllowed ? name : undefined,
      phone: trackingAllowed ? normalizedPhone : undefined,
    }).catch(err => console.error("CAPI failed:", err));
  }

  return Response.json({ success: true });
}
