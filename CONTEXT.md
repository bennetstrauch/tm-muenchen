# TM München – Domain Glossary

## Infoabend
A free, non-binding introductory session (~60 min) where people learn what TM is, how it differs from other techniques, and can ask questions. Offered both online and in-person in Munich. This is the **primary conversion goal** of the landing page — getting visitors to sign up for one.

> Canonical term: **Infoabend** (not "Infovortrag", not "Info-Termin", not "Infovortrag")

## Page structure (confirmed)
Rationale: convince early → remove friction + sign up in the middle → deepen for hesitant visitors late → second-chance CTA at end.

1. **Hero** — emotional headline ("Endlich wirklich abschalten. / Ohne Anstrengung."), single primary CTA, next dates with SVG calendar icon. No bottom brand block ("Transzendentale Meditation" + subtitle removed). "regeneriert tiefer als Schlaf" dropped from hero — belongs in WhyTM/Wissenschaft. Hero is purely benefit-led + action.
2. **Trust-Badges** — 3 visible: "✔ Persönlich unterrichtet · ✔ Einfach und mühelos · ✔ Von Millionen weltweit praktiziert". Remaining 3 ("Keine Konzentration nötig", "Ohne Gedanken stoppen", "400+ wissenschaftliche Studien") hidden behind a plain down-arrow (no text). Arrow does NOT flip. Auto-contracts when badge strip scrolls out of viewport. Zeit-Investment (20 min) NOT here. Long science claim ("meistuntersuchte Technik weltweit") belongs as headline in Wissenschaft section, not as badge.
3. **Für wen?** — pain-point tabs with symptom language + bullets (all except Innere Freude rewritten)
4. **Testimonials** — real quotes
5. **Was TM einzigartig macht** — WhyTm section
6. **Trustpilot** — rating widget
7. **CenterBanner** — center info
8. **So läuft der Infoabend ab** *(new)* — directly before Termine; structure: heading → 2 info cards → bullet points. Cards: "Format" (30 Min. · Online) + "Kosten" (Kostenlos & unverbindlich). "vor Ort in München" omitted from card (visible in event listings). Orange subtitle line ("Kostenlos · Unverbindlich · ca. 60 Minuten") removed — redundant with cards. Duration updated from 60 to 30 min.
9. **Nächste Infoabende** — signup section (id="anmeldung")
10. **Wissenschaft & Forschung** *(new)* — static teaser; ChatGPT copy basis; CTA → Infoabend. Future: AI study search (deferred).
11. **Teachers** — personal trust
12. **So funktioniert es** *(moved to late)* — "what happens after the Infoabend"; for hesitant visitors who scroll past signup
13. **Abschluss-CTA** *(new)* — "Finde heraus, ob TM zu dir passt"

## Theme
A themed variant of the landing page targeting a specific audience segment via a distinct hero headline, subtitle, images, and ForWhom default tab. Each theme has its own URL slug.

Theme design principle: **pain-point language for ad targets** (what the visitor suffers), **outcome language for seekers** (what TM gives). `/depression` slug is too clinical — retired.

