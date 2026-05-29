import { describe, it, expect } from 'vitest';
import { buildRegistrationRow } from './sheets';

describe('buildRegistrationRow', () => {
  const BASE = {
    name: 'Anna Müller',
    email: 'anna@example.com',
    phone: '+49 123 456',
    eventDate: '11. April 2026',
    eventTime: '19:00',
    eventType: 'Online' as const,
  };

  it('appends locale as column H when provided', () => {
    const row = buildRegistrationRow(BASE, 'en');
    expect(row[7]).toBe('en');
  });

  it('defaults to "de" when locale is omitted', () => {
    const row = buildRegistrationRow(BASE);
    expect(row[7]).toBe('de');
  });

  it('produces 8 columns total', () => {
    const row = buildRegistrationRow(BASE, 'fr');
    expect(row).toHaveLength(8);
  });
});
