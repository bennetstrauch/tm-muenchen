import { Resend } from 'resend';
import { getEventRegistrations } from '@/lib/veranstaltungen';
import { createEmailAction, markEmailActionSent, markEmailActionFailed } from '@/lib/email-actions';
import { buildCustomEmailHtml } from '@/lib/email-veranstaltung';
import { verifyToken } from '@/lib/admin-token';

const resend = new Resend(process.env.RESEND_API_KEY);

type SendRequest = {
  eventId: string;
  eventTitle: string;
  subject: string;
  body: string;
  scheduledAt?: string;   // ISO datetime — if set and in the future, schedule instead of send
  createdBy?: 'admin' | 'leiter';
};

export async function POST(request: Request) {
  try {
    const data: SendRequest = await request.json();
    const { eventId, eventTitle, subject, body, scheduledAt, createdBy = 'admin' } = data;

    if (!eventId || !subject?.trim() || !body?.trim()) {
      return Response.json({ error: 'Pflichtfelder fehlen.' }, { status: 400 });
    }

    // Validate Magic Link token scope if a token header is present
    const tokenHeader = request.headers.get('x-admin-token');
    const tokenEventHeader = request.headers.get('x-admin-token-event');
    if (tokenHeader && tokenEventHeader) {
      const result = await verifyToken(tokenHeader, tokenEventHeader);
      if (!result.valid || tokenEventHeader !== eventId) {
        return Response.json({ error: 'Nicht autorisiert.' }, { status: 403 });
      }
    }

    // If scheduled for the future, persist and return
    if (scheduledAt && new Date(scheduledAt) > new Date()) {
      const action = await createEmailAction({
        eventId,
        eventTitle,
        type: 'custom',
        subject,
        body,
        scheduledAt,
        sentAt: '',
        status: 'pending',
        recipientCount: 0,
        errorMessage: '',
        createdBy,
      });
      return Response.json({ scheduled: true, id: action.id });
    }

    // Send now — log first so we have the id for error tracking
    const action = await createEmailAction({
      eventId,
      eventTitle,
      type: 'custom',
      subject,
      body,
      scheduledAt: '',
      sentAt: '',
      status: 'pending',
      recipientCount: 0,
      errorMessage: '',
      createdBy,
    });

    const allRegistrations = await getEventRegistrations();
    const recipients = allRegistrations.filter(r => r.eventId === eventId);

    if (recipients.length === 0) {
      await markEmailActionFailed(action.id, 'Keine Anmeldungen für diese Veranstaltung.');
      return Response.json({ sent: 0, warning: 'Keine Anmeldungen.' });
    }

    let sent = 0;
    const errors: string[] = [];

    for (const r of recipients) {
      const result = await resend.emails.send({
        from: 'TM München <noreply@tm-muenchen.de>',
        to: r.email,
        subject,
        html: buildCustomEmailHtml(r.name || 'liebe/r Teilnehmer/in', body),
      });
      if (result.error) {
        errors.push(`${r.email}: ${result.error.message}`);
      } else {
        sent++;
      }
    }

    if (sent === 0) {
      await markEmailActionFailed(action.id, errors.join('; '));
      return Response.json({ sent: 0, errors }, { status: 500 });
    }

    await markEmailActionSent(action.id, sent);
    return Response.json({ sent, errors: errors.length ? errors : undefined });
  } catch (err) {
    console.error('email-send failed:', err);
    return Response.json({ error: 'Senden fehlgeschlagen.' }, { status: 500 });
  }
}
