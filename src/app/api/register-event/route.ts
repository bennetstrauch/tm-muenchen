import { Resend } from 'resend';
import { appendEventRegistration, getVeranstaltungById } from '@/lib/veranstaltungen';
import { calcReminderTime } from '@/lib/format';
import { buildEventConfirmationHtml, buildEventReminderHtml, type EventEmailParams } from '@/lib/email-veranstaltung';

const resend = new Resend(process.env.RESEND_API_KEY);

type RequestBody = {
  name: string;
  email: string;
  phone?: string;
  tmLehrer: string;
  datumErlernen: string;
  eventId: string;
  eventTitle: string;
  eventSubtitle: string;
  isoDate: string;        // "2026-05-19"
  eventDate: string;      // "Dienstag, 19. Mai 2026"
  eventTime: string;      // "17:00"
  eventLocation: string;
  isOnline: boolean;
  onlineLink?: string;
  hosts: string;
  price?: string;
  reminder1Hours: number;
  reminder2Hours: number;
};

export async function POST(request: Request) {
  const body: RequestBody = await request.json();
  const {
    name, email, phone, tmLehrer, datumErlernen,
    eventId, eventTitle, eventSubtitle,
    isoDate, eventDate, eventTime, eventLocation,
    isOnline, onlineLink, hosts, price,
    reminder1Hours, reminder2Hours,
  } = body;

  if (!name?.trim() || !email?.trim()) {
    return Response.json({ error: 'Pflichtfelder fehlen.' }, { status: 400 });
  }

  const event = await getVeranstaltungById(eventId);
  const requiresTmFields = !event?.auchFuerNichtMeditierende;

  if (requiresTmFields && (!tmLehrer?.trim() || !datumErlernen?.trim())) {
    return Response.json({ error: 'Pflichtfelder fehlen.' }, { status: 400 });
  }

  const params: EventEmailParams = {
    name, eventTitle, eventSubtitle,
    eventDate, eventTime, eventLocation,
    isOnline, onlineLink, hosts, price,
  };

  const reminderTime = eventTime || '19:00';
  const r1 = reminder1Hours > 0 ? calcReminderTime(isoDate, reminderTime, reminder1Hours) : null;
  const r2 = reminder2Hours > 0 ? calcReminderTime(isoDate, reminderTime, reminder2Hours) : null;

  await Promise.all([
    resend.emails.send({
      from: 'TM München <noreply@tm-muenchen.de>',
      to: email,
      subject: `Bestätigung: ${eventTitle} – ${eventDate}`,
      html: buildEventConfirmationHtml(params),
    }),

    r1
      ? resend.emails.send({
          from: 'TM München <noreply@tm-muenchen.de>',
          to: email,
          subject: `Erinnerung: ${eventTitle} – ${eventDate}`,
          html: buildEventReminderHtml(params),
          scheduledAt: r1,
        })
      : Promise.resolve(),

    r2
      ? resend.emails.send({
          from: 'TM München <noreply@tm-muenchen.de>',
          to: email,
          subject: `Erinnerung: ${eventTitle} – ${eventDate}`,
          html: buildEventReminderHtml(params),
          scheduledAt: r2,
        })
      : Promise.resolve(),
  ]);

  appendEventRegistration({
    eventId,
    eventTitle,
    eventDate: isoDate,
    name,
    email,
    phone: phone ?? '',
    tmLehrer,
    datumErlernen,
  }).catch(err => console.error('Sheets logging failed:', err));

  return Response.json({ success: true });
}
