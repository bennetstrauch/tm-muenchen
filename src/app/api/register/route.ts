import { sendCapiLead } from "@/lib/capi";
import { getCurrentTenant } from "@/lib/tenant";
import { splitName } from "@/lib/name";
import { cityToPlz } from "@/lib/geo";
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
  hasConsent?: boolean;
  newsSubscribed?: boolean;
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
    locale = "de", eventId, hasConsent, newsSubscribed = false,
    path = "/", params = {},
  } = body;

  if (!name?.trim() || !email?.trim()) {
    return Response.json({ error: "Pflichtfelder fehlen." }, { status: 400 });
  }

  const clientIp = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim();
  const clientUserAgent = request.headers.get("user-agent") ?? undefined;
  const eventSourceUrl = request.headers.get("referer") ?? "https://tm-muenchen.de";
  const host = request.headers.get("host") ?? "tm-muenchen.de";
  const source = buildSource(host, path, params);
  const rawCity = request.headers.get("x-vercel-ip-city") ?? "";
  const city = decodeURIComponent(rawCity);
  const zip_code = cityToPlz(rawCity);
  const normalizedPhone = phone ? normalizePhone(phone) : undefined;

  const { first_name, last_name: rawLastName } = splitName(name);
  const last_name = rawLastName || "'";
  const tenant = await getCurrentTenant();

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
    has_consent: hasConsent ?? false,
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
    news_subscribed: newsSubscribed,
  }).catch(err => console.error("[register] Supabase write failed:", err));

  // Facebook Conversions API — non-fatal
  if (eventId && tenant.meta_pixel_id && tenant.meta_pixel_capi_token) {
    sendCapiLead({
      pixelId: tenant.meta_pixel_id,
      capiToken: tenant.meta_pixel_capi_token,
      eventId,
      eventSourceUrl,
      clientIp: hasConsent ? clientIp : undefined,
      clientUserAgent,
      email: hasConsent ? email : undefined,
      name: hasConsent ? name : undefined,
      phone: hasConsent ? normalizedPhone : undefined,
    }).catch(err => console.error("CAPI failed:", err));
  }

  return Response.json({ success: true });
}
