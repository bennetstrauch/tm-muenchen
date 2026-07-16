import { describe, it, expect } from 'vitest';
import { buildSource } from './attribution-source';

describe('buildSource', () => {
  it('assembles host, path and allowlisted params into a full URL', () => {
    expect(
      buildSource('info.meditation.de', '/schlaf', { utm_source: 'ig', _ad: 'fb' }),
    ).toBe('https://info.meditation.de/schlaf?utm_source=ig&_ad=fb');
  });

  it('omits the query string for an organic visit with no params', () => {
    expect(buildSource('info.meditation.de', '/schlaf', {})).toBe(
      'https://info.meditation.de/schlaf',
    );
  });

  it('drops query keys that are not on the allowlist', () => {
    expect(
      buildSource('info.meditation.de', '/', { utm_source: 'ig', evil: 'x', ref: 'y' }),
    ).toBe('https://info.meditation.de/?utm_source=ig');
  });

  it('falls back to root when the path does not start with a slash', () => {
    expect(buildSource('info.meditation.de', 'schlaf', {})).toBe(
      'https://info.meditation.de/',
    );
  });

  it('rejects a path that carries its own scheme or host (no override)', () => {
    expect(buildSource('info.meditation.de', 'https://evil.com/x', {})).toBe(
      'https://info.meditation.de/',
    );
    expect(buildSource('info.meditation.de', '//evil.com/x', {})).toBe(
      'https://info.meditation.de/',
    );
  });

  it('rejects a path containing control characters', () => {
    expect(buildSource('info.meditation.de', '/schlaf\n/x', {})).toBe(
      'https://info.meditation.de/',
    );
  });

  it('strips control characters from param values', () => {
    expect(
      buildSource('info.meditation.de', '/', { utm_campaign: 'sum\r\nmer\t2026' }),
    ).toBe('https://info.meditation.de/?utm_campaign=summer2026');
  });

  it('caps the assembled source length', () => {
    const long = 'x'.repeat(1000);
    const result = buildSource('info.meditation.de', '/', { utm_content: long });
    expect(result.length).toBeLessThanOrEqual(512);
  });
});
