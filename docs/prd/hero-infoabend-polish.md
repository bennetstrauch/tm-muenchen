# PRD: Hero & Infoabend Polish — Clarity and Conversion Focus

## Problem Statement

The landing page hero has accumulated visual clutter that dilutes the conversion-critical headline. A large "Transzendentale Meditation" brand block at the bottom of the hero competes with the primary CTA and repeats what the trust-badge strip below already communicates. A 🗓 emoji next to the next-dates line looks amateurish on mobile, where the primary audience lands. The trust-badge strip renders six badges at once — too many to scan on a 390 px screen — with no way to reveal the rest without permanent clutter. The "So läuft der Infoabend ab" section buries its most scannable facts (format, cost) below a wall of bullet points, and quotes an outdated 60-minute duration.

Cumulatively these issues weaken trust and increase friction for Instagram cold traffic before they ever reach the CTA.

---

## Solution

Four targeted UI changes — all in existing components, no new sections:

1. **Hero cleanup** — remove the bottom brand block ("Transzendentale Meditation" + "regeneriert tiefer als Schlaf"). The headline ("Endlich wirklich abschalten. / Ohne Anstrengung."), primary CTA, and next-dates line are the only content that matters.
2. **Next-dates icon** — replace the 🗓 emoji with a small inline SVG calendar icon matching the site's colour palette.
3. **Trust-badges progressive disclosure** — show only 3 badges by default; hide the remaining 3 behind a plain down-chevron. The chevron does not flip when expanded. The strip auto-collapses when it scrolls out of the viewport. Badge copy updated: "Einfach erlernbar" → "Einfach und mühelos".
4. **Infoabend section restructure** — remove the orange subtitle line (now redundant); move the info cards above the bullet points; collapse to 2 cards ("Format": 30 Min. · Online / "Kosten": Kostenlos & unverbindlich); correct duration from 60 to 30 minutes.

---

## User Stories

1. As a visitor landing from an Instagram ad, I want the hero to show me one clear benefit claim and one CTA, so that I am not distracted by brand text I don't yet care about.
2. As a visitor on mobile, I want the next-dates line to look polished, so that I trust the organisation enough to keep reading.
3. As a visitor scanning the badge strip, I want to see the three most important facts about TM immediately, so that I can form a first impression in under two seconds.
4. As a visitor curious about the full badge list, I want to expand it with one tap, so that I can read all six without the page always looking cluttered.
5. As a visitor who scrolled away from the badge strip, I want it to auto-collapse, so that it looks tidy when I scroll back.
6. As a visitor considering signing up for an Infoabend, I want to see how long it is and whether it costs anything before I read the detailed agenda, so that I can decide whether to keep reading in under three seconds.
7. As a visitor, I want the stated duration to be accurate (30 minutes, not 60), so that I am not misinformed before signing up.

---

## Implementation Decisions

### Hero component
- Remove the bottom `div` containing "Transzendentale Meditation" and the `subtitleText` span entirely. The `subtitle` prop and `subtitleText` variable become dead code and should be removed.
- The `learnMore` ghost button that currently sits inside that block should be evaluated: if it is the only "scroll down" affordance, keep it as a standalone element; otherwise remove it with the block.
- The `staticCls` / `staticAnim` animation wrappers on the removed block are no longer needed.

### Next-dates icon
- Replace the `<span>🗓</span>` with a small inline SVG (16×16, current-color or site navy `#1A3352/55`). A minimal calendar outline — square body, two tick marks at top, horizontal line inside — is sufficient. No external icon library needed.

### Trust-badges component
- Render the first 3 badges unconditionally.
- Render the remaining 3 in a collapsible container, hidden by default (`max-height: 0` / `overflow: hidden` or a CSS `hidden` toggle driven by state).
- A plain down-chevron SVG button (no label text) toggles the expanded state. The chevron does not rotate or flip.
- An `IntersectionObserver` watches the badge strip root element. When it leaves the viewport, the expanded state resets to collapsed.
- Updated badge copy: index 1 changes from "Einfach erlernbar" to "Einfach und mühelos". All other badge strings unchanged.
- Component gains internal `useState` for expanded — it was previously fully stateless.

### Infoabend section
- Remove the `<p>` orange subtitle line ("Kostenlos · Unverbindlich · ca. 60 Minuten") that appears between the heading and the bullet list.
- Move the `infoBoxes` grid to appear immediately after the heading, before the `<ul>` bullet list.
- Reduce `infoBoxes` from 3 entries to 2: `{ label: "Format", value: "30 Min. · Online" }` and `{ label: "Kosten", value: "Kostenlos & unverbindlich" }`. "Vor Ort in München" is omitted — visible in event listings.
- The grid changes from `grid-cols-1 sm:grid-cols-3` to `grid-cols-1 sm:grid-cols-2` (or `grid-cols-2` on all viewports since 2 cards fit comfortably at 390 px).

---

## Testing Decisions

Visual / manual tests are sufficient for all four changes — no logic branches that warrant unit tests.

A good test for each change verifies external behaviour (what the visitor sees and can interact with), not implementation details:

- **Hero**: confirm the "Transzendentale Meditation" text is absent from the DOM; confirm headline and CTA are present.
- **Next-dates**: confirm no emoji character in the next-dates line; confirm an SVG element is present.
- **Trust badges**: confirm only 3 badges are visible on initial render; confirm all 6 are visible after clicking the chevron; confirm the strip collapses after the IntersectionObserver fires with `isIntersecting: false`.
- **Infoabend**: confirm the orange subtitle text is absent; confirm info cards appear before bullet points in DOM order; confirm 2 cards with labels "Format" and "Kosten"; confirm "30 Min." appears in the Format card.

No prior automated tests exist for these components — manual browser testing at 390 px (mobile) and 1280 px (desktop) is the acceptance gate.

---

## Out of Scope

- Changing the hero headline copy (already "Endlich wirklich abschalten. / Ohne Anstrengung.").
- Adding a new "Mehr erfahren" or secondary CTA — existing ghost button unchanged.
- Changing the Infoabend bullet-point content.
- Adding "Vor Ort" as an option in the Format card.
- Any changes to the Events / Termine section below Infoabend.
- Theme-specific hero variants (separate issue #8).

---

## Further Notes

- Issues #3 (Trust Badges) and #4 (So läuft der Infoabend ab) exist but were written against earlier specs. The child issues produced from this PRD supersede the acceptance criteria in those issues. #3 and #4 should be closed in favour of the new issues.
- Duration correction (60 → 30 min) must be applied consistently: the Infoabend section card, and anywhere "60 Minuten" or "60 min" appears in copy across the page.
