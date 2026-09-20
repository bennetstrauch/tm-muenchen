import type { Resend } from 'resend';
import type { Veranstaltung } from './veranstaltungen';
import { getEventReminderTargets, setReminderEmailIds } from './veranstaltungen';
import { calcReminderTime } from './format';

export function scheduleChanged(prev: Veranstaltung, next: Veranstaltung): boolean {
  return prev.date !== next.date || prev.time !== next.time;
}

// Move (or cancel) one registrant's scheduled reminder to the recomputed time.
// Returns the reminder's next stored id: unchanged when moved, null when cancelled
// (past / no reminder). See ADR 0014.
async function resyncSlot(resend: Resend, emailId: string | null, at: string | null): Promise<string | null> {
  if (!emailId) return null;
  if (at) {
    await resend.emails.update({ id: emailId, scheduledAt: at });
    return emailId;
  }
  await resend.emails.cancel(emailId);
  return null;
}

export async function resyncEventReminders(
  event: Veranstaltung,
  tenant: string,
  resend: Resend,
): Promise<void> {
  const targets = await getEventReminderTargets(event.id, tenant);
  const at1 = calcReminderTime(event.date, event.time, event.reminder1Hours);
  const at2 = calcReminderTime(event.date, event.time, event.reminder2Hours);

  for (const target of targets) {
    const id1 = await resyncSlot(resend, target.reminder1EmailId, at1);
    const id2 = await resyncSlot(resend, target.reminder2EmailId, at2);
    if (id1 !== target.reminder1EmailId || id2 !== target.reminder2EmailId) {
      await setReminderEmailIds(target.id, { id1, id2 }, tenant);
    }
  }
}

// The Verschiebung invariant: after an event is updated, its reminders are
// resynced iff the schedule (date or time) changed. Owning the condition here
// keeps it out of the thin route handler and impossible to forget from any
// future update path.
export async function resyncRemindersAfterUpdate(
  previous: Veranstaltung,
  next: Veranstaltung,
  tenant: string,
  resend: Resend,
): Promise<void> {
  if (!scheduleChanged(previous, next)) return;
  await resyncEventReminders(next, tenant, resend);
}
