-- track_without_consent · per-tenant opt-in that abandons the consent-first
-- Meta Pixel model for one center (see ADR 0011). When true, the Cookie-Banner
-- is not shown and the Pixel loads on page load, tracking every visitor without
-- opt-in. The dangerous state is the non-default `true`, so every existing and
-- newly-created tenant stays consent-first unless deliberately switched.
-- Super-admin only; never exposed in the tenant Einstellungen tab.

alter table tenants
  add column track_without_consent boolean not null default false;
