import { google } from 'googleapis';
import type { Veranstaltung } from './veranstaltungen';

const GULDEIN_PATTERN = /guldeinstr/i;
const DEFAULT_DURATION_MIN = 120;

function getCalendar() {
  const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!);
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/calendar.events'],
  });
  return google.calendar({ version: 'v3', auth });
}

export function isGuldeinEvent(v: Veranstaltung): boolean {
  return GULDEIN_PATTERN.test(v.location);
}

export async function createCalendarEvent(v: Veranstaltung): Promise<void> {
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  if (!calendarId) throw new Error('GOOGLE_CALENDAR_ID not configured');

  const startTime = v.time || '19:00';
  const startMs = new Date(`${v.date}T${startTime}:00+02:00`).getTime();
  const endMs = startMs + DEFAULT_DURATION_MIN * 60_000;
  const endDate = new Date(endMs);
  const endTime = `${String(endDate.getHours()).padStart(2, '0')}:${String(endDate.getMinutes()).padStart(2, '0')}`;

  const summary = v.subtitle ? `${v.title} – ${v.subtitle}` : v.title;
  const descParts = [v.description, v.longDescription, v.hosts && `mit ${v.hosts}`, v.price, v.notes].filter(Boolean);

  await getCalendar().events.insert({
    calendarId,
    requestBody: {
      summary,
      description: descParts.join('\n\n') || undefined,
      location: v.location,
      start: { dateTime: `${v.date}T${startTime}:00`, timeZone: 'Europe/Berlin' },
      end:   { dateTime: `${v.date}T${endTime}:00`,   timeZone: 'Europe/Berlin' },
    },
  });
}
