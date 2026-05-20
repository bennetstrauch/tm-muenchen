import { describe, it, expect } from 'vitest';
import { generateWhatsAppText, buildWhatsappUrl } from './whatsapp';
import type { Veranstaltung } from './veranstaltungen';

const BASE: Veranstaltung = {
  id: '1',
  title: 'Gruppenmeditation',
  subtitle: '',
  description: '',
  longDescription: '',
  date: '2026-06-10',
  time: '19:00',
  location: '',
  isOnline: true,
  onlineLink: 'https://zoom.us/j/123',
  hosts: 'Bennet',
  price: '',
  targetAudience: '',
  notes: '',
  reminder1Hours: 24,
  reminder2Hours: 0,
  registrationOpen: true,
  visible: true,
  isPriority: false,
  auchFuerNichtMeditierende: false,
};

describe('generateWhatsAppText', () => {
  it('includes title, date, time, Online indicator, sign-up URL, and default signoff for online event', () => {
    const text = generateWhatsAppText(BASE);
    expect(text).toContain('Gruppenmeditation');
    expect(text).toContain('10. Juni 2026');
    expect(text).toContain('19:00 Uhr');
    expect(text).toContain('Online');
    expect(text).toContain('tm-muenchen.de/events?open=gruppenmeditation');
    expect(text).toContain('Liebe Grüße');
    expect(text).toContain('Bennet');
  });

  it('shows location for in-person event instead of Online', () => {
    const event = { ...BASE, isOnline: false, location: 'TM-Center München, Leopoldstr. 23' };
    const text = generateWhatsAppText(event);
    expect(text).toContain('TM-Center München, Leopoldstr. 23');
    expect(text).not.toContain('Online');
  });

  it('includes subtitle when present, omits it when absent', () => {
    const withSub = generateWhatsAppText({ ...BASE, subtitle: 'mit Bennet Strauch' });
    expect(withSub).toContain('mit Bennet Strauch');

    const withoutSub = generateWhatsAppText(BASE);
    const lines = withoutSub.split('\n');
    const titleIdx = lines.findIndex(l => l.includes('Gruppenmeditation'));
    expect(lines[titleIdx + 1]).not.toBe('mit Bennet Strauch');
  });

  it('includes price when present, omits it when absent', () => {
    const withPrice = generateWhatsAppText({ ...BASE, price: '15 €' });
    expect(withPrice).toContain('15 €');

    const withoutPrice = generateWhatsAppText(BASE);
    expect(withoutPrice).not.toContain('€');
  });

  it('places greeting above title when provided, omits it when absent', () => {
    const withGreeting = generateWhatsAppText(BASE, { greeting: 'Liebe Meditierende,' });
    const lines = withGreeting.split('\n');
    const greetingIdx = lines.findIndex(l => l.includes('Liebe Meditierende,'));
    const titleIdx = lines.findIndex(l => l.includes('🧘 Gruppenmeditation'));
    expect(greetingIdx).toBeGreaterThanOrEqual(0);
    expect(greetingIdx).toBeLessThan(titleIdx);

    const withoutGreeting = generateWhatsAppText(BASE);
    expect(withoutGreeting).not.toContain('Liebe Meditierende,');
  });

  it('places freetext below sign-up link when provided, omits it when absent', () => {
    const withFreetext = generateWhatsAppText(BASE, { freetext: 'Bringt gerne Freunde mit!' });
    const lines = withFreetext.split('\n');
    const urlIdx = lines.findIndex(l => l.includes('tm-muenchen.de/events'));
    const freetextIdx = lines.findIndex(l => l.includes('Bringt gerne Freunde mit!'));
    expect(freetextIdx).toBeGreaterThan(urlIdx);

    const withoutFreetext = generateWhatsAppText(BASE);
    expect(withoutFreetext).not.toContain('Bringt gerne Freunde mit!');
  });

  it('uses custom signoff when provided', () => {
    const text = generateWhatsAppText(BASE, { signoff: 'Herzliche Grüße' });
    expect(text).toContain('Herzliche Grüße');
    expect(text).not.toContain('Liebe Grüße');
  });

  it('lists all Leiter names from comma-separated hosts field', () => {
    const text = generateWhatsAppText({ ...BASE, hosts: 'Bennet, Malena, Thomas' });
    expect(text).toContain('Bennet, Malena, Thomas');
  });

  it('uses custom slug when set, falls back to title-derived slug', () => {
    const withSlug = generateWhatsAppText({ ...BASE, slug: 'mein-event' });
    expect(withSlug).toContain('tm-muenchen.de/events?open=mein-event');

    const withUmlauts = generateWhatsAppText({ ...BASE, title: 'Gruppenübung München' });
    expect(withUmlauts).toContain('tm-muenchen.de/events?open=gruppenuebung-muenchen');
  });
});

describe('buildWhatsappUrl', () => {
  it('returns a wa.me URL with the text URL-encoded', () => {
    const url = buildWhatsappUrl('Hallo Welt!');
    expect(url).toBe('https://wa.me/?text=Hallo%20Welt!');
  });

  it('encodes newlines and special characters', () => {
    const url = buildWhatsappUrl('Zeile 1\nZeile 2 & mehr');
    expect(url).toContain('https://wa.me/?text=');
    expect(url).toContain('%0A'); // newline encoded
    expect(url).toContain('Zeile%201');
  });
});
