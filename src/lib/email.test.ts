import { describe, it, expect } from 'vitest';
import { buildConfirmationSubject, buildReminderSubject, emailWrapper, buildConfirmationHtml, buildReminderHtml } from './email';
import type { RegistrationEmailParams } from './email';
import { buildEventConfirmationHtml, buildCustomEmailHtml, buildEventReminderHtml } from './email-veranstaltung';
import type { EventEmailParams } from './email-veranstaltung';
import { buildInfoAnfrageUserHtml } from './email-info-anfrage';

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

describe('emailWrapper', () => {
  it('renders the passed headerBrand in the header section', () => {
    const html = emailWrapper('Betreff', '<tr><td>body</td></tr>', 'TM Center Freiburg');
    expect(html).toContain('TM Center Freiburg');
  });

  it('does not render München when a different brand is passed', () => {
    const html = emailWrapper('Betreff', '<tr><td>body</td></tr>', 'TM Center Freiburg');
    expect(html).not.toContain('München');
  });
});

const baseParams: RegistrationEmailParams = {
  name: 'Anna Müller',
  email: 'anna@example.com',
  eventDate: '11. April 2026',
  eventTime: '19:00',
  eventType: 'Präsenz',
  teacher: null,
};

describe('buildConfirmationHtml', () => {
  it('shows the centerName in the email header when provided', () => {
    const html = buildConfirmationHtml({ ...baseParams, centerName: 'Freiburg' });
    expect(html).toContain('Freiburg');
  });

  it('does not show München when a different centerName is provided', () => {
    const html = buildConfirmationHtml({ ...baseParams, centerName: 'Freiburg' });
    expect(html).not.toContain('München');
  });

  it('shows just the TM name without city when centerName is omitted', () => {
    const html = buildConfirmationHtml(baseParams);
    expect(html).toContain('Transzendentale Meditation');
    expect(html).not.toContain('München');
  });
});

describe('buildReminderHtml', () => {
  it('shows the centerName in header and signoff when provided', () => {
    const html = buildReminderHtml({ ...baseParams, centerName: 'Freiburg' });
    expect(html.match(/Freiburg/g)?.length).toBeGreaterThanOrEqual(2);
  });

  it('does not show München when a different centerName is provided', () => {
    const html = buildReminderHtml({ ...baseParams, centerName: 'Freiburg' });
    expect(html).not.toContain('München');
  });
});

const baseEventParams: EventEmailParams = {
  name: 'Klaus Bauer',
  eventTitle: 'Meditationsabend',
  eventSubtitle: 'Eine ruhige Stunde',
  eventDate: 'Dienstag, 19. Mai 2026',
  eventTime: '19:00',
  eventLocation: 'Zoom',
  isOnline: false,
  hosts: 'Maria',
};

describe('buildEventConfirmationHtml', () => {
  it('shows centerName in the email header when provided', () => {
    const html = buildEventConfirmationHtml({ ...baseEventParams, centerName: 'TM Center Hamburg' });
    expect(html).toContain('TM Center Hamburg');
  });

  it('does not show München when a different centerName is provided', () => {
    const html = buildEventConfirmationHtml({ ...baseEventParams, centerName: 'TM Center Hamburg' });
    expect(html).not.toContain('München');
  });
});

describe('buildCustomEmailHtml', () => {
  it('shows centerName in the email header when provided', () => {
    const html = buildCustomEmailHtml('Klaus', 'Hallo Welt', { centerName: 'TM Center Hamburg' });
    expect(html).toContain('TM Center Hamburg');
    const count = (html.match(/TM Center Hamburg/g) ?? []).length;
    expect(count).toBeGreaterThanOrEqual(2);
  });
});

describe('buildEventReminderHtml', () => {
  it('shows centerName in the email header when provided', () => {
    const html = buildEventReminderHtml({ ...baseEventParams, centerName: 'TM Center Hamburg' });
    expect(html).toContain('TM Center Hamburg');
    const count = (html.match(/TM Center Hamburg/g) ?? []).length;
    expect(count).toBeGreaterThanOrEqual(2);
  });
});

describe('buildInfoAnfrageUserHtml', () => {
  it('shows cityName in the email header when provided', () => {
    const html = buildInfoAnfrageUserHtml({ name: 'Jana', cityName: 'Hamburg' });
    expect(html).toContain('Hamburg');
    const count = (html.match(/Hamburg/g) ?? []).length;
    expect(count).toBeGreaterThanOrEqual(2);
  });

  it('does not show München when a different cityName is provided', () => {
    const html = buildInfoAnfrageUserHtml({ name: 'Jana', cityName: 'Hamburg' });
    expect(html).not.toContain('München');
  });

  it('uses locale-resolved TM name in header for non-German locales', () => {
    const html = buildInfoAnfrageUserHtml({ name: 'Jana', locale: 'fr', cityName: 'Hamburg' });
    expect(html).toContain('Méditation Transcendantale · Hamburg');
    expect(html).not.toContain('Transzendentale Meditation');
  });

  it('shows just the locale TM name without city when cityName is omitted', () => {
    const html = buildInfoAnfrageUserHtml({ name: 'Jana', locale: 'en' });
    expect(html).toContain('Transcendental Meditation');
    expect(html).not.toContain('München');
  });
});
