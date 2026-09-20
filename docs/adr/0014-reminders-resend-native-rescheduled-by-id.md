# Event reminders stay Resend-native and are rescheduled by stored id, not moved onto our cron

When a Veranstaltung is verschoben (date/time changed) its registrants' reminder emails must move with it. We keep reminders scheduled **natively in Resend at signup** (as today) and make them addressable: we store the Resend email id of each scheduled reminder on the `anmeldungen` row (`reminder1_email_id`, `reminder2_email_id`), and on reschedule call `resend.emails.update({ id, scheduledAt })` — or `resend.emails.cancel(id)` when the new reminder time is in the past or beyond Resend's 30-day horizon.

## Considered options

- **Move reminders onto the `send-emails` cron** (persist reminder intents, let the cron fan out to current registrants at due time). Rejected: precise reminders ("2 hours before") need a sub-daily cron, and Vercel's free tier (our budget — see CLAUDE.md) allows crons **at most once per day**. The `send-emails` cron isn't even registered in `vercel.json` today. Cron-based reminders are not viable on budget.
- **Resend-native + stored id (chosen).** Precise, free, and small: reminders keep working exactly as now; we just remember their ids so a reschedule can move them.

## Consequences

- Reminder-resync runs server-side in `PUT /api/admin/events/[id]` as part of the reschedule commit itself — always, whenever date or time changed and registrations exist — independent of the manual/automatic notification choice shown to the admin.
- The ids live on `anmeldungen` (strict 1:1 with a registration), not in a separate table.
