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

/**
 * Build a wa.me direct-chat link from a phone number.
 * Prefers whatsapp_number; falls back to contact_phone.
 * Returns null when neither is set.
 */
export function buildWhatsappDirectLink(
  whatsappNumber: string | null | undefined,
  contactPhone: string | null | undefined,
): string | null {
  const raw = whatsappNumber?.trim() || contactPhone?.trim() || '';
  if (!raw) return null;
  const digits = raw.replace(/\D/g, '');
  return `https://wa.me/${digits}`;
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
