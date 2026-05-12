# TM München – Domain Glossary

## Infoabend
A free, non-binding introductory session (~60 min) where people learn what TM is, how it differs from other techniques, and can ask questions. Offered both online and in-person in Munich. This is the **primary conversion goal** of the landing page — getting visitors to sign up for one.

> Canonical term: **Infoabend** (not "Infovortrag", not "Info-Termin", not "Infovortrag")

## Page structure (confirmed)
Rationale: convince early → remove friction + sign up in the middle → deepen for hesitant visitors late → second-chance CTA at end.

1. **Hero** — emotional headline, single CTA → Infoabend
2. **Trust-Badges** *(new)* — "✔ Persönlich unterrichtet · ✔ Einfach erlernbar · ✔ Keine Konzentration nötig · ✔ Ohne Gedanken stoppen · ✔ Von Millionen weltweit praktiziert · ✔ 400+ wissenschaftliche Studien". Zeit-Investment (20 min) NOT here. Long science claim ("meistuntersuchte Technik weltweit") belongs as headline in Wissenschaft section, not as badge.
3. **Für wen?** — pain-point tabs with symptom language + bullets (all except Innere Freude rewritten)
4. **Testimonials** — real quotes
5. **Was TM einzigartig macht** — WhyTm section
6. **Trustpilot** — rating widget
7. **CenterBanner** — center info
8. **So läuft der Infoabend ab** *(new)* — directly before Termine; what TM ist, wie es funktioniert, wie TM für dich passt/wirkt, Raum für Fragen; Dauer ~60 min, online/vor Ort, kostenlos & unverbindlich
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
