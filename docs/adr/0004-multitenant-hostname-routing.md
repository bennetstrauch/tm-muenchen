# ADR 0004 — Multi-Tenant Routing by Hostname

## Status
Accepted

## Context

TM München is the first of potentially many German TM centers that could run on this platform. The platform needs a way to serve different tenant configurations from a single Vercel deployment.

Three routing models were considered:

| Option | Tenant URL | Pros | Cons |
|---|---|---|---|
| Hostname-based | `tm-berlin.de` | Centers keep their own domain; no shared platform brand | Each center must point DNS to Vercel |
| Subdomain of shared domain | `berlin.tm-platform.de` | Simpler DNS setup | Centers lose their own domain; looks less local |
| Separate deployments | One Vercel project per center | Full isolation | Manual deploy per center; design changes don't propagate |

## Decision

**Single Vercel deployment, multi-tenant by hostname.**

Next.js `middleware.ts` runs at Vercel's Edge Network on every request. It reads the `Host` header, queries Supabase for a matching `tenants.hostname` row, and sets an `x-tenant` request header. All server components and API routes read the tenant via `getCurrentTenant()` — a `React cache()`-wrapped function that performs exactly one Supabase call per request regardless of how many components call it.

- Unknown hostnames (bots, misrouted traffic) redirect to `tm-muenchen.de`.
- Local dev resolves tenant via `DEV_TENANT` env var (default: `muenchen`).

Centers keep their own domains (`tm-berlin.de`, `meditationberlin.de`, any format). No shared platform domain exists — tenant identity comes purely from the hostname row in the `tenants` table, not from URL parsing.

## Consequences

- Onboarding a new center requires: inserting a `tenants` row + pointing the center's DNS to Vercel. No code changes.
- Separate deployments were ruled out because design improvements must reach all centers simultaneously.
- Shared subdomain was ruled out because local domain trust matters for conversion (visitors see their city's domain in the address bar).
- The `tenants` table is the single source of truth for hostname → tenant mapping. A misconfigured or missing hostname row causes a redirect to `tm-muenchen.de`, not a 500.
