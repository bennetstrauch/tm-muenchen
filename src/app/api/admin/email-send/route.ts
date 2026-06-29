import { Resend } from 'resend';
import { getEventRegistrations } from '@/lib/veranstaltungen';
import { createEmailAction, markEmailActionSent, markEmailActionFailed } from '@/lib/email-actions';
import { buildCustomEmailHtml } from '@/lib/email-veranstaltung';
import { verifyToken } from '@/lib/admin-token';
import { getCurrentTenant } from '@/lib/tenant';
import { checkAdminRequest } from '@/lib/admin-api-gate';

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
  if (!await checkAdminRequest(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }
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

    const tenant = await getCurrentTenant();
    const centerName = tenant.center_banner_label ?? `TM Center ${tenant.city}`;
    const allRegistrations = await getEventRegistrations(tenant.tenant);
    const recipients = allRegistrations.filter(r => r.eventId === eventId);

    // If scheduled for the future, persist and return
    if (scheduledAt && new Date(scheduledAt) > new Date()) {
      const action = await createEmailAction(tenant.tenant, {
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
    const action = await createEmailAction(tenant.tenant, {
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

    if (recipients.length === 0) {
      await markEmailActionFailed(tenant.tenant, action.id, 'Keine Anmeldungen für diese Veranstaltung.');
      return Response.json({ sent: 0, warning: 'Keine Anmeldungen.' });
    }

    let sent = 0;
    const errors: string[] = [];

    for (const r of recipients) {
      const result = await resend.emails.send({
        from: tenant.from_email,
        replyTo: tenant.contact_email || undefined,
        to: r.email,
        subject,
        html: buildCustomEmailHtml(r.name || 'liebe/r Teilnehmer/in', body, { centerName, contactPhone: tenant.contact_phone || undefined }),
      });
      if (result.error) {
        errors.push(`${r.email}: ${result.error.message}`);
      } else {
        sent++;
      }
    }

    if (errors.length > 0) {
      const msg = `${errors.length} von ${recipients.length} E-Mails fehlgeschlagen: ${errors.join('; ')}`;
      await markEmailActionFailed(tenant.tenant, action.id, msg);
      return Response.json({ sent, errors }, { status: 500 });
    }

    await markEmailActionSent(tenant.tenant, action.id, sent);
    return Response.json({ sent });
  } catch (err) {
    console.error('email-send failed:', err);
    return Response.json({ error: 'Senden fehlgeschlagen.' }, { status: 500 });
  }
}
