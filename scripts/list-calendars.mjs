import { google } from 'googleapis';

const auth = new google.auth.OAuth2(
  process.env.GOOGLE_OAUTH_CLIENT_ID,
  process.env.GOOGLE_OAUTH_CLIENT_SECRET,
);
auth.setCredentials({ refresh_token: process.env.GOOGLE_OAUTH_REFRESH_TOKEN });

const cal = google.calendar({ version: 'v3', auth });
const res = await cal.calendarList.list();

console.log('\nCalendars accessible to this account:\n');
for (const c of res.data.items ?? []) {
  console.log(`  ID:    ${c.id}`);
  console.log(`  Name:  ${c.summary}`);
  console.log(`  Role:  ${c.accessRole}`);
  console.log();
}
