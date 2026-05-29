@AGENTS.md

# TM München – Project Context

## What this project is

A conversion-optimized landing page for **TM München** (Transcendental Meditation center in Munich) at `tm-muenchen.de`. The primary goal is to turn Instagram ad traffic into sign-ups for free intro lectures (Infovorträge) — both online and in-person.

A secondary use case is a page for existing meditators to register for group sessions, retreats, and other events.

The canonical term for the intro session is **Infoabend** (not Infovortrag, not Info-Termin).

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

- **Landingpage ≠ website.** A hamburger menu exists for existing meditators to reach `/events`, but no distracting full navbar. One primary action: sign up for Infoabend.
- **Content lives in CMS, layout lives in code.** Non-technical colleagues edit text/images/events in CMS; Bennet controls the layout.
- **Mobile-first always.** Primary traffic source is Instagram ads — users land directly on mobile. Every component must look great at 390px before touching desktop styles.
- **Conversion-first structure:** see `CONTEXT.md` → Page structure for the confirmed section order.

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

Phases 1–4 are complete. Current focus: conversion optimisation.

| Phase | Scope | Status |
|---|---|---|
| 1 | Hero + CTA + static events | ✅ done |
| 2 | Full layout (testimonials, WhyTm, HowItWorks) | ✅ done |
| 3 | CMS integration (Google Sheets) | ✅ done |
| 4 | Auto-fetch events from tnw.meditation.de API | ✅ done |
| 5 | Conversion optimisation (new sections, themes, copy) | 🔄 current |
| 6 | Meditators page improvements | later |

## Events data

Lectures are currently managed at `tnw.meditation.de` and auto-synced to the national site. Goal is to fetch them via API and display automatically. Fallback: manage manually in CMS (Google Sheet preferred — colleagues already know it).

## Budget

- Target: 0–5 €/month
- Hard limit: ~20 €/month
- Domain already owned (tm-muenchen.de, hosted at EMVX)

## Anti-patterns

Do not:
- introduce global state unless truly shared across distant components
- add abstractions for hypothetical future reuse
- reach for a library when a platform primitive works
- use client components by default — server-first
- add visual complexity that doesn't serve conversion

## Agent skills

### Issue tracker

Issues live in GitHub Issues (`gh` CLI). See `docs/agents/issue-tracker.md`.

### Triage labels

Default label vocabulary (needs-triage, needs-info, ready-for-agent, ready-for-human, wontfix). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context — one `CONTEXT.md` + `docs/adr/` at repo root. See `docs/agents/domain.md`.

## Development workflow (skill pipeline)

For any non-trivial feature or improvement, follow this pipeline:

1. **/grill-with-docs** — interview to resolve all product decisions, update `CONTEXT.md` inline
2. **/to-prd** — write a tight PRD from the grilling output (core entities, MVP scope, non-goals, definition of done)
3. **/to-issues** — convert PRD to independently-grabbable vertical-slice issues
4. **/tdd** — implement each issue with red-green-refactor loop (where applicable)
5. **Ralph loop** — autonomous agent that reads PRD + progress file, picks next task, implements, commits, updates progress. Run only once the backlog is decomposed into small safe chunks.
6. **/improve-codebase-architecture** — optional, after features stabilise

Claude is the primary coding assistant throughout. No Google Stitch — design decisions happen in conversation or via screenshots.
