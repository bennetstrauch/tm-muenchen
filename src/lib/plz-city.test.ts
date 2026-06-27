import { describe, it, expect } from 'vitest';
import { lookupCityByPlz } from './plz-city';

describe('lookupCityByPlz', () => {
  it('returns a city for a known München PLZ', () => {
    expect(lookupCityByPlz('80331')).toBe('München');
  });

  it('returns null for an unknown PLZ', () => {
    expect(lookupCityByPlz('00000')).toBeNull();
  });

  it('handles PLZs with leading zeros', () => {
    expect(lookupCityByPlz('01067')).toBe('Dresden');
  });

  it('returns a city for a Berlin PLZ', () => {
    expect(lookupCityByPlz('10115')).toBe('Berlin');
  });
});
