import { Resend } from 'resend';
import { getEmailActions, markEmailActionSent, markEmailActionFailed } from '@/lib/email-actions';
import { isReminderDue } from '@/lib/email-actions';
import { getAllVeranstaltungen, getEventRegistrations } from '@/lib/veranstaltungen';
import { buildCustomEmailHtml, buildEventReminderHtml } from '@/lib/email-veranstaltung';
import { createEmailAction } from '@/lib/email-actions';
import { formatVeranstaltungDate } from '@/lib/format';
import type { EmailActionType } from '@/lib/email-actions';
import { getCurrentTenant } from '@/lib/tenant';

export const dynamic = 'force-dynamic';

const resend = new Resend(process.env.RESEND_API_KEY);

async function sendBulk(
  recipients: { name: string; email: string }[],
  subject: string,
  buildHtml: (name: string) => string,
  from: string,
): Promise<{ sent: number; errors: string[] }> {
  let sent = 0;
  const errors: string[] = [];
  for (const r of recipients) {
    const result = await resend.emails.send({
      from,
      to: r.email,
      subject,
      html: buildHtml(r.name || 'liebe/r Teilnehmer/in'),
    });
    if (result.error) {
      errors.push(`${r.email}: ${result.error.message}`);
    } else {
      sent++;
    }
  }
  return { sent, errors };
}

export async function GET(request: Request) {
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const now = new Date();
  const results: string[] = [];

  try {
    // ── 1. Pending custom bulk emails past their scheduledAt ─────────────────
    const tenant = await getCurrentTenant();
    const [allActions, allRegistrations, allEvents] = await Promise.all([
      getEmailActions(),
      getEventRegistrations(tenant.tenant),
      getAllVeranstaltungen(tenant.tenant),
    ]);

    const pendingCustom = allActions.filter(
      a => a.status === 'pending' && a.type === 'custom' && a.scheduledAt && new Date(a.scheduledAt) <= now,
    );

    for (const action of pendingCustom) {
      const recipients = allRegistrations.filter(r => r.eventId === action.eventId);
      if (recipients.length === 0) {
        await markEmailActionFailed(action.id, 'Keine Anmeldungen.');
        results.push(`custom ${action.id}: no recipients`);
        continue;
      }
      const { sent, errors } = await sendBulk(
        recipients,
        action.subject,
        name => buildCustomEmailHtml(name, action.body),
        tenant.from_email,
      );
      if (sent > 0) {
        await markEmailActionSent(action.id, sent);
        results.push(`custom ${action.id}: sent ${sent}`);
      } else {
        await markEmailActionFailed(action.id, errors.join('; '));
        results.push(`custom ${action.id}: failed`);
      }
    }

    // ── 2. Automated reminder checks (per-event bulk reminder) ───────────────
    // Only for events that haven't passed yet
    const today = now.toISOString().slice(0, 10);
    const upcomingEvents = allEvents.filter(e => e.date >= today);

    const sentLogByEventType = new Set(
      allActions
        .filter(a => a.status === 'sent' && (a.type === 'reminder-1' || a.type === 'reminder-2'))
        .map(a => `${a.eventId}:${a.type}`),
    );

    for (const event of upcomingEvents) {
      const reminderSlots: Array<{ hours: number; type: EmailActionType; subject?: string; body?: string }> = [
        { hours: event.reminder1Hours, type: 'reminder-1', subject: event.reminderSubject1, body: event.reminderBody1 },
        { hours: event.reminder2Hours, type: 'reminder-2', subject: event.reminderSubject2, body: event.reminderBody2 },
      ];

      for (const slot of reminderSlots) {
        if (!isReminderDue(event.date, event.time, slot.hours, now)) continue;
        if (sentLogByEventType.has(`${event.id}:${slot.type}`)) continue;

        const recipients = allRegistrations.filter(r => r.eventId === event.id);
        if (recipients.length === 0) continue;

        const eventDate = formatVeranstaltungDate(event.date);
        const subject = slot.subject || `Erinnerung: ${event.title} – ${eventDate}`;

        const { sent, errors } = await sendBulk(
          recipients,
          subject,
          name => buildEventReminderHtml(
            {
              name,
              eventTitle: event.title,
              eventSubtitle: event.subtitle,
              eventDate,
              eventTime: event.time,
              eventLocation: event.location,
              isOnline: event.isOnline,
              onlineLink: event.onlineLink || undefined,
              hosts: event.hosts,
              price: event.price || undefined,
            },
            slot.body,
          ),
          tenant.from_email,
        );

        const action = await createEmailAction({
          eventId: event.id,
          eventTitle: event.title,
          type: slot.type,
          subject,
          body: slot.body ?? '',
          scheduledAt: '',
          sentAt: sent > 0 ? new Date().toISOString() : '',
          status: sent > 0 ? 'sent' : 'failed',
          recipientCount: sent,
          errorMessage: errors.join('; '),
          createdBy: 'admin',
        });

        results.push(`${slot.type} for ${event.id}: sent ${sent}, logged as ${action.id}`);
      }
    }

    console.log('[send-emails cron]', results);
    return Response.json({ ok: true, results });
  } catch (err) {
    console.error('[send-emails cron] failed:', err);
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
