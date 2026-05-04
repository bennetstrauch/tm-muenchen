import { getSheets } from './sheets';
import type { Veranstaltung } from './veranstaltungen';

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID!;
const TAB = 'Vorlagen';
const RANGE = `${TAB}!A:U`;

// A Vorlage is a Veranstaltung with an extra alias field `name`.
// Sheet columns: id | name | ...all Veranstaltung fields (same order as Veranstaltungen tab)
export type Vorlage = Veranstaltung & { name: string };

const HEADERS = [
  'id', 'name', 'title', 'subtitle', 'description', 'longDescription',
  'date', 'time', 'location', 'isOnline', 'onlineLink', 'hosts',
  'price', 'targetAudience', 'notes', 'reminder1Hours', 'reminder2Hours',
  'registrationOpen', 'visible', 'isPriority', 'imageUrl',
];

function parseBool(val: string): boolean {
  return ['true', 'ja', '1', 'yes', 'x'].includes((val ?? '').toLowerCase().trim());
}

function rowToVorlage(row: string[]): Vorlage {
  return {
    id: row[0] ?? '',
    name: row[1] ?? '',
    title: row[2] ?? '',
    subtitle: row[3] ?? '',
    description: row[4] ?? '',
    longDescription: row[5] ?? '',
    date: row[6] ?? '',
    time: row[7] ?? '',
    location: row[8] ?? '',
    isOnline: parseBool(row[9] ?? ''),
    onlineLink: row[10] ?? '',
    hosts: row[11] ?? '',
    price: row[12] ?? '',
    targetAudience: row[13] ?? '',
    notes: row[14] ?? '',
    reminder1Hours: parseInt(row[15] ?? '') || 24,
    reminder2Hours: parseInt(row[16] ?? '') || 0,
    registrationOpen: parseBool(row[17] ?? 'TRUE'),
    visible: parseBool(row[18] ?? 'TRUE'),
    isPriority: parseBool(row[19] ?? ''),
    imageUrl: row[20] || undefined,
  };
}

function vorlageToRow(v: Vorlage): string[] {
  return [
    v.id,
    v.name,
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
  ];
}

async function ensureTab(sheets: ReturnType<typeof getSheets>): Promise<void> {
  const meta = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
    fields: 'sheets.properties.title',
  });
  const exists = meta.data.sheets?.some(s => s.properties?.title === TAB);
  if (exists) return;

  await sheets.spreadsheets.batchUpdate({
    spreadsheetId: SPREADSHEET_ID,
    requestBody: { requests: [{ addSheet: { properties: { title: TAB } } }] },
  });
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${TAB}!A1`,
    valueInputOption: 'RAW',
    requestBody: { values: [HEADERS] },
  });
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

export async function getAllVorlagen(): Promise<Vorlage[]> {
  const sheets = getSheets();
  await ensureTab(sheets);
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: RANGE,
  });
  const rows = (res.data.values ?? []) as string[][];
  return rows
    .filter((row, i) => i > 0 && row.length >= 2 && row[0])
    .map(rowToVorlage);
}

export async function createVorlage(v: Omit<Vorlage, 'id'>): Promise<Vorlage> {
  const sheets = getSheets();
  const full: Vorlage = { ...v, id: generateId() };
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: RANGE,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [vorlageToRow(full)] },
  });
  return full;
}

export async function updateVorlage(v: Vorlage): Promise<void> {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${TAB}!A:A`,
  });
  const col = (res.data.values ?? []) as string[][];
  const idx = col.findIndex((row, i) => i > 0 && row[0] === v.id);
  if (idx === -1) throw new Error(`Vorlage ${v.id} not found`);
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${TAB}!A${idx + 1}:U${idx + 1}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [vorlageToRow(v)] },
  });
}

let _sheetId: number | null = null;

async function getVorlagenSheetId(sheets: ReturnType<typeof getSheets>): Promise<number> {
  if (_sheetId !== null) return _sheetId;
  const res = await sheets.spreadsheets.get({
    spreadsheetId: SPREADSHEET_ID,
    fields: 'sheets.properties',
  });
  const sheet = res.data.sheets?.find(s => s.properties?.title === TAB);
  if (!sheet) throw new Error(`Tab "${TAB}" not found`);
  _sheetId = sheet.properties?.sheetId ?? 0;
  return _sheetId;
}

async function findRowIndex(sheets: ReturnType<typeof getSheets>, id: string): Promise<number> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${TAB}!A:A`,
  });
  const col = (res.data.values ?? []) as string[][];
  return col.findIndex((row, i) => i > 0 && row[0] === id);
}

export async function deleteVorlage(id: string): Promise<void> {
  const sheets = getSheets();
  const [rowIdx, sheetId] = await Promise.all([
    findRowIndex(sheets, id),
    getVorlagenSheetId(sheets),
  ]);
  if (rowIdx === -1) throw new Error(`Vorlage ${id} not found`);
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
