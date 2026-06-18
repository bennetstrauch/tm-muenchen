# ADR 0007 — Own Testimonials Replace Trustpilot Widget

## Status
Accepted

## Context

The "Was andere sagen" section displayed Trustpilot cards and a custom rating badge. Three legal problems made this untenable:

1. **Wrong entity** — reviews sourced from `tm.org` (worldwide), not TM München. Implies local Munich reviews.
2. **Translated content** — reviews auto-translated via next-intl. Trustpilot ToS prohibits modification of reviewer content; reviewers did not consent to translation.
3. **Custom badge replica** — hand-built copy of the Trustpilot TrustBox widget (stars, green colour, "Exzellent" label). Trustpilot requires use of the official widget only.

The national TM director (Dr. Eckart Stein) suggested using testimonials from nationally known figures already published on `meditation.de`, granting permission to reuse quotes, photos, and translations.

## Decision

Replace the entire Trustpilot section with **6 own testimonials** from nationally known TM practitioners (doctors, musicians, public figures), sourced from `meditation.de` with explicit organisational approval.

- Quotes translated into all 4 locales (DE/EN/FR/ES) via the existing auto-translate pipeline — permissible because TM München owns the usage rights granted by the national organisation.
- Photos self-hosted in `/public/testimonials/` — not hotlinked from `meditation.de`.
- No Trustpilot branding anywhere in the section.
- The custom `lib/trustpilot.ts` scraper is deleted.

The official Trustpilot TrustBox widget (for a future TM München profile) remains a deferred option if an official embed code becomes available.

## Consequences

- No live review count or star rating displayed. Credibility comes from named, photographed individuals instead of aggregate scores.
- Adding a new testimonial requires a code change + deploy (acceptable — these are curated national figures, not frequently updated).
- The archived layout is documented in `docs/archived-trustpilot-section.md`.
