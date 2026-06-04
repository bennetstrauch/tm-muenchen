# ADR 0006 — Simple Per-Tenant Password Auth (Not Supabase Auth)

## Status
Accepted

## Context

Each TM center needs a protected admin panel. The platform is already on Supabase, which ships a full auth system (Supabase Auth: email/password accounts, JWTs, password reset flows, role-based access).

Two options were evaluated:

| Option | Complexity | Fit |
|---|---|---|
| Supabase Auth | High — user accounts, sessions, email flows, role management | Overkill for one admin per center |
| One hashed password per tenant row | Low — bcrypt compare, one cookie | Matches actual need exactly |

## Decision

**One `admin_password_hash` column in the `tenants` table.** Login: admin navigates to their domain's `/admin`, enters password, server runs `bcrypt.compare(input, tenant.admin_password_hash)`, sets a signed session cookie on success.

No username field — the tenant is already resolved from the hostname before the login form renders. The admin is always logging into their own center.

**Super-admin** (Bennet, cross-tenant access): separate route `/super-admin`, password from a `SUPER_ADMIN_PASSWORD_HASH` environment variable. Not stored in the `tenants` table.

The existing Magic Link mechanism (per-event scoped access for Leiter) is unchanged — it already provides the right level of delegation without requiring a full auth system.

## Consequences

- No forgotten-password flow. If a center admin loses their password, Bennet updates the hash in the `tenants` row directly (or via the super-admin UI).
- No multi-user support per center. If a center ever needs two admin accounts, this decision will need revisiting.
- Supabase Auth was rejected specifically because the complexity (user tables, email verification, JWT refresh) exceeds what one-admin-per-center requires, and because coupling to Supabase Auth makes the auth layer harder to reason about than a simple bcrypt check.
