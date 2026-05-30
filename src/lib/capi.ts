import { createHash } from "crypto";

const PIXEL_ID = process.env.NEXT_PUBLIC_FACEBOOK_PIXEL_ID!;
const ACCESS_TOKEN = process.env.FACEBOOK_CAPI_TOKEN!;

function sha256(value: string): string {
  return createHash("sha256").update(value.trim().toLowerCase()).digest("hex");
}

export type CAPILeadParams = {
  eventId: string;
  eventSourceUrl: string;
  clientIp?: string;
  clientUserAgent?: string;
  email?: string;
  name?: string;
  phone?: string;
};

export async function sendCapiLead(params: CAPILeadParams): Promise<void> {
  const { eventId, eventSourceUrl, clientIp, clientUserAgent, email, name, phone } = params;

  const userData: Record<string, string> = {};

  if (email) userData.em = sha256(email);
  if (name) {
    const parts = name.trim().split(/\s+/);
    userData.fn = sha256(parts[0]);
    if (parts.length > 1) userData.ln = sha256(parts.slice(1).join(" "));
  }
  if (phone) userData.ph = sha256(phone.replace(/\D/g, ""));
  if (clientIp) userData.client_ip_address = clientIp;
  if (clientUserAgent) userData.client_user_agent = clientUserAgent;

  const res = await fetch(`https://graph.facebook.com/v21.0/${PIXEL_ID}/events`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      data: [
        {
          event_name: "Lead",
          event_time: Math.floor(Date.now() / 1000),
          action_source: "website",
          event_source_url: eventSourceUrl,
          event_id: eventId,
          user_data: userData,
        },
      ],
      access_token: ACCESS_TOKEN,
    }),
  });

  if (!res.ok) {
    const err = await res.json();
    throw new Error(`CAPI error: ${JSON.stringify(err)}`);
  }
}
