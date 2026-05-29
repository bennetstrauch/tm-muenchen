import { describe, it, expect } from 'vitest';
import { buildConfirmationSubject, buildReminderSubject } from './email';

describe('buildConfirmationSubject', () => {
  it('returns German subject by default', () => {
    expect(buildConfirmationSubject('11. April 2026', '19:00', false)).toContain('Bestätigung');
  });

  it('returns English subject for locale "en"', () => {
    expect(buildConfirmationSubject('11 April 2026', '19:00', false, 'en')).toContain('Confirmation');
  });

  it('includes Online indicator when isOnline is true', () => {
    expect(buildConfirmationSubject('11. April 2026', '19:00', true, 'en')).toContain('Online');
  });
});

describe('buildReminderSubject', () => {
  it('returns German subject by default', () => {
    expect(buildReminderSubject('19:00', false)).toContain('Erinnerung');
  });

  it('returns French subject for locale "fr"', () => {
    expect(buildReminderSubject('19:00', false, 'fr')).toContain('Rappel');
  });
});
