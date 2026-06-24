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
- jump straight to implementation — understand precisely what is required and have a simple solution in mind before touching code, then write failing tests first (/tdd), then make them pass
- bypass an established abstraction (`getCurrentTenant()`, `checkAdminRequest()`, etc.) at a call site — if a helper needs to change, change the helper. See ADR-0002.
- mix languages in user-facing labels or copy — this codebase uses German throughout admin UI labels

## Agent skills

### Issue tracker

Issues live in GitHub Issues (`gh` CLI). See `docs/agents/issue-tracker.md`.

### Triage labels

Default label vocabulary (needs-triage, needs
-info, ready-for-agent, ready-for-human, wontfix). See `docs/agents/triage-labels.md`.

### Domain docs

Single-context — one `CONTEXT.md` + `docs/adr/` at repo root. See `docs/agents/domain.md`.

## Development workflow (skill pipeline)

### Feature pipeline
For any non-trivial feature or improvement:

1. **/grill-with-docs** — interview to resolve all product decisions, update `CONTEXT.md` inline
2. **/to-prd** — write a tight PRD from the grilling output (core entities, MVP scope, non-goals, definition of done)
3. **/to-issues** — convert PRD to independently-grabbable vertical-slice issues
4. **/pre-impl** — per issue: read task, find existing abstractions, write implementation contract, get sign-off
5. **/tdd** — implement with red-green-refactor loop (after pre-impl sign-off)
6. **/craft** — quality audit of the diff **before committing** — not after
7. **Ralph loop** — autonomous agent for executing a decomposed backlog. Only after steps 1–3 are complete.
8. **/improve-codebase-architecture** — optional, after features stabilise

### Bug pipeline
For any bug fix or quick ad-hoc change:

1. **/diagnose** — reproduce → minimise → hypothesise → instrument → fix → regression-test
2. **/pre-impl** — state the fix, list which abstractions it uses, flag any bypass (even for small changes)
3. **/craft** — audit the diff **before committing**

**Rule:** `/craft` always runs before a commit, not after. `/pre-impl` always runs before code is written, not after.

Claude is the primary coding assistant throughout. No Google Stitch — design decisions happen in conversation or via screenshots.
