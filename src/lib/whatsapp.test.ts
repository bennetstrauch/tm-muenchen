import { describe, it, expect } from 'vitest';
import { generateWhatsAppText, buildWhatsappUrl, buildWhatsappDirectLink } from './whatsapp';
import type { Veranstaltung } from './veranstaltungen';

const HOST = 'tm-muenchen.de';

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
    const text = generateWhatsAppText(BASE, {}, HOST);
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
    const text = generateWhatsAppText(event, {}, HOST);
    expect(text).toContain('TM-Center München, Leopoldstr. 23');
    expect(text).not.toContain('Online');
  });

  it('includes subtitle when present, omits it when absent', () => {
    const withSub = generateWhatsAppText({ ...BASE, subtitle: 'mit Bennet Strauch' }, {}, HOST);
    expect(withSub).toContain('mit Bennet Strauch');

    const withoutSub = generateWhatsAppText(BASE, {}, HOST);
    const lines = withoutSub.split('\n');
    const titleIdx = lines.findIndex(l => l.includes('Gruppenmeditation'));
    expect(lines[titleIdx + 1]).not.toBe('mit Bennet Strauch');
  });

  it('includes price when present, omits it when absent', () => {
    const withPrice = generateWhatsAppText({ ...BASE, price: '15 €' }, {}, HOST);
    expect(withPrice).toContain('15 €');

    const withoutPrice = generateWhatsAppText(BASE, {}, HOST);
    expect(withoutPrice).not.toContain('€');
  });

  it('places greeting above title when provided, omits it when absent', () => {
    const withGreeting = generateWhatsAppText(BASE, { greeting: 'Liebe Meditierende,' }, HOST);
    const lines = withGreeting.split('\n');
    const greetingIdx = lines.findIndex(l => l.includes('Liebe Meditierende,'));
    const titleIdx = lines.findIndex(l => l.includes('🧘 Gruppenmeditation'));
    expect(greetingIdx).toBeGreaterThanOrEqual(0);
    expect(greetingIdx).toBeLessThan(titleIdx);

    const withoutGreeting = generateWhatsAppText(BASE, {}, HOST);
    expect(withoutGreeting).not.toContain('Liebe Meditierende,');
  });

  it('places freetext below sign-up link when provided, omits it when absent', () => {
    const withFreetext = generateWhatsAppText(BASE, { freetext: 'Bringt gerne Freunde mit!' }, HOST);
    const lines = withFreetext.split('\n');
    const urlIdx = lines.findIndex(l => l.includes('tm-muenchen.de/events'));
    const freetextIdx = lines.findIndex(l => l.includes('Bringt gerne Freunde mit!'));
    expect(freetextIdx).toBeGreaterThan(urlIdx);

    const withoutFreetext = generateWhatsAppText(BASE, {}, HOST);
    expect(withoutFreetext).not.toContain('Bringt gerne Freunde mit!');
  });

  it('uses custom signoff when provided', () => {
    const text = generateWhatsAppText(BASE, { signoff: 'Herzliche Grüße' }, HOST);
    expect(text).toContain('Herzliche Grüße');
    expect(text).not.toContain('Liebe Grüße');
  });

  it('lists all Leiter names from comma-separated hosts field', () => {
    const text = generateWhatsAppText({ ...BASE, hosts: 'Bennet, Malena, Thomas' }, {}, HOST);
    expect(text).toContain('Bennet, Malena, Thomas');
  });

  it('uses custom slug when set, falls back to title-derived slug', () => {
    const withSlug = generateWhatsAppText({ ...BASE, slug: 'mein-event' }, {}, HOST);
    expect(withSlug).toContain('tm-muenchen.de/events?open=mein-event');

    const withUmlauts = generateWhatsAppText({ ...BASE, title: 'Gruppenübung München' }, {}, HOST);
    expect(withUmlauts).toContain('tm-muenchen.de/events?open=gruppenuebung-muenchen');
  });

  it('uses the provided hostname in the sign-up URL', () => {
    const text = generateWhatsAppText(BASE, {}, 'tm-luebeck.de');
    expect(text).toContain('tm-luebeck.de/events?open=gruppenmeditation');
    expect(text).not.toContain('tm-muenchen.de');
  });
});

describe('buildWhatsappUrl', () => {
  it('returns a web.whatsapp.com URL with the text URL-encoded', () => {
    const url = buildWhatsappUrl('Hallo Welt!');
    expect(url).toBe('https://web.whatsapp.com/send?text=Hallo%20Welt!');
  });

  it('encodes newlines and special characters', () => {
    const url = buildWhatsappUrl('Zeile 1\nZeile 2 & mehr');
    expect(url).toContain('https://web.whatsapp.com/send?text=');
    expect(url).toContain('%0A'); // newline encoded
    expect(url).toContain('Zeile%201');
  });
});

describe('buildWhatsappDirectLink', () => {
  it('uses whatsapp_number when set, stripping non-digits and leading +', () => {
    expect(buildWhatsappDirectLink('+49 163 7354 836', null)).toBe(
      'https://wa.me/491637354836'
    );
  });

  it('falls back to contact_phone when whatsapp_number is null', () => {
    expect(buildWhatsappDirectLink(null, '+49 89 123456')).toBe(
      'https://wa.me/4989123456'
    );
  });

  it('falls back to contact_phone when whatsapp_number is empty string', () => {
    expect(buildWhatsappDirectLink('', '+49 89 123456')).toBe(
      'https://wa.me/4989123456'
    );
  });

  it('returns null when both are null or empty', () => {
    expect(buildWhatsappDirectLink(null, '')).toBeNull();
    expect(buildWhatsappDirectLink('', '')).toBeNull();
    expect(buildWhatsappDirectLink(null, null)).toBeNull();
  });
});
