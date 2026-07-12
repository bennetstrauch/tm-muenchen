import { describe, it, expect } from 'vitest';
import { buildRobots, buildSitemapEntries, buildLocalBusinessJsonLd, PUBLIC_ROUTES } from './seo';

const muenchen = {
  tenant: 'muenchen',
  hostname: 'tm-muenchen.de',
  city: 'München',
  legal_entity: 'Transzendentale Meditation München e.V.',
  legal_address: 'Guldeinstraße 47\n80639 München',
  contact_phone: '+49 89 1234567',
  contact_email: 'info@tm-muenchen.de',
  instagram_link: 'https://www.instagram.com/muenchentranszendiert',
  google_business_url: 'https://g.page/tm-muenchen',
};

describe('buildRobots', () => {
  it('allows crawling but disallows admin and api areas', () => {
    const robots = buildRobots('tm-muenchen.de');
    const rule = robots.rules as { allow?: string | string[]; disallow?: string | string[] };
    expect(rule.allow).toBe('/');
    expect(rule.disallow).toEqual(expect.arrayContaining(['/admin', '/super-admin', '/api']));
  });

  it('points at the tenant-specific sitemap', () => {
    expect(buildRobots('tm-freiburg.de').sitemap).toBe('https://tm-freiburg.de/sitemap.xml');
  });
});

describe('buildSitemapEntries', () => {
  it('uses the unprefixed URL for the default locale (de) and prefixes the rest', () => {
    const entries = buildSitemapEntries('tm-muenchen.de', ['de', 'en', 'fr', 'es'], ['/']);
    const home = entries[0];
    expect(home.url).toBe('https://tm-muenchen.de');
    expect(home.alternates?.languages).toEqual({
      de: 'https://tm-muenchen.de',
      en: 'https://tm-muenchen.de/en',
      fr: 'https://tm-muenchen.de/fr',
      es: 'https://tm-muenchen.de/es',
    });
  });

  it('joins locale prefix and route path for non-root routes', () => {
    const entries = buildSitemapEntries('tm-muenchen.de', ['de', 'en'], ['/schlaf']);
    expect(entries[0].url).toBe('https://tm-muenchen.de/schlaf');
    expect(entries[0].alternates?.languages?.en).toBe('https://tm-muenchen.de/en/schlaf');
  });

  it('emits one entry per route', () => {
    const entries = buildSitemapEntries('tm-muenchen.de', ['de'], ['/', '/kurse', '/events']);
    expect(entries).toHaveLength(3);
  });

  it('excludes /entdecken (duplicate of /) and non-public areas from PUBLIC_ROUTES', () => {
    expect(PUBLIC_ROUTES).toContain('/');
    expect(PUBLIC_ROUTES).not.toContain('/entdecken');
    expect(PUBLIC_ROUTES).not.toContain('/admin');
    expect(PUBLIC_ROUTES).not.toContain('/super-admin');
  });
});

describe('buildLocalBusinessJsonLd', () => {
  it('describes the center as a LocalBusiness with name, url and contact', () => {
    const ld = buildLocalBusinessJsonLd(muenchen);
    expect(ld['@context']).toBe('https://schema.org');
    expect(ld['@type']).toBe('LocalBusiness');
    expect(ld.name).toBe('Transzendentale Meditation München e.V.');
    expect(ld.url).toBe('https://tm-muenchen.de');
    expect(ld.telephone).toBe('+49 89 1234567');
    expect(ld.email).toBe('info@tm-muenchen.de');
  });

  it('parses the multiline legal address into a PostalAddress', () => {
    const ld = buildLocalBusinessJsonLd(muenchen);
    expect(ld.address).toEqual({
      '@type': 'PostalAddress',
      streetAddress: 'Guldeinstraße 47',
      postalCode: '80639',
      addressLocality: 'München',
      addressCountry: 'DE',
    });
  });

  it('links social profiles via sameAs, dropping blanks', () => {
    expect(buildLocalBusinessJsonLd(muenchen).sameAs).toContain(
      'https://www.instagram.com/muenchentranszendiert',
    );
    expect(buildLocalBusinessJsonLd({ ...muenchen, instagram_link: '' }).sameAs ?? []).not.toContain('');
  });

  it('includes the Google Business Profile in sameAs when set, omits when blank', () => {
    expect(buildLocalBusinessJsonLd(muenchen).sameAs).toContain('https://g.page/tm-muenchen');
    expect(
      buildLocalBusinessJsonLd({ ...muenchen, google_business_url: null }).sameAs ?? [],
    ).not.toContain('https://g.page/tm-muenchen');
  });

  it('extracts the postal code and city even when the address has extra lines', () => {
    const ld = buildLocalBusinessJsonLd({
      ...muenchen,
      legal_address: 'c/o Max Mustermann\nBeispielweg 3\n80331 München',
    });
    expect(ld.address.postalCode).toBe('80331');
    expect(ld.address.addressLocality).toBe('München');
    expect(ld.address.streetAddress).toBe('c/o Max Mustermann, Beispielweg 3');
  });
});
