import { getSheets } from './sheets';
import { formatVeranstaltungDate, calcReminderTime } from './format';

export { formatVeranstaltungDate, calcReminderTime };

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID!;
const EVENTS_TAB = 'Veranstaltungen';
const REGS_TAB = 'Veranstaltungen Anmeldungen';
const EVENTS_RANGE = `${EVENTS_TAB}!A:W`;
const REGS_RANGE = `${REGS_TAB}!A:I`;

export type Veranstaltung = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  longDescription: string;
  date: string;            // ISO: "2026-05-19"
  time: string;            // "17:00"
  location: string;
  isOnline: boolean;
  onlineLink: string;
  hosts: string;
  price: string;
  targetAudience: string;
  notes: string;
  reminder1Hours: number;  // default 24
  reminder2Hours: number;  // 0 = disabled
  registrationOpen: boolean;
  visible: boolean;
  isPriority: boolean;
  imageUrl?: string;
  auchFuerNichtMeditierende: boolean;
  slug?: string;
  vorlageId?: string;
};

export type EventRegistration = {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  name: string;
  email: string;
  phone: string;
  tmLehrer: string;
  datumErlernen: string;
};

export type EventRegistrationRecord = {
  timestamp: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  name: string;
  email: string;
  phone: string;
  tmLehrer: string;
  datumErlernen: string;
};

export function parseBool(val: string): boolean {
  return ['true', 'ja', '1', 'yes', 'x'].includes((val ?? '').toLowerCase().trim());
}

function rowToVeranstaltung(row: string[]): Veranstaltung {
  return {
    id: row[0] ?? '',
    title: row[1] ?? '',
    subtitle: row[2] ?? '',
    description: row[3] ?? '',
    longDescription: row[4] ?? '',
    date: row[5] ?? '',
    time: row[6] ?? '',
    location: row[7] ?? '',
    isOnline: parseBool(row[8] ?? ''),
    onlineLink: row[9] ?? '',
    hosts: row[10] ?? '',
    price: row[11] ?? '',
    targetAudience: row[12] ?? '',
    notes: row[13] ?? '',
    reminder1Hours: parseInt(row[14] ?? '') || 24,
    reminder2Hours: parseInt(row[15] ?? '') || 0,
    registrationOpen: parseBool(row[16] ?? 'TRUE'),
    visible: parseBool(row[17] ?? 'TRUE'),
    isPriority: parseBool(row[18] ?? ''),
    imageUrl: row[19] || undefined,
    auchFuerNichtMeditierende: parseBool(row[20] ?? ''),
    slug: row[21] || undefined,
    vorlageId: row[22] || undefined,
  };
}

function veranstaltungToRow(v: Veranstaltung): string[] {
  return [
    v.id,
    v.title,
    v.subtitle,
    v.description,
    v.longDescription,
    v.date,
    v.time,
    v.location,
    v.isOnline ? 'TRUE' : 'FALSE',
    v.onlineLink,
    v.hosts,
    v.price,
    v.targetAudience,
    v.notes,
    String(v.reminder1Hours || 24),
    v.reminder2Hours ? String(v.reminder2Hours) : '',
    v.registrationOpen ? 'TRUE' : 'FALSE',
    v.visible ? 'TRUE' : 'FALSE',
    v.isPriority ? 'TRUE' : 'FALSE',
    v.imageUrl ?? '',
    v.auchFuerNichtMeditierende ? 'TRUE' : 'FALSE',
    v.slug ?? '',
    v.vorlageId ?? '',
  ];
}

async function readAllEventRows(): Promise<{ rows: string[][] }> {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: EVENTS_RANGE,
  });
  const all = (res.data.values ?? []) as string[][];
  return { rows: all.length > 1 ? all.slice(1) : [] };
}

export async function getVeranstaltungById(id: string): Promise<Veranstaltung | null> {
  const { rows } = await readAllEventRows();
  const row = rows.find(r => r[0] === id);
  return row ? rowToVeranstaltung(row) : null;
}

