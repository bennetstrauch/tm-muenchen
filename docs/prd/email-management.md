# PRD: Admin E-Mail Management

## Problem Statement

Event leaders and admins currently have no way to send reminder or custom emails to Veranstaltung registrants from within the admin dashboard. Automated reminders are configured per event (`reminder1Hours`, `reminder2Hours`) but never actually sent — the fields are stored but no mechanism fires them. One-off emails require running manual Node scripts with hardcoded recipient lists, which leaves no log of what was sent and is inaccessible to non-technical Leiter. When a Leiter receives a new-signup notification (Leiter-Benachrichtigung), they can view registrations via Magic Link but cannot take any email action from there.

## Solution

Add an **E-Mails** tab to the admin dashboard that shows all E-Mail Aktionen (scheduled, sent, failed) across all Veranstaltungen, filterable by event. Admins and Magic-Link Leiter can compose and send custom emails to all registrants of a specific event, and edit the text and timing of automated reminders. An hourly external cron (cron-job.org) fires scheduled and automated emails via Resend. Every sent email is logged in a new "E-Mail Aktionen" Google Sheet tab. A server-rendered preview modal shows the exact email HTML before sending.

## User Stories

1. As an admin, I want to see a list of all E-Mail Aktionen (scheduled, sent, failed) across all events, so that I have a full picture of what has been sent and what is queued.
2. As an admin, I want to filter the E-Mail Aktionen list by event, so that I can focus on a specific Veranstaltung.
3. As an admin, I want to compose a new custom email to all registrants of a specific event, so that I can communicate important updates without running a script.
4. As an admin, I want to choose between sending a custom email immediately or scheduling it for a future date and time, so that I can time communications appropriately.
5. As an admin, I want to preview the exact email HTML before sending, so that I can catch errors in formatting or content.
6. As an admin, I want the preview to show the email personalised with a sample registrant's name, so that I can see how the "Hallo [Name]," salutation renders.
7. As an admin, I want a mandatory preview/confirmation step when clicking "Jetzt senden", so that I cannot accidentally email all registrants.
8. As an admin, I want to edit the body text of the automated Erinnerung 1 or Erinnerung 2 for a specific event, so that I can personalise the standard reminder for a retreat vs a weekly group meditation.
9. As an admin, I want to edit the scheduled send time of a reminder (overriding the event's `reminder1Hours` offset), so that I can send it at 8am rather than the calculated exact hour.
10. As an admin, I want upcoming automated reminders to appear in the E-Mails tab as pending entries derived from event data, so that I can see what will be sent without having to check event fields.
11. As an admin, I want to delete a scheduled custom email before it is sent, so that I can cancel an email I no longer want to send.
12. As an admin, I want to edit a scheduled custom email (subject, body, send time) before it is sent, so that I can correct mistakes without deleting and recreating it.
13. As an admin, I want sent emails to remain visible in the E-Mails tab with a "Gesendet" status and recipient count, so that there is a permanent log.
14. As an admin, I want the E-Mails tab to show both upcoming automated reminders and custom emails in a unified, time-sorted list, so that I don't have to check two separate places.
15. As a Leiter, when I click the Magic Link in my new-signup notification, I want to see both the Anmeldungen tab and an E-Mails tab scoped to my event, so that I can manage communications for my event in one place.
16. As a Leiter, I want to compose and send a custom email to all registrants of my event from the Magic Link view, so that I can communicate directly without needing full admin access.
17. As a Leiter, I want to see the email history for my event in the Magic Link view, so that I know what has already been sent.
18. As a Leiter, I want to be restricted to composing emails only for my own event when using the Magic Link, so that I cannot accidentally email registrants of a different event.
19. As an admin, I want automated reminders to be sent by an hourly cron job, so that they fire within approximately one hour of their configured time.
20. As an admin, I want the cron to log each sent reminder as a row in the E-Mail Aktionen sheet, so that there is a record of automated sends.
21. As an admin, I want the cron to skip a reminder if a log entry already exists for it, so that reminders are never sent twice.
22. As an admin, I want failed email sends to be marked "Fehlgeschlagen" in the E-Mail Aktionen sheet with an error note, so that I know when something went wrong.
23. As an admin, I want the compose form to show me a read-only recipient count ("X Angemeldete für [Event]"), so that I know how many people will receive the email before I send.
24. As an admin, I want the email template to always include the TM München email wrapper (letterhead, gold header, footer), so that every email looks consistent and branded.
25. As an admin, I want the "Hallo [Name]," salutation to be inserted automatically per recipient, so that I don't need to include it in the body text I write.

## Implementation Decisions

### New module: email-actions lib
A dedicated lib module encapsulates all read/write operations for the "E-Mail Aktionen" Google Sheet tab. Interface: list all actions (with optional eventId filter), create, update, delete, mark sent. This is the single source of truth for stored E-Mail Aktionen and is the deepest testable module in this feature.

### EmailAction type
```
id, eventId, eventTitle, type ("custom" | "reminder-1" | "reminder-2"),
subject, body, scheduledAt (ISO datetime), sentAt, status ("pending" | "sent" | "failed" | "cancelled"),
recipientCount, errorMessage, createdBy ("admin" | "leiter")
```
Stored as one row per action in the "E-Mail Aktionen" sheet tab.

### Veranstaltung type extension
Four new optional fields on Veranstaltung: `reminderBody1`, `reminderBody2` (custom body text overrides for reminders), `reminderSubject1`, `reminderSubject2` (custom subject overrides). Stored as new columns in the Veranstaltungen sheet. Empty = use default template text.

### Derived reminder entries
Upcoming automated reminders are not stored as rows in E-Mail Aktionen until they are sent. They appear in the E-Mails tab as virtual entries computed from event fields (date, time, reminder1Hours, reminder2Hours). The cron determines "due" reminders by checking whether `eventDateTime - reminderHours` falls within the past hour window. A reminder is skipped if a sent log entry already exists for that eventId + type combination.

### Admin API routes (new)
- `GET/POST /api/admin/email-actions` — list all or create new EmailAction
- `PUT/DELETE /api/admin/email-actions/[id]` — update or delete
- `POST /api/admin/email-preview` — accepts subject + body + sampleName, returns full rendered HTML using existing emailWrapper
- `POST /api/admin/email-send` — sends immediately to all registrants of eventId via Resend, logs result to sheet. Validates Magic Link token scope if token is present.

### Cron endpoint (new)
`GET /api/cron/send-emails` — secured by CRON_SECRET Bearer header (same pattern as tmw-sync). Called hourly by cron-job.org. Checks: (1) pending EmailActions past their scheduledAt; (2) events with reminder1Hours/reminder2Hours whose calculated fire time falls within the past hour. Sends via Resend, writes log rows, marks actions sent/failed.

### Reminder-due pure function
The logic "is this reminder due?" is extracted as a pure function (`isReminderDue(eventDate, eventTime, hoursOffset, now, windowMinutes)`), isolated from Sheet I/O, for testability.

### Admin UI: E-Mails tab
New top-level tab in admin-client. Displays a merged, time-sorted list of derived reminder entries and stored EmailAction rows. Event filter dropdown (same pattern as Anmeldungen). Row actions: Edit (pencil, inline or modal), Delete (confirm pattern from Veranstaltungen). "Neue E-Mail" button at top right. Status badge per row (Geplant / Gesendet / Fehlgeschlagen).

### Compose/edit form (shared)
Single form component used for creating new custom emails and editing existing ones (custom or reminder override). Fields: Veranstaltung (dropdown, locked when editing), Betreff (text), Nachricht (textarea, no rich text), Sendezeit toggle (Jetzt / Planen + datetime picker), Empfänger (read-only count). "Vorschau" button opens preview modal. Saving a reminder override writes back to the event's reminderBody/Subject fields; saving a custom email writes to E-Mail Aktionen sheet.

### Preview modal
Triggered by "Vorschau" button or automatically on "Jetzt senden". Calls `/api/admin/email-preview` server-side. Renders result in an `<iframe srcdoc="...">`. Shows subject, recipient count, rendered HTML. Buttons: "Senden bestätigen" (fires send) and "Abbrechen".

### Magic Link scope extension
Token-scoped admin view gains the E-Mails tab alongside Anmeldungen. Both tabs remain locked to the token's eventId. Email send API validates that the token's eventId matches the target event. Leiter can compose and send custom emails for their event only.

### Infrastructure
No change to vercel.json or the existing tmw-sync cron. External hourly cron configured at cron-job.org pointing to `/api/cron/send-emails` with `Authorization: Bearer <CRON_SECRET>` header (same secret as existing cron).

## Testing Decisions

Good tests verify external behaviour through the module's public interface, not implementation details (no testing of private functions or internal Sheet row indexing).

**Modules to test:**

- **`isReminderDue` pure function** — unit tests covering: due within window, not yet due, already past window, zero-offset reminders, edge cases at window boundary. No I/O, fast.
- **email-actions lib** — integration tests against real or stubbed Sheet: create, read, update, delete, mark sent, idempotency guard (skip if already sent).
- **`/api/admin/email-preview` route** — unit tests: returns valid HTML containing the provided body text, wraps in emailWrapper, personalises with sampleName.

The cron send logic is covered indirectly via the integration tests for email-actions (mark sent / idempotency) and the `isReminderDue` unit tests. End-to-end UI behaviour is verified manually (preview modal, send confirmation flow).

## Out of Scope

- Rich text / HTML editor for email body — plain textarea only
- Sending to a subset of registrants — always all registrants for the event
- Per-recipient customisation beyond the automatic salutation
- CC / BCC fields
- Unsubscribe / opt-out mechanism
- Email open/click tracking in the admin panel (Resend dashboard covers this)
- Improving the TM München email template design (deferred)
- Scheduling at sub-hourly precision beyond what the external cron provides
- Retry logic for failed sends (admin can manually resend)

## Further Notes

- The existing `reminder1Hours` / `reminder2Hours` fields in the Veranstaltungen sheet are the schedule source for automated reminders. The new `reminderBody1` / `reminderBody2` / `reminderSubject1` / `reminderSubject2` columns are added to the right of the existing columns, so no existing data is affected.
- The "E-Mail Aktionen" sheet tab must be created manually (or on first write) with a header row matching the EmailAction schema.
- Resend free tier (3,000 emails/month) is sufficient for this use case.
- The external cron at cron-job.org requires a one-time manual setup — add the URL and header after the endpoint is deployed.
