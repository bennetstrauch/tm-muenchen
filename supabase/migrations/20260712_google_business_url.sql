-- Google Business Profile URL per tenant.
-- Feeds the LocalBusiness JSON-LD (sameAs) and the "Auf Google" link in the CenterBanner.
-- Nullable; blank hides the public link entirely.
alter table tenants add column if not exists google_business_url text;
