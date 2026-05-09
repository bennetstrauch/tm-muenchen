import { google } from 'googleapis';
import { getAllVeranstaltungen } from './veranstaltungen';

const CENTER_URL = 'https://tmw.meditation.de/api/center/108';
const COURSES_URL = 'https://tmw.meditation.de/api/center/108/courses';
const LOCATION = 'Guldeinstr. 47, 80339 München';
const COLLISION_RE = /grundkurs|einführ|folgetag|tag\s*\d|info/i;

const DE_MONTHS: Record<string, string> = {
  Januar: '01', Februar: '02', März: '03', April: '04',
  Mai: '05', Juni: '06', Juli: '07', August: '08',
  September: '09', Oktober: '10', November: '11', Dezember: '12',
};

function parseGermanDateTime(str: string): { date: string; time: string } {
  const match = str.match(/(\d{1,2})\.\s+(\w+)\s+(\d{4}),?\s+um\s+(\d{2}:\d{2})/);
  if (!match) return { date: '', time: '' };
  const [, day, month, year, time] = match;
  return {
    date: `${year}-${DE_MONTHS[month] ?? '01'}-${day.padStart(2, '0')}`,
    time,
  };
}

function parseGermanDateOnly(str: string): string {
  const match = str.match(/(\d{1,2})\.\s+(\w+)\s+(\d{4})/);
  if (!match) return '';
  const [, day, month, year] = match;
  return `${year}-${DE_MONTHS[month] ?? '01'}-${day.padStart(2, '0')}`;
}

