import type { Veranstaltung } from './veranstaltungen';
import { eventSlug } from './format';
import { formatVeranstaltungDate } from './format';

type Options = {
  greeting?: string;
  description?: string;
  freetext?: string;
  signoff?: string;
};

export function buildWhatsappUrl(text: string): string {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

export function generateWhatsAppText(event: Veranstaltung, options: Options = {}): string {
  const { greeting, description, freetext, signoff = 'Liebe Grüße' } = options;

  const leiter = event.hosts
    .split(',')
    .map(n => n.trim())
    .filter(Boolean)
    .join(', ');

  const location = event.isOnline ? 'Online' : event.location;
  const slug = eventSlug(event);
  const signupUrl = `tm-muenchen.de/events?open=${slug}`;

  const parts: string[] = [];

  if (greeting) parts.push(greeting, '');

  parts.push(`🧘 ${event.title}`);
  if (event.subtitle) parts.push(event.subtitle);
  parts.push('');
  parts.push(`📅 ${formatVeranstaltungDate(event.date)}, ${event.time} Uhr`);
  parts.push(`📍 ${location}`);
  if (event.price) parts.push(event.price);
  parts.push('');
  parts.push(`Jetzt anmelden:\n${signupUrl}`);

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
