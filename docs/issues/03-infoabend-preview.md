## Parent

Conversion optimisation — landing page overhaul (see docs/prd/conversion-optimisation.md)

## What to build

A new `InfoabendPreview` component — "So läuft der Infoabend ab" — placed directly before the Events (Termine) section. This section removes signup friction by explaining what visitors can expect before they see the registration form.

Content:
- What happens at the Infoabend: was TM ist, wie es funktioniert, wie TM für dich persönlich passen kann und wirkt, Raum für persönliche Fragen
- Three info-boxes: Dauer ~60 Minuten / Online oder vor Ort in München / Kostenlos & unverbindlich

The component is stateless with no props.

## Acceptance criteria

- [ ] InfoabendPreview component exists and renders the section content
- [ ] Section appears directly before the Events section on all pages
- [ ] Three info-boxes (Dauer / Format / Kosten) are visually distinct and scannable
- [ ] Section reads naturally as a lead-in to the signup Termine below it
- [ ] On mobile (390px) the layout is clean and readable
- [ ] Site builds without errors

## Blocked by

None — can start immediately.