function addMinutes(time: string, minutes: number): string {
  const [h, m] = time.split(':').map(Number);
  const total = h * 60 + m + minutes;
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

function uniqueFirstNames(names: string[]): string {
  return [...new Set(names.map(n => n.trim().split(' ')[0]))].join(' & ');
}

function getCalendar() {
  const auth = new google.auth.OAuth2(
    process.env.GOOGLE_OAUTH_CLIENT_ID!,
    process.env.GOOGLE_OAUTH_CLIENT_SECRET!,
  );
  auth.setCredentials({ refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN! });
  return google.calendar({ version: 'v3', auth });
}

type CalEntry = {
  tmwId: string;
  title: string;
  date: string;
  startTime: string;
  endTime: string;
};

export type SyncResult = {
  created: string[];
  updated: string[];
  deleted: string[];
  skipped: string[];
  errors: string[];
};

async function getExistingTmwEvents(
  cal: ReturnType<typeof getCalendar>,
  calendarId: string,
): Promise<Map<string, string>> {
  const result = new Map<string, string>();
  const today = new Date().toISOString().slice(0, 10);
  let pageToken: string | undefined;

  do {
    const res = await cal.events.list({
      calendarId,
      privateExtendedProperty: ['tmwType=tmw'],
      timeMin: `${today}T00:00:00Z`,
      maxResults: 250,
      singleEvents: true,
      pageToken,
    });
    for (const event of res.data.items ?? []) {
      const tmwId = event.extendedProperties?.private?.tmwId;
      if (tmwId && event.id) result.set(tmwId, event.id);
    }
    pageToken = res.data.nextPageToken ?? undefined;
  } while (pageToken);

  return result;
}

async function buildCollisionDates(): Promise<Set<string>> {
  const events = await getAllVeranstaltungen();
  const dates = new Set<string>();
  for (const e of events) {
    if (COLLISION_RE.test(e.title)) dates.add(e.date);
  }
  return dates;
}

async function buildDesiredEntries(token: string): Promise<Map<string, CalEntry>> {
  const desired = new Map<string, CalEntry>();
  const today = new Date().toISOString().slice(0, 10);

  const [centerRes, coursesRes] = await Promise.all([
    fetch(CENTER_URL, { headers: { Authorization: `Token ${token}` } }),
    fetch(COURSES_URL, { headers: { Authorization: `Token ${token}` } }),
  ]);

  const center = await centerRes.json();
  const courses = await coursesRes.json();

  // ── Lectures ────────────────────────────────────────────
  for (const lecture of center.lectures as { pk: number; date: string; webinar_link: string; teacher_name: string }[]) {
    if (lecture.webinar_link) continue; // online → skip
    const { date, time } = parseGermanDateTime(lecture.date);
    if (!date || date < today) continue;
    const firstName = lecture.teacher_name?.trim().split(' ')[0] ?? '';
    const tmwId = `lecture-${lecture.pk}`;
    desired.set(tmwId, {
      tmwId,
      title: `Info ${firstName}`.trim(),
      date,
      startTime: time,
      endTime: addMinutes(time, 120),
    });
  }

  // ── Courses ─────────────────────────────────────────────
  for (const course of courses as {
    date: string;
    slots: { pk: number; booked: string; time: string; duration: number; teacher: { name: string } }[];
    follow_up1: string; follow_up1_online: boolean;
    follow_up2: string; follow_up2_online: boolean;
    follow_up3: string; follow_up3_online: boolean;
  }[]) {
    const courseDate = parseGermanDateOnly(course.date);
    if (!courseDate || courseDate < today) continue;

    const allTeachers = course.slots.map(s => s.teacher.name);
    const teacherNames = uniqueFirstNames(allTeachers);

    // 8am anchor — always
    desired.set(`course-${courseDate}`, {
      tmwId: `course-${courseDate}`,
      title: `TM-Kurs ${teacherNames}`,
      date: courseDate,
      startTime: '08:00',
      endTime: '09:00',
    });

    // Booked slots numbered chronologically
    const booked = course.slots
      .filter(s => s.booked === 'yes')
      .sort((a, b) => a.time.localeCompare(b.time));

    for (let i = 0; i < booked.length; i++) {
      const slot = booked[i];
      const tmwId = `slot-${slot.pk}`;
      desired.set(tmwId, {
        tmwId,
        title: `${i + 1}. Person Einführung`,
        date: courseDate,
        startTime: slot.time,
        endTime: addMinutes(slot.time, slot.duration),
      });
    }

    // Follow-ups — always, unless online
    for (const n of [1, 2, 3] as const) {
      const dateStr = course[`follow_up${n}`];
      const isOnline = course[`follow_up${n}_online`];
      if (!dateStr || isOnline) continue;
      const { date: fuDate, time: fuTime } = parseGermanDateTime(dateStr);
      if (!fuDate || fuDate < today) continue;
      const tmwId = `course-${courseDate}-followup${n}`;
      desired.set(tmwId, {
        tmwId,
        title: `Folgetag ${n} TM-Kurs`,
        date: fuDate,
        startTime: fuTime,
        endTime: addMinutes(fuTime, 120),
      });
    }
  }

  return desired;
}

export async function syncTmw(): Promise<SyncResult> {
  const token = process.env.TMW_API_KEY;
  const calendarId = process.env.GOOGLE_CALENDAR_ID;
  if (!token) throw new Error('TMW_API_KEY not configured');
  if (!calendarId) throw new Error('GOOGLE_CALENDAR_ID not configured');

  const cal = getCalendar();
  const result: SyncResult = { created: [], updated: [], deleted: [], skipped: [], errors: [] };

  const [desired, existing, collisionDates] = await Promise.all([
    buildDesiredEntries(token),
    getExistingTmwEvents(cal, calendarId),
    buildCollisionDates(),
  ]);

  // Upsert
  for (const [tmwId, entry] of desired) {
    if (collisionDates.has(entry.date)) {
      result.skipped.push(`${entry.title} (${entry.date})`);
      continue;
    }

    const requestBody = {
      summary: entry.title,
      location: LOCATION,
      start: { dateTime: `${entry.date}T${entry.startTime}:00`, timeZone: 'Europe/Berlin' },
      end:   { dateTime: `${entry.date}T${entry.endTime}:00`,   timeZone: 'Europe/Berlin' },
      extendedProperties: { private: { tmwId, tmwType: 'tmw' } },
    };

    try {
      const existingId = existing.get(tmwId);
      if (existingId) {
        await cal.events.patch({ calendarId, eventId: existingId, requestBody });
        result.updated.push(entry.title);
      } else {
        await cal.events.insert({ calendarId, requestBody });
        result.created.push(entry.title);
      }
    } catch (e) {
      result.errors.push(`${entry.title}: ${e instanceof Error ? e.message : String(e)}`);
    }
  }

  // Delete stale
  for (const [tmwId, eventId] of existing) {
    if (!desired.has(tmwId)) {
      try {
        await cal.events.delete({ calendarId, eventId });
        result.deleted.push(tmwId);
      } catch (e) {
        result.errors.push(`delete ${tmwId}: ${e instanceof Error ? e.message : String(e)}`);
      }
    }
  }

  return result;
}
