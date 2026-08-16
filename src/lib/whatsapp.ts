import type { Veranstaltung } from './veranstaltungen';
import { eventSlug } from './format';
import { formatVeranstaltungDate } from './format';

type Options = {
  greeting?: string;
  description?: string;
  freetext?: string;
  signoff?: string;
  showSignupLink?: boolean;
};

// German country code. If this product ever onboards a non-German center, this
// must become per-tenant config: the leading-0 → country-code replacement below
// assumes German national format.
// See CONTEXT.md → WhatsApp Community → Direktnachricht-Link (wa.me).
const DEFAULT_COUNTRY_CODE = '49';

/**
 * Resolve the wa.me international digits for a tenant.
 * Prefers whatsapp_number, falls back to contact_phone, returns null when neither is set.
 * Normalizes the common German forms: +49…, 0049…, 0163… (national),
 * 49… (already country-coded), and the +49 (0)… parenthetical notation.
 */
export function resolveWhatsappDigits(
  whatsappNumber: string | null | undefined,
  contactPhone: string | null | undefined,
): string | null {
  const raw = whatsappNumber?.trim() || contactPhone?.trim() || '';
  if (!raw) return null;
  let digits = raw.replace(/\D/g, '');
  if (digits.startsWith('00')) digits = digits.slice(2);
  else if (digits.startsWith('0')) digits = DEFAULT_COUNTRY_CODE + digits.slice(1);
  // Drop a leading 0 that survived the (0) notation after the country code.
  if (digits.startsWith(DEFAULT_COUNTRY_CODE + '0')) {
    digits = DEFAULT_COUNTRY_CODE + digits.slice(DEFAULT_COUNTRY_CODE.length + 1);
  }
  return digits;
}

/**
 * Build a wa.me direct-chat link from a phone number.
 * Prefers whatsapp_number; falls back to contact_phone.
 * Returns null when neither is set.
 */
export function buildWhatsappDirectLink(
  whatsappNumber: string | null | undefined,
  contactPhone: string | null | undefined,
): string | null {
  const digits = resolveWhatsappDigits(whatsappNumber, contactPhone);
  return digits ? `https://wa.me/${digits}` : null;
}

export function buildWhatsappUrl(text: string): string {
  // web.whatsapp.com/send stays in the browser, which handles Unicode encoding correctly.
  // wa.me on Windows routes through Shell → WhatsApp Desktop and mangles emoji to "?".
  return `https://web.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}

export function generateWhatsAppText(event: Veranstaltung, options: Options = {}, hostname: string): string {
  const { greeting, description, freetext, signoff = 'Liebe Grüße', showSignupLink = true } = options;

  const leiter = event.hosts
    .split(',')
    .map(n => n.trim())
    .filter(Boolean)
    .join(', ');

  const location = event.isOnline ? 'Online' : event.location;
  const slug = eventSlug(event);
  const signupUrl = `${hostname}/events?open=${slug}`;

  const parts: string[] = [];

  if (greeting) parts.push(greeting, '');

  parts.push(`🧘 ${event.title}`);
  if (event.subtitle) parts.push(event.subtitle);
  parts.push('');
  parts.push(`📅 ${formatVeranstaltungDate(event.date)}, ${event.time} Uhr`);
  parts.push(`📍 ${location}`);
  if (event.price) parts.push(event.price);
  if (showSignupLink) {
    parts.push('');
    parts.push(`*Jetzt anmelden:*\n${signupUrl}`);
  }

  if (description) {
    parts.push('');
    parts.push(description);
  }

  if (freetext) {
    parts.push('');
    parts.push(freetext);
  }

  parts.push('');
  parts.push(`${signoff},\n${leiter}`);

  return parts.join('\n');
}
