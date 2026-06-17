import { describe, it, expect } from 'vitest';
import { cityToPlz } from './geo';

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
