/**
 * One-time setup: creates the "E-Mail Aktionen" tab in the Google Sheet
 * with the correct header row.
 *
 * Usage:
 *   node scripts/setup-email-actions-tab.mjs
 *
 * Safe to run multiple times — skips if the tab already exists.
 */

import { readFileSync } from 'fs';
import { google } from 'googleapis';

// ── Load env ──────────────────────────────────────────────────────────────────

const env = readFileSync(new URL('../.env.local', import.meta.url), 'utf8');
function getEnv(key) {
  const match = env.match(new RegExp(`^${key}=(.+)$`, 'm'));
  if (!match) throw new Error(`Missing ${key} in .env.local`);
  return match[1].trim();
}

const SPREADSHEET_ID = getEnv('GOOGLE_SHEET_ID');
const TAB_NAME = 'E-Mail Aktionen';

const HEADER = [
  'id',
  'eventId',
  'eventTitle',
  'type',
  'subject',
  'body',
  'scheduledAt',
  'sentAt',
  'status',
  'recipientCount',
  'errorMessage',
  'createdBy',
];

// ── Auth ──────────────────────────────────────────────────────────────────────

const creds = JSON.parse(getEnv('GOOGLE_SERVICE_ACCOUNT_JSON'));

const auth = new google.auth.GoogleAuth({
  credentials: creds,
  scopes: ['https://www.googleapis.com/auth/spreadsheets'],
});

const sheets = google.sheets({ version: 'v4', auth });

// ── Check if tab already exists ───────────────────────────────────────────────

const meta = await sheets.spreadsheets.get({
  spreadsheetId: SPREADSHEET_ID,
  fields: 'sheets.properties',
});

const existing = meta.data.sheets?.find(s => s.properties?.title === TAB_NAME);

if (existing) {
  console.log(`✓ Tab "${TAB_NAME}" already exists — nothing to do.`);
  process.exit(0);
}

// ── Create tab ────────────────────────────────────────────────────────────────

await sheets.spreadsheets.batchUpdate({
  spreadsheetId: SPREADSHEET_ID,
  requestBody: {
    requests: [{ addSheet: { properties: { title: TAB_NAME } } }],
  },
});

console.log(`✓ Created tab "${TAB_NAME}"`);

// ── Write header row ──────────────────────────────────────────────────────────

await sheets.spreadsheets.values.update({
  spreadsheetId: SPREADSHEET_ID,
  range: `${TAB_NAME}!A1`,
  valueInputOption: 'RAW',
  requestBody: { values: [HEADER] },
});

console.log(`✓ Header row written: ${HEADER.join(' | ')}`);
console.log('\nDone. The E-Mail Aktionen tab is ready.');