What a theme changes:
- Hero headline, subtitle, images (images may be reused across themes — visitor scrolls down and won't notice)
- Pre-selected ForWhom tab (matching the theme's pain point)
- Potentially: a theme-specific study highlight in the Wissenschaft section

What a theme does NOT change: page structure, sections, copy outside the hero.

Theme-switching arrows in the hero exist but are rarely used — real visitors scroll down. Themes are primarily for routing different ad audiences to the right entry point.

Target theme set (confirmed):
- `/` → stress — "Endlich wirklich abschalten." (primary ad target)
- `/schlaf` → Schlaf & Regeneration
- `/fokus` → Fokus & Klarheit  
- `/erschoepfung` → Emotionale Erschöpfung (replaces `/depression`)
- `/angst` → Angst & innere Unruhe
- `/innere-freude` → Innere Freude (outcome-oriented; test as ad target)

## Ad targeting
Primary ad audience: **Stress/Überlastung** (broadest funnel, universal pain point) → lands on `/`
Secondary audiences via theme variants (TBD slugs)
"Innere Freude" to be tested as ad target alongside Stress.

## Navigation (hamburger menu)
Hamburger menu stays on the landing page. Rationale: existing meditators who land on `/` need to find `/events`; ad visitors rarely click hamburger menus. The `/events` link stays as the last item. Only change needed: rename "Nächste Infovorträge" → "Nächste Infoabende" in nav copy.

## Conversion hypothesis
Two root causes for low conversion from Instagram ads:
- **Trust gap (A):** Page doesn't convince — visitors doubt and leave
- **Friction gap (B):** Visitors don't know what happens when they sign up; Infoabend format is never explained; CTA unclear

Both apply. B is likely the bigger factor.

## Leiter-Benachrichtigung
Automatic notification email sent to event leader(s) when a new Veranstaltung registration comes in. Triggered in `register-event/route.ts`. Host email resolved via TMW API first-name lookup (hosts field contains first names e.g. "Bennet, Malena"). Non-matched names silently skipped.

Email structure: greeting with leader's first name → registrant details (name, email, phone, TM-Lehrer) → Magic-Link button → sign-off "Dein TM-München-IT-TEAM 😉"

## Magic Link
A time-limited, event-scoped admin access token embedded in the Leiter-Benachrichtigung email. Allows the recipient to view registrations and manage emails for one specific event without logging in.

- Format: HMAC-SHA256 token (payload: eventId + expiry timestamp; secret from env `ADMIN_TOKEN_SECRET`)
- Expiry: 30 days after the event date
- URL: `/admin?tab=anmeldungen&event=<eventId>&token=<token>`
- Scope: single event — Anmeldungen tab (read) + E-Mails tab (read + compose/send), both locked to that event. Other admin tabs still require normal login.
- If token is expired or invalid: show login prompt

## E-Mail Aktion
A stored email sent or scheduled to all registrants of a specific Veranstaltung. Persisted in the "E-Mail Aktionen" Google Sheet tab. Two kinds exist:

- **Benutzerdefiniert** — free-form email composed by an admin or Leiter. Can be sent immediately or scheduled for a future datetime.
- **Erinnerung** — automated reminder derived from the event's `reminder1Hours` / `reminder2Hours` fields. Body text can be overridden per event (`reminderBody1`, `reminderBody2` columns in Veranstaltungen sheet). Scheduled time is calculated from event date/time minus the configured hours offset, but can be manually overridden. Upcoming reminders appear as derived (virtual) entries in the E-Mails tab; a real row is written to E-Mail Aktionen when the reminder is actually sent (sent log).

Canonical term: **E-Mail Aktion** (not "E-Mail", not "Broadcast", not "Kampagne")

## E-Mails Tab (Admin)
Top-level admin tab showing all E-Mail Aktionen across all Veranstaltungen, with an event filter dropdown (same pattern as Anmeldungen tab). Displays upcoming automated Erinnerungen (derived from event fields) alongside stored custom emails and the sent log. Leiter see a scoped version via Magic Link (their event only). Entry point for composing new E-Mail Aktionen.

## E-Mail Compose Form
Shared form used for both creating and editing E-Mail Aktionen (custom and reminder overrides). Fields: Veranstaltung (locked when editing), Betreff, Nachricht (plain text, injected into TM München email template with automatic "Hallo [Name]," salutation per recipient), Sendezeit (Jetzt / Planen with datetime picker), Empfänger (read-only count). Optional preview button + mandatory preview/confirmation modal on "Jetzt senden" (server-rendered iframe showing exact email HTML).

## WhatsApp Community

The center runs a **WhatsApp Community** (not a group) for existing meditators to receive event announcements and updates.

Invite link: `https://chat.whatsapp.com/L8cvH1LG3cu5aavhZkte3D`

### Where it appears on the public site

- **Header (TopBar)**: WhatsApp icon shown **only on `/events`** — not on the landing page or theme pages. Instagram icon shown on all pages.
- **`/events` page**: Standalone CTA block below the event list — "Keine Events verpassen — tritt unserer WhatsApp-Community bei."
- **Registration success state** (after event sign-up): Always show WhatsApp join button with copy like "Ankündigungen auf WhatsApp für neue Events erhalten?" — no opt-in checkbox, just a visible CTA the user can ignore.

WhatsApp tracking: no localStorage flag for "already joined" — CTA always shown, small and non-intrusive.

### Admin: WhatsApp post generation

In the Veranstaltungen tab, each event row has a **"WhatsApp-Post erstellen"** button. Clicking expands an inline panel (no page navigation) with:

- Optional admin greeting (top, above title)
- Pre-filled generated post text (editable)
- Optional freetext addition (below the link)
- Grußformel field (default: "Liebe Grüße", editable)
- Leiter names pulled automatically from event `hosts` field

Generated text format:
```
[Optionale Begrüßung]

🧘 [Titel]
[Untertitel, wenn vorhanden]

📅 [Datum], [Uhrzeit] Uhr
📍 [Online / Ort]
[Preis, wenn vorhanden]

Jetzt anmelden:
tm-muenchen.de/events?open=[slug]

[Freitext-Zusatz, wenn vorhanden]

Liebe Grüße,
[Leiter1], [Leiter2]
```

Two action buttons:
1. **"WhatsApp öffnen"** — opens `wa.me/?text=[encoded]`, marks event as posted automatically on click
2. **"Text als E-Mail senden"** — shows resolved Leiter email addresses (same lookup logic as Leiter-Benachrichtigung), sends via Resend, marks as posted on success

**"Als gepostet markieren"** is automatic (no manual button). Posted status stored in Veranstaltungen Sheet as `whatsappPostedAt` column — reserved for future use (e.g. "Update schicken?" prompt when Zeit/Ort changes on a posted event — deferred).

Note: WhatsApp messages are plaintext — no hidden link text possible. Event URL is always visible; use the clean slug format `tm-muenchen.de/events?open=[slug]`.

## Instagram

Handle: `https://www.instagram.com/muenchentranszendiert`

Instagram icon shown in TopBar on **all pages** (landing page, theme variants, `/events`).

## Meta Pixel
Client-side ad-conversion tracking for Instagram/Facebook campaigns. Pixel ID: `2767733383607726`.

Fires three standard events:
- `PageView` — on every page load after consent
- `ViewContent` — when a visitor opens the Infoabend registration form (Anmelden button clicked)
- `Lead` — when a registration is successfully submitted

**Consent**: Pixel only loads after explicit opt-in via the Cookie-Banner. Consent stored in `localStorage` key `tm_cookie_consent`. Not loaded on admin pages (consistent with Vercel Analytics exclusion).

**Cookie-Banner**: Custom bottom-bar component (no external CMP library). One sentence of copy + "Akzeptieren" / "Ablehnen" buttons. Styled in the site's blue/gold theme. Shown only on first visit; subsequent visits read localStorage directly.
