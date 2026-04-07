@AGENTS.md

# TM München – Project Context

## What this project is

A conversion-optimized landing page for **TM München** (Transcendental Meditation center in Munich) at `tm-muenchen.de`. The primary goal is to turn Instagram ad traffic into sign-ups for free intro lectures (Infovorträge) — both online and in-person.

A secondary use case is a page for existing meditators to register for group sessions, retreats, and other events.

## Why this exists

Previous campaigns sent Instagram ad traffic to the national TM website (`meditation.de/muenchen`). Conversion was near zero — too many steps, no local personality. This site is the fix: a focused, local, high-trust landing page with a single CTA.

## Users

- **Bennet** — software developer (React, Angular, frontend, backend), primary developer, uses Claude heavily
- **Center colleagues** — non-technical, must be able to edit content without touching code. Don't know Notion — prefer tools they already use (Google Sheets) or with a very obvious UI (Sanity Studio)

## Tech stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS v4 |
| Hosting | Vercel (free tier) |
| CMS | TBD — Google Sheets (simplest, colleagues already know it) or Sanity |
| Forms | TBD — Formspree free tier or custom |
| Analytics | TBD — optional |

> **Note:** This project uses Next.js 16 and React 19 — both newer than typical training data. Always read `node_modules/next/dist/docs/` before writing Next.js-specific code.

## Architecture principles

- **Landingpage ≠ website.** No navbar, no menu, no distracting links. One action: sign up for Infovortrag.
- **Content lives in CMS, layout lives in code.** Non-technical colleagues edit text/images/events in CMS; Bennet controls the layout.
- **Mobile-first always.** Primary traffic source is Instagram ads — users land directly on mobile. Every component must look great at 390px before touching desktop styles.
- **Conversion-first structure:** Hero → Trust signals → Why TM is unique → How it works → Upcoming dates → Testimonials → FAQ → CTA

## Folder structure

```
src/
  app/
    page.tsx          # landing page
    events/page.tsx   # for existing meditators (later)
  components/
    hero.tsx
    benefits.tsx
    events.tsx
    testimonials.tsx
    faq.tsx
  lib/
    cms.ts            # CMS fetch logic
    events.ts         # meditation.de API or fallback
```

## Phased roadmap

| Phase | Scope |
|---|---|
| 1 | Hero + CTA + static events (manual) |
| 2 | Full layout (testimonials, FAQ, benefits) |
| 3 | CMS integration (Google Sheets or Sanity) |
| 4 | Auto-fetch events from tnw.meditation.de API |
| 5 | Meditators page (events, retreats) |

## Events data

Lectures are currently managed at `tnw.meditation.de` and auto-synced to the national site. Goal is to fetch them via API and display automatically. Fallback: manage manually in CMS (Google Sheet preferred — colleagues already know it).

## Budget

- Target: 0–5 €/month
- Hard limit: ~20 €/month
- Domain already owned (tm-muenchen.de, hosted at EMVX)

## Workflow

Design in Google Stitch → screenshot/export → prompt Claude to build in Next.js + Tailwind → iterate. Claude is the primary coding assistant throughout.
