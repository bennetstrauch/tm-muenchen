import { describe, it, expect } from 'vitest';
import { buildAnmeldungenView, visibleGroups, type AnmeldungenEvent } from './anmeldungen-groups';
import type { EventRegistrationRecord } from './veranstaltungen';

function makeEvent(overrides: Partial<AnmeldungenEvent> & { id: string }): AnmeldungenEvent {
  return { title: 'Online Center-Abend', date: '2026-08-01', time: '19:30', ...overrides };
}

function makeReg(overrides: Partial<EventRegistrationRecord>): EventRegistrationRecord {
  return {
    timestamp: '2026-07-01T10:00:00Z',
    eventId: 'ev1',
    eventTitle: 'Online Center-Abend',
    eventDate: '2026-08-01',
    name: 'Anna Beispiel',
    email: 'anna@example.com',
    phone: '',
    tmLehrer: '',
    datumErlernen: '',
    ...overrides,
  };
}

const TODAY = '2026-07-05';

describe('buildAnmeldungenView', () => {
  it('groups Anmeldungen under their Veranstaltung with Titel, Datum und Uhrzeit from the event', () => {
    const events = [makeEvent({ id: 'ev1', title: 'Gruppenmeditation', date: '2026-08-01', time: '19:30' })];
    const regs = [
      makeReg({ eventId: 'ev1', name: 'Anna Beispiel' }),
      makeReg({ eventId: 'ev1', name: 'Ben Muster', email: 'ben@example.com' }),
    ];

    const view = buildAnmeldungenView(regs, events, TODAY);

    expect(view.upcoming).toHaveLength(1);
    const group = view.upcoming[0];
    expect(group.eventId).toBe('ev1');
    expect(group.title).toBe('Gruppenmeditation');
    expect(group.date).toBe('2026-08-01');
    expect(group.time).toBe('19:30');
    expect(group.deleted).toBe(false);
    expect(group.registrations.map(r => r.name)).toEqual(
      expect.arrayContaining(['Anna Beispiel', 'Ben Muster'])
    );
  });

  it('splits events into upcoming (heute zählt als bevorstehend) and past, upcoming sorted by Datum aufsteigend', () => {
    const events = [
      makeEvent({ id: 'later', date: '2026-09-01' }),
      makeEvent({ id: 'gestern', date: '2026-07-04' }),
      makeEvent({ id: 'heute', date: '2026-07-05' }),
      makeEvent({ id: 'soon', date: '2026-07-10' }),
    ];

    const view = buildAnmeldungenView([], events, TODAY);

    expect(view.upcoming.map(g => g.eventId)).toEqual(['heute', 'soon', 'later']);
    expect(view.past.map(g => g.eventId)).toEqual(['gestern']);
  });

  it('sorts Anmeldungen within a group by Anmeldedatum, neueste zuerst', () => {
    const events = [makeEvent({ id: 'ev1' })];
    const regs = [
      makeReg({ name: 'Mitte', timestamp: '2026-07-02T09:00:00Z' }),
      makeReg({ name: 'Älteste', timestamp: '2026-07-01T09:00:00Z' }),
      makeReg({ name: 'Neueste', timestamp: '2026-07-03T09:00:00Z' }),
    ];

    const view = buildAnmeldungenView(regs, events, TODAY);

    expect(view.upcoming[0].registrations.map(r => r.name)).toEqual(['Neueste', 'Mitte', 'Älteste']);
  });

  it('counts only Anmeldungen for bevorstehende Veranstaltungen in upcomingSignupCount', () => {
    const events = [
      makeEvent({ id: 'zukunft', date: '2026-08-01' }),
      makeEvent({ id: 'vergangen', date: '2026-01-01' }),
    ];
    const regs = [
      makeReg({ eventId: 'zukunft' }),
      makeReg({ eventId: 'zukunft', email: 'b@example.com' }),
      makeReg({ eventId: 'vergangen', eventDate: '2026-01-01' }),
    ];

    const view = buildAnmeldungenView(regs, events, TODAY);

    expect(view.upcomingSignupCount).toBe(2);
  });

  it('includes bevorstehende Veranstaltungen ohne Anmeldungen with an empty group', () => {
    const events = [makeEvent({ id: 'leer', date: '2026-08-15' })];

    const view = buildAnmeldungenView([], events, TODAY);

    expect(view.upcoming).toHaveLength(1);
    expect(view.upcoming[0].registrations).toEqual([]);
  });

  it('builds a deleted-flagged group from record data for verwaiste Anmeldungen', () => {
    const regs = [
      makeReg({ eventId: 'geloescht', eventTitle: 'Retreat 2026', eventDate: '2026-03-01' }),
      makeReg({ eventId: 'geloescht', eventTitle: 'Retreat 2026', eventDate: '2026-03-01', email: 'b@example.com' }),
    ];

    const view = buildAnmeldungenView(regs, [], TODAY);

    expect(view.past).toHaveLength(1);
    const group = view.past[0];
    expect(group.deleted).toBe(true);
    expect(group.title).toBe('Retreat 2026');
    expect(group.date).toBe('2026-03-01');
    expect(group.time).toBeUndefined();
    expect(group.registrations).toHaveLength(2);
  });

  it('keeps verwaiste Anmeldungen with empty eventId separated by Veranstaltung', () => {
    const regs = [
      makeReg({ eventId: '', eventTitle: 'Retreat 2025', eventDate: '2025-03-01' }),
      makeReg({ eventId: '', eventTitle: 'Sommerfest 2025', eventDate: '2025-06-01', email: 'b@example.com' }),
    ];

    const view = buildAnmeldungenView(regs, [], TODAY);

    expect(view.past.map(g => g.title).sort()).toEqual(['Retreat 2025', 'Sommerfest 2025']);
  });
});

describe('visibleGroups', () => {
  it('returns only upcoming groups without a locked event', () => {
    const events = [
      makeEvent({ id: 'zukunft', date: '2026-08-01' }),
      makeEvent({ id: 'vergangen', date: '2026-01-01' }),
    ];
    const view = buildAnmeldungenView([], events, TODAY);

    expect(visibleGroups(view).map(g => g.eventId)).toEqual(['zukunft']);
  });

  it('returns only the scoped group in Magic-Link mode, even for a past Veranstaltung', () => {
    const events = [
      makeEvent({ id: 'zukunft', date: '2026-08-01' }),
      makeEvent({ id: 'vergangen', date: '2026-01-01' }),
    ];
    const view = buildAnmeldungenView([], events, TODAY);

    expect(visibleGroups(view, 'vergangen').map(g => g.eventId)).toEqual(['vergangen']);
  });
});
