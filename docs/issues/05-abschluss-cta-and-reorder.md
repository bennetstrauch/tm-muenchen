## Parent

Conversion optimisation — landing page overhaul (see docs/prd/conversion-optimisation.md)

## What to build

Two coordinated changes to the bottom of the page:

1. **Move HowItWorks** from its current position (between WhyTm and Trustpilot) to after the Teachers section — making it a "what happens after the Infoabend" deepening layer for hesitant visitors.

2. **New `AbschlussCta` component** — a final closing CTA section placed at the very end of the page, after HowItWorks.
   - Headline: "Finde heraus, ob TM zu dir passt"
   - Short subtext
   - CTA button → #anmeldung

Final page order at the bottom:
Events → Wissenschaft → Teachers → HowItWorks → AbschlussCta

## Acceptance criteria

- [ ] HowItWorks appears after Teachers, not after WhyTm
- [ ] AbschlussCta component exists and renders at the very end of the page
- [ ] AbschlussCta CTA button links to #anmeldung
- [ ] All existing sections still render correctly after the reorder
- [ ] On mobile (390px) AbschlussCta looks clean
- [ ] Site builds without errors

## Blocked by

None — can start immediately.
