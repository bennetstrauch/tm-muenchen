import type { MetadataRoute } from 'next';
import type { TenantConfig } from './tenant';

const DEFAULT_LOCALE = 'de';

type SeoTenant = Pick<
  TenantConfig,
  | 'hostname'
  | 'city'
  | 'legal_entity'
  | 'legal_address'
  | 'contact_phone'
  | 'contact_email'
  | 'instagram_link'
  | 'google_business_url'
>;

function parsePostalAddress(legalAddress: string) {
  const lines = legalAddress.split('\n').map((l) => l.trim()).filter(Boolean);
  const cityLine = lines.at(-1) ?? '';
  const postalCode = cityLine.match(/\b\d{5}\b/)?.[0] ?? '';
  return {
    '@type': 'PostalAddress' as const,
    streetAddress: lines.slice(0, -1).join(', ') || lines[0] || '',
    postalCode,
    addressLocality: cityLine.replace(postalCode, '').trim(),
    addressCountry: 'DE' as const,
  };
}

export function buildLocalBusinessJsonLd(tenant: SeoTenant): Record<string, unknown> & {
  '@type': string;
  name: string;
  url: string;
  address: ReturnType<typeof parsePostalAddress>;
  sameAs?: string[];
} {
  const sameAs = [
    tenant.instagram_link,
    tenant.google_business_url,
    'https://meditation.de',
  ].filter((v): v is string => Boolean(v));
  return {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: tenant.legal_entity,
    url: `https://${tenant.hostname}`,
    telephone: tenant.contact_phone,
    email: tenant.contact_email,
    address: parsePostalAddress(tenant.legal_address),
    areaServed: tenant.city,
    ...(sameAs.length ? { sameAs } : {}),
  };
}

// Public, indexable routes. Deliberately excludes /entdecken (a duplicate of /),
// admin/super-admin, and API routes.
export const PUBLIC_ROUTES = [
  '/',
  '/schlaf',
  '/fokus',
  '/angst',
  '/erschoepfung',
  '/innere-freude',
  '/kurse',
  '/events',
  '/impressum',
  '/datenschutz',
];

type RouteRank = Pick<MetadataRoute.Sitemap[number], 'changeFrequency' | 'priority'>;

function rankFor(path: string): RouteRank {
  if (path === '/') return { changeFrequency: 'weekly', priority: 1 };
  if (path === '/events') return { changeFrequency: 'weekly', priority: 0.7 };
  if (path === '/impressum' || path === '/datenschutz')
    return { changeFrequency: 'yearly', priority: 0.3 };
  return { changeFrequency: 'monthly', priority: 0.8 };
}

function urlFor(hostname: string, locale: string, path: string): string {
  const localePart = locale === DEFAULT_LOCALE ? '' : `/${locale}`;
  const pathPart = path === '/' ? '' : path;
  return `https://${hostname}${localePart}${pathPart}`;
}

export function buildSitemapEntries(
  hostname: string,
  locales: string[],
  routes: string[] = PUBLIC_ROUTES,
): MetadataRoute.Sitemap {
  return routes.map((path) => ({
    url: urlFor(hostname, DEFAULT_LOCALE, path),
    lastModified: new Date(),
    alternates: {
      languages: Object.fromEntries(locales.map((l) => [l, urlFor(hostname, l, path)])),
    },
    ...rankFor(path),
  }));
}

export function buildRobots(hostname: string): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin', '/super-admin', '/api'],
    },
    sitemap: `https://${hostname}/sitemap.xml`,
    host: hostname,
  };
}
