/**
 * One-time script to obtain a Google OAuth2 refresh token for Calendar access.
 *
 * Usage:
 *   GOOGLE_OAUTH_CLIENT_ID=xxx GOOGLE_OAUTH_CLIENT_SECRET=yyy node scripts/get-calendar-token.mjs
 *
 * Log in as ngcmuc@yahoo.de when the browser opens.
 * The refresh token is printed at the end — add it to .env.local and Vercel.
 */

import { google } from 'googleapis';
import http from 'http';
import { URL } from 'url';

const CLIENT_ID = process.env.GOOGLE_OAUTH_CLIENT_ID;
const CLIENT_SECRET = process.env.GOOGLE_OAUTH_CLIENT_SECRET;
const PORT = 3333;
const REDIRECT_URI = `http://localhost:${PORT}/callback`;

if (!CLIENT_ID || !CLIENT_SECRET) {
  console.error('Missing env vars. Run as:');
  console.error('  GOOGLE_OAUTH_CLIENT_ID=xxx GOOGLE_OAUTH_CLIENT_SECRET=yyy node scripts/get-calendar-token.mjs');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(CLIENT_ID, CLIENT_SECRET, REDIRECT_URI);

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  prompt: 'consent',
  scope: ['https://www.googleapis.com/auth/calendar.events'],
});

console.log('\nOpen this URL in your browser and log in as ngcmuc@yahoo.de:\n');
console.log(authUrl);
console.log('\nWaiting for callback...\n');

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://localhost:${PORT}`);
  const code = url.searchParams.get('code');
  const error = url.searchParams.get('error');

  if (error) {
    res.end(`<h1>Error: ${error}</h1>`);
    server.close();
    process.exit(1);
  }

  if (!code) {
    res.end('<h1>No code received.</h1>');
    return;
  }

  res.end('<h1>Done! You can close this tab and return to the terminal.</h1>');
  server.close();

  const { tokens } = await oauth2Client.getToken(code);

  console.log('Add these to .env.local and to Vercel environment variables:\n');
  console.log(`GOOGLE_OAUTH_CLIENT_ID=${CLIENT_ID}`);
  console.log(`GOOGLE_OAUTH_CLIENT_SECRET=${CLIENT_SECRET}`);
  console.log(`GOOGLE_OAUTH_REFRESH_TOKEN=${tokens.refresh_token}`);
});

server.listen(PORT);
