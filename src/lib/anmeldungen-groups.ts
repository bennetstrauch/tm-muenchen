import type { EventRegistrationRecord, Veranstaltung } from './veranstaltungen';

export type AnmeldungenEvent = Pick<Veranstaltung, 'id' | 'title' | 'date' | 'time' | 'vorlageId'>;

export type ReihenSummary = { label: string; termine: number; anmeldungen: number };

export type AnmeldungGroup = {
  eventId: string;
  title: string;
  date: string;
  time?: string;
  deleted: boolean;
  registrations: EventRegistrationRecord[];
};

export type AnmeldungenView = {
  upcoming: AnmeldungGroup[];
  past: AnmeldungGroup[];
  upcomingSignupCount: number;
  reihen: ReihenSummary[];
};

export type AnmeldungenSort = { key: 'timestamp' | 'name'; dir: 'asc' | 'desc' };

export function sortRegistrations(
  registrations: EventRegistrationRecord[],
  sort: AnmeldungenSort,
): EventRegistrationRecord[] {
  const sign = sort.dir === 'asc' ? 1 : -1;
  const cmp = sort.key === 'name'
    ? (a: EventRegistrationRecord, b: EventRegistrationRecord) => a.name.localeCompare(b.name, 'de')
    : (a: EventRegistrationRecord, b: EventRegistrationRecord) =>
        a.timestamp < b.timestamp ? -1 : a.timestamp > b.timestamp ? 1 : 0;
  return [...registrations].sort((a, b) => sign * cmp(a, b));
}

export function visibleGroups(view: AnmeldungenView, lockedEventId?: string): AnmeldungGroup[] {
  if (!lockedEventId) return view.upcoming;
  return [...view.upcoming, ...view.past].filter(g => g.eventId === lockedEventId);
}

export function buildAnmeldungenView(
  registrations: EventRegistrationRecord[],
  events: AnmeldungenEvent[],
  today: string,
): AnmeldungenView {
  const newestFirst: AnmeldungenSort = { key: 'timestamp', dir: 'desc' };

  const groups: AnmeldungGroup[] = events.map(e => ({
    eventId: e.id,
    title: e.title,
    date: e.date,
    time: e.time,
    deleted: false,
    registrations: sortRegistrations(registrations.filter(r => r.eventId === e.id), newestFirst),
  }));

  const eventIds = new Set(events.map(e => e.id));
  const orphans = new Map<string, EventRegistrationRecord[]>();
  for (const r of registrations) {
    if (eventIds.has(r.eventId)) continue;
    const key = r.eventId || `${r.eventTitle}|${r.eventDate}`;
    orphans.set(key, [...(orphans.get(key) ?? []), r]);
  }
  for (const regs of orphans.values()) {
    groups.push({
      eventId: regs[0].eventId,
      title: regs[0].eventTitle,
      date: regs[0].eventDate,
      deleted: true,
      registrations: sortRegistrations(regs, newestFirst),
    });
  }

  const upcoming = groups.filter(g => g.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  const past = groups.filter(g => g.date < today).sort((a, b) => b.date.localeCompare(a.date));

  return {
    upcoming,
    past,
    upcomingSignupCount: upcoming.reduce((n, g) => n + g.registrations.length, 0),
    reihen: buildReihen(events, registrations),
  };
}

function buildReihen(events: AnmeldungenEvent[], registrations: EventRegistrationRecord[]): ReihenSummary[] {
  const byReihe = new Map<string, AnmeldungenEvent[]>();
  for (const e of events) {
    const key = e.vorlageId ? `vorlage:${e.vorlageId}` : `titel:${e.title}`;
    byReihe.set(key, [...(byReihe.get(key) ?? []), e]);
  }

  return [...byReihe.entries()]
    .filter(([key, reihe]) => key.startsWith('vorlage:') || reihe.length > 1)
    .map(([, reihe]) => {
      const latest = reihe.reduce((a, b) => (b.date > a.date ? b : a));
      const ids = new Set(reihe.map(e => e.id));
      return {
        label: latest.title,
        termine: reihe.length,
        anmeldungen: registrations.filter(r => ids.has(r.eventId)).length,
      };
    })
    .sort((a, b) => b.anmeldungen - a.anmeldungen);
}
