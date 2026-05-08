import { google } from 'googleapis';
import type { Veranstaltung } from './veranstaltungen';

const GULDEIN_PATTERN = /guldeinstr/i;
const DEFAULT_DURATION_MIN = 120;

function addMinutesToTime(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function buildEventFields(v: Veranstaltung) {
  const startTime = v.time;
  const endTime = v.endTime || addMinutesToTime(startTime, DEFAULT_DURATION_MIN);
  const summary = v.subtitle ? `${v.title} – ${v.subtitle}` : v.title;
  const timeNote = v.endTime
    ? `${startTime} – ca. ${endTime} Uhr`
    : `${startTime} – ca. ${endTime} Uhr (2h)`;
  const descParts = [
    timeNote,
    v.description,
    v.longDescription,
    v.hosts && `mit ${v.hosts}`,
    v.price,
    v.notes,
  ].filter(Boolean);
  return { startTime, endTime, summary, description: descParts.join('\n\n') };
}

function getCalendar() {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID!,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
  );
  auth.setCredentials({ refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN! });
  return google.calendar({ version: 'v3', auth });
}

export function isGuldeinEvent(v: Veranstaltung): boolean {
  return GULDEIN_PATTERN.test(v.location);
}

export async function createCalendarEvent(v: Veranstaltung): Promise<void> {
  if (!v.time) return;

  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  if (!calendarId) throw new Error('GOOGLE_CALENDAR_ID not configured');

  const { startTime, endTime, summary, description } = buildEventFields(v);

  await getCalendar().events.insert({
    calendarId,
    requestBody: {
      summary,
      description,
      location: v.location,
      start: { dateTime: `${v.date}T${startTime}:00`, timeZone: 'Europe/Berlin' },
      end:   { dateTime: `${v.date}T${endTime}:00`,   timeZone: 'Europe/Berlin' },
      extendedProperties: { private: { veranstaltungId: v.id } },
    },
  });
}

export async function deleteCalendarEvent(id: string): Promise<void> {
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  if (!calendarId) throw new Error('GOOGLE_CALENDAR_ID not configured');

  const cal = getCalendar();
  const listRes = await cal.events.list({
    calendarId,
    privateExtendedProperty: [`veranstaltungId=${id}`],
    maxResults: 1,
  });

  const existing = listRes.data.items?.[0];
  if (existing?.id) {
    await cal.events.delete({ calendarId, eventId: existing.id });
  }
}

export async function updateCalendarEvent(v: Veranstaltung): Promise<void> {
  if (!v.time) return;

  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  if (!calendarId) throw new Error('GOOGLE_CALENDAR_ID not configured');

  const cal = getCalendar();
  const listRes = await cal.events.list({
    calendarId,
    privateExtendedProperty: [`veranstaltungId=${v.id}`],
    maxResults: 1,
  });

  const existing = listRes.data.items?.[0];
  if (!existing?.id) {
    await createCalendarEvent(v);
    return;
  }

  const { startTime, endTime, summary, description } = buildEventFields(v);

  await cal.events.patch({
    calendarId,
    eventId: existing.id,
    requestBody: {
      summary,
      description,
      location: v.location,
      start: { dateTime: `${v.date}T${startTime}:00`, timeZone: 'Europe/Berlin' },
      end:   { dateTime: `${v.date}T${endTime}:00`,   timeZone: 'Europe/Berlin' },
    },
  });
}
