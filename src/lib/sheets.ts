import { google } from 'googleapis';

const SHEET_ID = process.env.GOOGLE_SHEET_ID!;
// First tab of the spreadsheet — rename it to "Infoanmeldungen" in Google Sheets
const RANGE = 'A:G';

function getSheets() {
  const creds = JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_JSON!);
  const auth = new google.auth.GoogleAuth({
    credentials: creds,
    scopes: ['https://www.googleapis.com/auth/spreadsheets'],
  });
  return google.sheets({ version: 'v4', auth });
}

export type Registration = {
  timestamp: string;
  name: string;
  email: string;
  phone: string;
  eventDate: string;
  eventTime: string;
  eventType: string;
};

export async function appendRegistration(r: Omit<Registration, 'timestamp'>) {
  const sheets = getSheets();
  await sheets.spreadsheets.values.append({
    spreadsheetId: SHEET_ID,
    range: RANGE,
    valueInputOption: 'USER_ENTERED',
    requestBody: {
      values: [[
        new Date().toLocaleString('de-DE', { timeZone: 'Europe/Berlin' }),
        r.name,
        r.email,
        r.phone ?? '',
        r.eventDate,
        r.eventTime,
        r.eventType,
      ]],
    },
  });
}

export async function getRegistrations(): Promise<Registration[]> {
  const sheets = getSheets();
  const res = await sheets.spreadsheets.values.get({
    spreadsheetId: SHEET_ID,
    range: RANGE,
  });
  const rows = res.data.values ?? [];
  return rows
    .filter(row => row.length >= 2 && row[0] !== 'Timestamp')
    .map(row => ({
      timestamp: row[0] ?? '',
      name: row[1] ?? '',
      email: row[2] ?? '',
      phone: row[3] ?? '',
      eventDate: row[4] ?? '',
      eventTime: row[5] ?? '',
      eventType: row[6] ?? '',
    }))
    .reverse();
}
