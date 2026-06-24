import { Resend } from 'resend';
import { appendEventRegistration, getVeranstaltungById } from '@/lib/veranstaltungen';
import { calcReminderTime } from '@/lib/format';
import { buildEventConfirmationHtml, buildEventReminderHtml, buildLeiterNotificationHtml, type EventEmailParams } from '@/lib/email-veranstaltung';
import { lookupTeachersByFirstNames } from '@/lib/tmw-teachers';
import { generateToken } from '@/lib/admin-token';
import { getCurrentTenant } from '@/lib/tenant';

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

async function notifyLeiter(params: {
  hosts: string;
  eventId: string;
  isoDate: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  registrantName: string;
  registrantEmail: string;
  registrantPhone?: string;
  tmLehrer?: string;
  baseUrl: string;
  fromEmail: string;
  replyTo?: string;
  centerName?: string;
}): Promise<void> {
  const firstNames = params.hosts.split(',').map(s => s.trim()).filter(Boolean);
  const leaders = await lookupTeachersByFirstNames(firstNames);
  if (leaders.length === 0) return;

  const token = await generateToken(params.eventId, params.isoDate);
  const magicLink = `${params.baseUrl}/admin?tab=anmeldungen&event=${encodeURIComponent(params.eventId)}&token=${encodeURIComponent(token)}`;

  await Promise.all(
    leaders.map(leader =>
      resend.emails.send({
        from: params.fromEmail,
        replyTo: params.replyTo,
        to: leader.email,
        subject: `Neue Anmeldung: ${params.eventTitle} – ${params.eventDate}`,
        html: buildLeiterNotificationHtml({
          leiterName: leader.name.split(' ')[0],
          registrantName: params.registrantName,
          registrantEmail: params.registrantEmail,
          registrantPhone: params.registrantPhone,
          tmLehrer: params.tmLehrer,
          eventTitle: params.eventTitle,
          eventDate: params.eventDate,
          eventTime: params.eventTime,
          eventLocation: params.eventLocation,
          magicLink,
          centerName: params.centerName,
        }),
      }),
    ),
  );
}

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

  const tenant = await getCurrentTenant();
  const event = await getVeranstaltungById(eventId, tenant.tenant);
  const requiresTmFields = !event?.auchFuerNichtMeditierende;

  if (requiresTmFields && (!tmLehrer?.trim() || !datumErlernen?.trim())) {
    return Response.json({ error: 'Pflichtfelder fehlen.' }, { status: 400 });
  }

  const centerName = tenant.center_banner_label ?? `TM Center ${tenant.city}`;
  const params: EventEmailParams = {
    name, eventTitle, eventSubtitle,
    eventDate, eventTime, eventLocation,
    isOnline, onlineLink, hosts, price,
    centerName,
    contactPhone: tenant.contact_phone || undefined,
  };

  const reminderTime = eventTime || '19:00';
  const r1 = reminder1Hours > 0 ? calcReminderTime(isoDate, reminderTime, reminder1Hours) : null;
  const r2 = reminder2Hours > 0 ? calcReminderTime(isoDate, reminderTime, reminder2Hours) : null;

  const replyTo = tenant.contact_email || undefined;

  await Promise.all([
    resend.emails.send({
      from: tenant.from_email,
      replyTo: replyTo,
      to: email,
      subject: `Bestätigung: ${eventTitle} – ${eventDate}`,
      html: buildEventConfirmationHtml(params),
    }),

    r1
      ? resend.emails.send({
          from: tenant.from_email,
          replyTo: replyTo,
          to: email,
          subject: event?.reminderSubject1 || `Erinnerung: ${eventTitle} – ${eventDate}`,
          html: buildEventReminderHtml(params, event?.reminderBody1),
          scheduledAt: r1,
        })
      : Promise.resolve(),

    r2
      ? resend.emails.send({
          from: tenant.from_email,
          replyTo: replyTo,
          to: email,
          subject: event?.reminderSubject2 || `Erinnerung: ${eventTitle} – ${eventDate}`,
          html: buildEventReminderHtml(params, event?.reminderBody2),
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
  }, tenant.tenant).catch(err => console.error('Registration logging failed:', err));

  notifyLeiter({
    hosts,
    eventId,
    isoDate,
    eventTitle,
    eventDate,
    eventTime,
    eventLocation,
    registrantName: name,
    registrantEmail: email,
    registrantPhone: phone,
    tmLehrer,
    baseUrl: new URL(request.url).origin,
    fromEmail: tenant.from_email,
    replyTo: tenant.contact_email || undefined,
    centerName,
  }).catch(err => console.error('Leiter notification failed:', err));

  return Response.json({ success: true });
}
