## Parent

Conversion optimisation — landing page overhaul (see docs/prd/conversion-optimisation.md)

## What to build

Add four new ad-targeted theme variants to the site, and retire the two outdated themes.

**New themes to add** (each with slug, headline, subtitle, images, forWhomIndex in `content.ts` + a new `page.tsx` route):
- `/schlaf` — Schlaf & Regeneration
- `/fokus` — Fokus & Klarheit
- `/erschoepfung` — Emotionale Erschöpfung (soft, non-clinical language)
- `/angst` — Angst & innere Unruhe

Images may reuse existing stress images where dedicated images are not yet available.

**Themes to retire:**
- `/depression` — add a Next.js redirect to `/erschoepfung`
- `/innere-stille` — remove route; no redirect needed (no active ad campaigns)

## Acceptance criteria

- [ ] All four new theme routes render correctly with their own hero headline and subtitle
- [ ] Each new theme pre-selects the correct ForWhom tab on load
- [ ] `/depression` redirects to `/erschoepfung` (301)
- [ ] `/innere-stille` route is removed; navigating to it returns a 404 or redirects to `/`
- [ ] Theme-switching arrows in the hero navigate through the updated theme set correctly
- [ ] All new theme pages are mobile-friendly at 390px
- [ ] Site builds without errors

## Blocked by

None — can start immediately.
