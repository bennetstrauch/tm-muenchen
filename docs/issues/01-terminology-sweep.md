## Parent

Conversion optimisation — landing page overhaul (see docs/prd/conversion-optimisation.md)

## What to build

Replace every user-facing occurrence of "Infovortrag" / "Infovorträge" with "Infoabend" / "Infoabende" across the codebase. This is a prerequisite for consistent terminology throughout all subsequent changes.

Affected areas: `content.ts` strings, `nav-panel.tsx` link label, `how-it-works.tsx` CTA button text, and any other component that surfaces this term to visitors.

Admin-facing strings (e.g. in the admin panel) are out of scope.

## Acceptance criteria

- [ ] No user-facing instance of "Infovortrag" or "Infovorträge" remains on any page of the site
- [ ] Nav panel link reads "Nächste Infoabende"
- [ ] HowItWorks CTA button reads "Jetzt Infoabend besuchen"
- [ ] All strings in `content.ts` use "Infoabend" / "Infoabende"
- [ ] Site builds without errors

## Blocked by

None — can start immediately.
