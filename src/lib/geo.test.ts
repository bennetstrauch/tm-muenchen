import { describe, it, expect } from 'vitest';
import { cityToPlz, resolveGeo } from './geo';

function headers(h: Record<string, string>): Headers {
  return new Headers(h);
}

describe('cityToPlz', () => {
  it('returns a München PLZ for München', () => {
    expect(cityToPlz('München')).toBe('80331');
  });

  it('accepts URL-encoded city names from the Vercel header', () => {
    expect(cityToPlz('M%C3%BCnchen')).toBe('80331');
  });

  it('returns empty string for unknown cities', () => {
    expect(cityToPlz('Atlantis')).toBe('');
  });

  it('is case-insensitive', () => {
    expect(cityToPlz('MÜNCHEN')).toBe('80331');
    expect(cityToPlz('münchen')).toBe('80331');
  });
});

describe('resolveGeo', () => {
  it('uses the Vercel postal-code header for a DE visitor', () => {
    const geo = resolveGeo(headers({
      'x-vercel-ip-city': 'München',
      'x-vercel-ip-postal-code': '80638',
    }));
    expect(geo).toEqual({ city: 'München', zip_code: '80638' });
  });

  it('falls back to cityToPlz when there is no postal-code header', () => {
    const geo = resolveGeo(headers({
      'x-vercel-ip-city': 'Berlin',
    }));
    expect(geo).toEqual({ city: 'Berlin', zip_code: '10115' });
  });

  it('forwards the real postal code for a non-DE visitor (TMW accepts any ≤12 chars)', () => {
    const geo = resolveGeo(headers({
      'x-vercel-ip-city': 'Salzburg',
      'x-vercel-ip-postal-code': '5020',
    }));
    expect(geo).toEqual({ city: 'Salzburg', zip_code: '5020' });
  });

  it('returns empty zip_code when the city is unknown and there is no postal code', () => {
    const geo = resolveGeo(headers({
      'x-vercel-ip-city': 'Germering',
    }));
    expect(geo).toEqual({ city: 'Germering', zip_code: '' });
  });

  it('returns empty city and zip_code when no geo headers are present', () => {
    expect(resolveGeo(headers({}))).toEqual({ city: '', zip_code: '' });
  });
});
