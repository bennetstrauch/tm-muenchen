# PRD: Conversion Optimisation — Landing Page Overhaul

## Problem Statement

Visitors from Instagram ads land on tm-muenchen.de but do not sign up for an Infoabend. Two root causes were identified:

**A — Trust gap:** The page does not build conviction quickly enough. Visitors don't see enough evidence that TM is credible, simple, and personally taught before they're asked to act.

**B — Friction gap:** The page never explains what an Infoabend actually involves. When a visitor sees "Platz sichern", they don't know what they're signing up for — how long it is, what happens there, whether it's binding. This kills conversion even for visitors who are already interested.

Additionally, the page uses inconsistent terminology ("Infovortrag" vs "Infoabend"), has a suboptimal section order that buries the signup action, and lacks enough themed variants to run targeted ad campaigns beyond the Stress audience.

---

## Solution

A focused conversion overhaul consisting of:

1. **Terminology unification** — "Infoabend" everywhere, consistently
2. **New trust-building strip** — six quick-scan badges directly under the Hero
3. **New friction-removal section** — "So läuft der Infoabend ab" placed directly before the signup Termine section
4. **New science credibility section** — "Wissenschaft & Forschung" static teaser after Events
5. **New closing CTA section** — final conversion opportunity at the bottom of the page
6. **Page reorder** — section flow restructured around a "convince → act → deepen → second chance" funnel
7. **ForWhom tab rewrite** — symptom-first language with bullet-point pain lists (all tabs except Innere Freude)
8. **Expanded theme set** — four new themes for targeted ad campaigns: `/schlaf`, `/fokus`, `/erschoepfung`, `/angst`

---

## User Stories

1. As a visitor from an Instagram stress ad, I want to see immediately that TM is simple and personally taught, so that I don't dismiss it as another app or YouTube technique.
2. As a visitor, I want to scan a short list of key facts about TM in seconds, so that I can decide whether to keep reading without committing to a long scroll.
3. As a visitor considering signing up, I want to know exactly what happens at the Infoabend before I register, so that I feel safe clicking "Platz sichern".
4. As a visitor, I want to know how long the Infoabend is, so that I can decide if I have time.
5. As a visitor, I want to know whether the Infoabend is online or in person, so that I can judge whether it's accessible for me.
6. As a visitor, I want to know that the Infoabend is free and non-binding, so that I feel no pressure registering.
7. As a visitor who scrolled past the signup section without registering, I want to find one final clear invitation to sign up at the bottom, so that I have a second chance to act.
8. As a visitor who scrolled past signup, I want to see scientific evidence that TM works, so that my remaining scepticism is addressed before the final CTA.
9. As a visitor who is already interested in TM but not sure it's for me personally, I want to read about how the Infoabend covers my specific situation, so that I can see it's relevant to me.
10. As a visitor who cares about scientific credibility, I want a brief pointer to TM's research backing, so that I trust the claim that it works.
11. As someone who landed on the stress theme from an ad, I want the "Für wen ist TM?" section to immediately describe my exact experience, so that I feel understood.
12. As someone who landed on a sleep-focused ad, I want to land on a page that speaks directly about sleep and recovery, so that the page feels relevant to my reason for clicking.
13. As someone who landed on a focus/clarity ad, I want to see a page that addresses mental overload and scattered thinking, so that I feel the solution matches my problem.
14. As someone who landed on an anxiety ad, I want to see a page that speaks to inner restlessness and worry, so that I feel understood before reading further.
15. As someone who landed on an emotional exhaustion ad, I want to see a page that uses soft, non-clinical language about how everything feels like too much, so that I don't feel stigmatised.
16. As a visitor arriving via the Innere Freude theme, I want the tone to remain aspirational and positive, so that the emotional quality of that theme is preserved.
17. As an existing meditator who lands on the main page, I want to find the hamburger menu with a link to /events, so that I can easily navigate to group sessions and retreats.
18. As a visitor reading the nav menu, I want to see "Nächste Infoabende" not "Infovorträge", so that the terminology is consistent across the page.
19. As a visitor who didn't sign up at the Events section but kept scrolling, I want to read about the four steps of the TM journey (Infoabend → personal instruction → daily practice → results), so that I understand what commitment is required and feel reassured.
20. As a TM teacher using the admin panel, I want no impact on any admin functionality from these front-end changes, so that event and registration management continues to work.

---

## Implementation Decisions

### New components