export async function getAllVeranstaltungen(): Promise<Veranstaltung[]> {
  const { rows } = await readAllEventRows();
  return rows
    .filter(row => row.length >= 2 && row[0])
    .map(rowToVeranstaltung);
}

export async function getVeranstaltungen(): Promise<Veranstaltung[]> {
  const all = await getAllVeranstaltungen();
  const today = new Date().toISOString().slice(0, 10);
  return all
    .filter(v => v.visible && v.date >= today)
    .sort((a, b) => {
      if (a.isPriority !== b.isPriority) return a.isPriority ? -1 : 1;
      return a.date.localeCompare(b.date) || a.time.localeCompare(b.time);
    });
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export async function createVeranstaltung(v: Omit<Veranstaltung, 'id'>): Promise<Veranstaltung> {
  const sheets = getSheets();
  const full: Veranstaltung = { ...v, id: generateId() };
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: EVENTS_RANGE,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [veranstaltungToRow(full)] },
  });
  return full;
}

export async function updateVeranstaltung(v: Veranstaltung): Promise<void> {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${EVENTS_TAB}!A:A`,
  });
  const col = (res.data.values ?? []) as string[][];
  const idx = col.findIndex((row, i) => i > 0 && row[0] === v.id);
  if (idx === -1) throw new Error(`Veranstaltung ${v.id} not found`);
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${EVENTS_TAB}!A${idx + 1}:W${idx + 1}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [veranstaltungToRow(v)] },
  });
}

let _eventsSheetId: number | null = null;

async function getEventsSheetId(sheets: ReturnType<typeof getSheets>): Promise<number> {
  if (_eventsSheetId !== null) return _eventsSheetId;
  const res = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
    fields: 'sheets.properties',
  });
  const sheet = res.data.sheets?.find(s => s.properties?.title === EVENTS_TAB);
  if (!sheet) throw new Error(`Tab "${EVENTS_TAB}" not found`);
  _eventsSheetId = sheet.properties?.sheetId ?? 0;
  return _eventsSheetId;
}

async function findRowIndex(sheets: ReturnType<typeof getSheets>, id: string): Promise<number> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${EVENTS_TAB}!A:A`,
  });
  const col = (res.data.values ?? []) as string[][];
  return col.findIndex((row, i) => i > 0 && row[0] === id);
}

export async function deleteVeranstaltung(id: string): Promise<void> {
  const sheets = getSheets();
  const [rowIdx, sheetId] = await Promise.all([
    findRowIndex(sheets, id),
    getEventsSheetId(sheets),
  ]);
  if (rowIdx === -1) throw new Error(`Veranstaltung ${id} not found`);
  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: {
      requests: [{
        deleteDimension: {
          range: { sheetId, dimension: 'ROWS', startIndex: rowIdx, endIndex: rowIdx + 1 },
        },
      }],
    },
  });
}

export async function appendEventRegistration(r: EventRegistration): Promise<void> {
  const sheets = getSheets();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: REGS_RANGE,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' }),
        r.eventId,
        r.eventTitle,
        r.eventDate,
        r.name,
        r.email,
        r.phone ?? '',
        r.tmLehrer ?? '',
        r.datumErlernen ?? '',
      ]],
    },
  });
}

export async function getEventRegistrations(): Promise<EventRegistrationRecord[]> {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: REGS_RANGE,
  });
  const rows = (res.data.values ?? []) as string[][];
  return rows
    .filter(row => row.length >= 2 && row[0] !== 'Timestamp')
    .map(row => ({
      timestamp: row[0] ?? '',
      eventId: row[1] ?? '',
      eventTitle: row[2] ?? '',
      eventDate: row[3] ?? '',
      name: row[4] ?? '',
      email: row[5] ?? '',
      phone: row[6] ?? '',
      tmLehrer: row[7] ?? '',
      datumErlernen: row[8] ?? '',
    }))
    .reverse();
}
