# Archived: Trustpilot Section Layout

Removed in the "Was andere sagen" redesign (2026-06-18). Saved here because the layout is polished and worth referencing.

## What it was

Section heading: **"Was andere sagen"** on a light blue (`#EFF6FF`) background.

### Rating badge (top, centred)
- Pill: "Exzellent | Trustpilot"
- Large green rating number (e.g. `4,8`) in Trustpilot green (`#009962`)
- 5 partial stars (SVG, with linear-gradient for the fractional star)
- "8.072 verifizierte Bewertungen" in green below the stars
- Stats fetched server-side from Trustpilot JSON-LD (`lib/trustpilot.ts`), revalidated every 24h

### Review cards
8 cards in a carousel. Mobile: 1 per slide. Desktop: 2 per slide (grid-cols-2).

Each card (`bg-white rounded-2xl px-7 py-6`):
- Top row: 5 filled green stars (left) + "Verifiziert ✓" badge with Trustpilot link (right)
- Bold blue title (linked to Trustpilot review URL)
- Quote text with `line-clamp-6` + ResizeObserver-driven "Mehr lesen / Weniger" toggle
- Name + external link arrow at bottom

### Why it was removed
See issue #67 and ADR 0007:
- Reviews were from `tm.org` (wrong entity — not TM München)
- Quotes translated via next-intl (violates Trustpilot ToS + reviewer consent)
- Custom-built badge replica (violates Trustpilot brand guidelines)

## Source files (deleted)
- `src/components/trustpilot.tsx` — full component
- `src/lib/trustpilot.ts` — server-side rating scraper
- `src/content.ts` — `trustpilotReviews[]` array (name + URL per review)
- `messages/de.json` → `Trustpilot.*` keys (heading, ratingLabel, verified, review0Title…review7Title, review0Quote…review7Quote, readMore, collapse, starsLabel, verifiedCount)