**`TrustBadges`**
- Rendered between Hero and ForWhom on all theme pages
- Six badges: "Persönlich unterrichtet · Einfach erlernbar · Keine Konzentration nötig · Ohne Gedanken stoppen · Von Millionen weltweit praktiziert · 400+ wissenschaftliche Studien"
- Horizontal scrollable strip on mobile, centred row on desktop
- Stateless, no props needed

**`InfoabendPreview`** ("So läuft der Infoabend ab")
- Rendered directly before the Events section
- Content: what you learn at the Infoabend (was TM ist, wie es funktioniert, wie TM für dich passt / wirkt, Raum für Fragen), plus three info-boxes: Dauer ~60 min / Online oder vor Ort / Kostenlos & unverbindlich
- Static, no props needed
- Copy basis from CONTEXT.md and the ChatGPT conversation analysis

**`WissenschaftSection`** ("Wissenschaft & Forschung")
- Rendered after Events, before Teachers
- Short intro paragraph + 3 bullet points + CTA button → #anmeldung
- Headline: "TM gehört zu den am besten untersuchten Meditationstechniken weltweit"
- Bullets: aktuelle Forschung / praktische Erfahrungen / wie TM im Alltag wirkt
- Static, no props needed

**`AbschlussCta`**
- Rendered as the final section, after HowItWorks
- Headline: "Finde heraus, ob TM zu dir passt" + subtext + CTA button → #anmeldung
- Static, no props needed

### Modified files

**`content.ts`**
- Add four new Theme entries: `schlaf`, `fokus`, `erschoepfung`, `angst`
  - Each with: slug, label, headline[], subtitle, images (reuse stress images where needed), forWhomIndex
- Rewrite `forWhom.items` for all tabs except Innere Freude: symptom-first language, bullet-point pain lists
- Rename all user-facing "Infovortrag" / "Infovorträge" strings → "Infoabend" / "Infoabende"
- Add `trustBadges` and `infoabendPreview` content sections for copy management

**`page.tsx` (main site page)** — new section order:
1. Hero (via PageClient)
2. TrustBadges *(new)*
3. ForWhom (via PageClient)
4. Testimonials
5. WhyTm
6. Trustpilot
7. CenterBanner
8. InfoabendPreview *(new)*
9. Events
10. WissenschaftSection *(new)*
11. Teachers
12. HowItWorks *(moved from position 6)*
13. AbschlussCta *(new)*

All four theme pages (`depression` retired → replaced by `erschoepfung`) follow the same structure.

**`nav-panel.tsx`**
- "Nächste Infovorträge" → "Nächste Infoabende"
- Update `#wie-es-funktioniert` label if needed after move

**`how-it-works.tsx`**
- CTA button text: "Jetzt Infovortrag besuchen" → "Jetzt Infoabend besuchen"

**New theme route files**
- `src/app/(site)/schlaf/page.tsx`
- `src/app/(site)/fokus/page.tsx`
- `src/app/(site)/erschoepfung/page.tsx`
- `src/app/(site)/angst/page.tsx`
- Each mirrors the existing theme page pattern (e.g. `depression/page.tsx`)
- `src/app/(site)/depression/page.tsx` — retired; add redirect to `/erschoepfung`

### Terminology sweep
All user-facing occurrences of "Infovortrag" / "Infovorträge" across all components and content are replaced with "Infoabend" / "Infoabende". Admin-facing strings are out of scope.

---

## Testing Decisions

Automated testing is not warranted for this PRD. All changes are:
- Static React components with no branching logic
- Content data (strings, arrays in `content.ts`)
- Page-level section reordering

**QA approach:** Visual review in the browser (dev server) on mobile (390px) and desktop after each new component. Verify signup flow still works end-to-end after reorder.

---

## Out of Scope

- Interactive AI study search against the 475-study database (future feature, deferred)
- FAQ section changes
- A/B testing infrastructure
- Analytics integration
- Any changes to `/events` page or admin panel
- Hero image sourcing for new themes — themes may reuse existing images initially
- Copy for new theme headlines/subtitles (placeholder copy acceptable for initial implementation; final copy to be iterated)

---

## Further Notes

- See `CONTEXT.md` for canonical terminology, page structure rationale, and theme definitions
- The `depression` slug is retired; a redirect from `/depression` → `/erschoepfung` should be added to avoid dead links from any existing ad campaigns
- "Innere Stille" theme (`/innere-stille`) is also retired with no replacement needed — it had no active ad campaigns
- The 20-minute daily practice time commitment is intentionally NOT in the Trust Badges — it belongs in `InfoabendPreview` and `HowItWorks` where context has already been built
