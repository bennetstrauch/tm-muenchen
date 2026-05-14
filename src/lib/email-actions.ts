import { getSheets } from './sheets';

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID!;
const TAB = 'E-Mail Aktionen';
const RANGE = `${TAB}!A:L`;

export type EmailActionType = 'custom' | 'reminder-1' | 'reminder-2';
export type EmailActionStatus = 'pending' | 'sent' | 'failed' | 'cancelled';
export type EmailActionCreatedBy = 'admin' | 'leiter';

export type EmailAction = {
  id: string;
  eventId: string;
  eventTitle: string;
  type: EmailActionType;
  subject: string;
  body: string;
  scheduledAt: string;      // ISO datetime, empty = send now
  sentAt: string;           // ISO datetime, empty if not yet sent
  status: EmailActionStatus;
  recipientCount: number;
  errorMessage: string;
  createdBy: EmailActionCreatedBy;
};

function rowToEmailAction(row: string[]): EmailAction {
  return {
    id: row[0] ?? '',
    eventId: row[1] ?? '',
    eventTitle: row[2] ?? '',
    type: (row[3] ?? 'custom') as EmailActionType,
    subject: row[4] ?? '',
    body: row[5] ?? '',
    scheduledAt: row[6] ?? '',
    sentAt: row[7] ?? '',
    status: (row[8] ?? 'pending') as EmailActionStatus,
    recipientCount: parseInt(row[9] ?? '0') || 0,
    errorMessage: row[10] ?? '',
    createdBy: (row[11] ?? 'admin') as EmailActionCreatedBy,
  };
}

function emailActionToRow(a: EmailAction): string[] {
  return [
    a.id,
    a.eventId,
    a.eventTitle,
    a.type,
    a.subject,
    a.body,
    a.scheduledAt,
    a.sentAt,
    a.status,
    String(a.recipientCount),
    a.errorMessage,
    a.createdBy,
  ];
}

function generateId(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
}

function colLetter(n: number): string {
  let result = '';
  while (n > 0) {
    const rem = (n - 1) % 26;
    result = String.fromCharCode(65 + rem) + result;
    n = Math.floor((n - 1) / 26);
  }
  return result;
}

async function findRowIndex(sheets: ReturnType<typeof getSheets>, id: string): Promise<number> {
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${TAB}!A:A`,
  });
  const col = (res.data.values ?? []) as string[][];
  return col.findIndex((row, i) => i > 0 && row[0] === id);
}

export async function getEmailActions(eventId?: string): Promise<EmailAction[]> {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: RANGE,
  });
  const rows = (res.data.values ?? []) as string[][];
  const actions = rows
    .filter(row => row.length >= 2 && row[0] && row[0] !== 'id')
    .map(rowToEmailAction);
  return eventId ? actions.filter(a => a.eventId === eventId) : actions;
}

export async function createEmailAction(data: Omit<EmailAction, 'id'>): Promise<EmailAction> {
  const sheets = getSheets();
  const action: EmailAction = { ...data, id: generateId() };
  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: RANGE,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [emailActionToRow(action)] },
  });
  return action;
}

export async function updateEmailAction(action: EmailAction): Promise<void> {
  const sheets = getSheets();
  const idx = await findRowIndex(sheets, action.id);
  if (idx === -1) throw new Error(`EmailAction ${action.id} not found`);
  const row = emailActionToRow(action);
  await sheets.spreadsheets.values.update({
    spreadsheetId: SPREADSHEET_ID,
    range: `${TAB}!A${idx + 1}:${colLetter(row.length)}${idx + 1}`,
    valueInputOption: 'USER_ENTERED',
    requestBody: { values: [row] },
  });
}

export async function deleteEmailAction(id: string): Promise<void> {
  const actions = await getEmailActions();
  const action = actions.find(a => a.id === id);
  if (!action) throw new Error(`EmailAction ${id} not found`);
  if (action.status !== 'pending') throw new Error('Only pending actions can be cancelled');
  await updateEmailAction({ ...action, status: 'cancelled' });
}

export async function markEmailActionSent(id: string, recipientCount: number): Promise<void> {
  const actions = await getEmailActions();
  const action = actions.find(a => a.id === id);
  if (!action) throw new Error(`EmailAction ${id} not found`);
  await updateEmailAction({
    ...action,
    status: 'sent',
    sentAt: new Date().toISOString(),
    recipientCount,
  });
}

export async function markEmailActionFailed(id: string, errorMessage: string): Promise<void> {
  const actions = await getEmailActions();
  const action = actions.find(a => a.id === id);
  if (!action) throw new Error(`EmailAction ${id} not found`);
  await updateEmailAction({ ...action, status: 'failed', errorMessage });
}

/**
 * Pure function — no I/O. Returns true if a reminder with the given offset
 * is due within the current windowMinutes window.
 */
export function isReminderDue(
  isoDate: string,
  time: string,
  hoursOffset: number,
  now: Date,
  windowMinutes = 60,
): boolean {
  if (hoursOffset <= 0) return false;
  const [, month] = isoDate.split('-').map(Number);
  const utcOffset = month >= 4 && month <= 10 ? 2 : 1;
  const offsetStr = utcOffset === 2 ? '+02:00' : '+01:00';
  const eventMs = new Date(`${isoDate}T${time || '19:00'}:00${offsetStr}`).getTime();
  const fireMs = eventMs - hoursOffset * 3_600_000;
  const nowMs = now.getTime();
  return fireMs <= nowMs && nowMs < fireMs + windowMinutes * 60_000;
}
