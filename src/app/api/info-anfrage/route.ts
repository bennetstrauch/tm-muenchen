import { Resend } from 'resend';
import { getCurrentTenant } from '@/lib/tenant';
import { splitName } from '@/lib/name';
import { cityToPlz } from '@/lib/geo';
import { requestInfoTermin } from '@/lib/tmw-infobooking';
import { buildSource } from '@/lib/attribution-source';
import { insertInfoAnfrage } from '@/lib/info-anfragen';
import {
  buildInfoAnfrageUserSubject,
  buildInfoAnfrageUserHtml,
  buildInfoAnfrageCenterSubject,
  buildInfoAnfrageCenterHtml,
} from '@/lib/email-info-anfrage';

const resend = new Resend(process.env.RESEND_API_KEY);

type RequestBody = {
  name: string;
  email: string;
  phone?: string;
  message?: string;
  locale?: string;
  newsSubscribed?: boolean;
  hasConsent?: boolean;
  eventId?: string;
  path?: string;
  params?: Record<string, string>;
};

export async function POST(request: Request) {
  const body: RequestBody = await request.json();
  const {
    name, email, phone, message,
    locale = 'de', newsSubscribed = false,
    path = '/', params = {},
  } = body;

  if (!name?.trim() || !email?.trim()) {
    return Response.json({ error: 'Pflichtfelder fehlen.' }, { status: 400 });
  }

  const host = request.headers.get('host') ?? 'tm-muenchen.de';
  const source = buildSource(host, path, params);
  const rawCity = request.headers.get('x-vercel-ip-city') ?? '';
  const city = decodeURIComponent(rawCity);
  const zip_code = cityToPlz(rawCity);

  const { first_name, last_name: rawLastName } = splitName(name);
  const last_name = rawLastName || "'";
  const tenant = await getCurrentTenant();

  // Call TMW for DE locale — fatal if it fails
  let tmwId: string | null = null;
  if (locale === 'de') {
    try {
      const id = await requestInfoTermin({
        first_name,
        last_name,
        email,
        center: tenant.tmw_center_ids[0],
        phone_number: phone,
        message,
        news_subscribed: newsSubscribed,
        source,
        zip_code,
      });
      tmwId = String(id);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Buchung fehlgeschlagen.';
      return Response.json({ error: msg }, { status: 500 });
    }
  }

  // Write to Supabase — non-fatal
  insertInfoAnfrage({
    tenant: tenant.tenant,
    locale,
    name,
    email,
    phone: phone ?? null,
    message: message ?? null,
    source,
    tmw_registration_id: tmwId,
    news_subscribed: newsSubscribed,
    city: city || null,
  }).catch(err => console.error('[info-anfrage] Supabase write failed:', err));

  // Send center notification (always, in German)
  resend.emails.send({
    from: tenant.from_email,
    to: tenant.contact_email,
    subject: buildInfoAnfrageCenterSubject(name),
    html: buildInfoAnfrageCenterHtml({ name, email, phone, message }),
  }).catch(err => console.error('[info-anfrage] center email failed:', err));

  // Send user confirmation — skip DE because TMW already sends their own email
  if (locale !== 'de') resend.emails.send({
    from: tenant.from_email,
    replyTo: tenant.contact_email || undefined,
    to: email,
    subject: buildInfoAnfrageUserSubject(locale),
    html: buildInfoAnfrageUserHtml({ name, locale, cityName: tenant.city }),
  }).catch(err => console.error('[info-anfrage] user email failed:', err));

  return Response.json({ success: true });
}
