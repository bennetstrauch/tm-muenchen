## What to build

When a new Veranstaltung registration comes in, automatically send a notification email to each event leader. Leaders are resolved by matching first names from the `hosts` field against the TMW teacher list (center 108). Unmatched names are silently skipped. Each email contains the registrant's details and a Magic Link button that opens the admin panel filtered to that event.

## Acceptance criteria

- [ ] New `lib/tmw-teachers` module: `lookupTeachersByFirstNames(names[])` fetches TMW API and matches by first name (case-insensitive)
- [ ] New `buildLeiterNotificationHtml` email template with: greeting "Hallo liebe/r [Vorname]," → event info (title, date, time, location) → registrant details (name, email, phone, TM-Lehrer) → "Alle Anmeldungen ansehen →" button (Magic Link) → sign-off "Hochachtungsvoll, Dein TM-München-IT-TEAM 😉"
- [ ] `register-event/route.ts` sends notification to all matched leaders after successful registration (non-fatal — failure does not break the registration response)
- [ ] If `hosts` is "Bennet, Malena", both leaders receive a separate email addressed to their first name
- [ ] If a name has no TMW match, that leader is silently skipped — other leaders still receive their email
- [ ] Magic Link in email uses `generateToken` from `lib/admin-token` with the event's id and date
- [ ] Site builds without TypeScript errors

## Blocked by

Issue 09 (Magic Link admin panel) — the admin side must exist before the links in emails are functional. The email itself can be built independently, but should only be shipped once issue 09 is live.
