import type { EventRegistrationRecord, Veranstaltung } from './veranstaltungen';

export type AnmeldungenEvent = Pick<Veranstaltung, 'id' | 'title' | 'date' | 'time'>;

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
};

export function visibleGroups(view: AnmeldungenView, lockedEventId?: string): AnmeldungGroup[] {
  if (!lockedEventId) return view.upcoming;
  return [...view.upcoming, ...view.past].filter(g => g.eventId === lockedEventId);
}

export function buildAnmeldungenView(
  registrations: EventRegistrationRecord[],
  events: AnmeldungenEvent[],
  today: string,
): AnmeldungenView {
  const byNewest = (a: EventRegistrationRecord, b: EventRegistrationRecord) =>
    b.timestamp.localeCompare(a.timestamp);

  const groups: AnmeldungGroup[] = events.map(e => ({
    eventId: e.id,
    title: e.title,
    date: e.date,
    time: e.time,
    deleted: false,
    registrations: registrations.filter(r => r.eventId === e.id).sort(byNewest),
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
      registrations: regs.sort(byNewest),
    });
  }

  const upcoming = groups.filter(g => g.date >= today).sort((a, b) => a.date.localeCompare(b.date));
  const past = groups.filter(g => g.date < today);

  return {
    upcoming,
    past,
    upcomingSignupCount: upcoming.reduce((n, g) => n + g.registrations.length, 0),
  };
}
