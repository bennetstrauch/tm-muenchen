/**
 * One-time script: send retreat reminder to all registered participants.
 *
 * Usage:
 *   RESEND_API_KEY=re_... node scripts/send-retreat-email.mjs
 *
 * Edit the RECIPIENTS list below before running.
 * Each entry: { name, email }
 */

// ── Recipients ────────────────────────────────────────────────────────────────
// Paste the list here. Use "Vorname" if you only have a first name.

const RECIPIENTS = [
  // { name: 'Vorname', email: 'email@example.com' },
];

// ── Config ────────────────────────────────────────────────────────────────────

const FROM    = 'TM-Center München <info@tm-muenchen.de>';
const SUBJECT = 'Eintägiger Retreat – Samstag, 16. Mai 🌿';
const API_KEY = process.env.RESEND_API_KEY;

if (!API_KEY) {
  console.error('Missing RESEND_API_KEY. Run as: RESEND_API_KEY=re_... node scripts/send-retreat-email.mjs');
  process.exit(1);
}

if (RECIPIENTS.length === 0) {
  console.error('RECIPIENTS list is empty — add entries at the top of the script.');
  process.exit(1);
}

// ── Email template ────────────────────────────────────────────────────────────

function buildHtml(name) {
  const body = `
    <!-- Greeting -->
    <tr>
      <td style="padding:32px 32px 0;background:#ffffff;
                 font-family:Georgia,serif;font-size:17px;line-height:1.7;color:#555;">
        <p style="margin:0 0 24px 0;">Hallo ${name},</p>
        <p style="margin:0 0 20px 0;">
          unser Ein-Tages-Retreat findet diese Woche Samstag,
          am 16.&nbsp;Mai im TM-Center statt.
          Wir freuen uns schon sehr auf diesen Tag.
        </p>
        <p style="margin:0 0 24px 0;">
          Es wird ein Tag, an dem man so richtig abschalten, regenerieren und
          in seinen eigenen Ozean innerer Freude eintauchen kann. ✨
        </p>
      </td>
    </tr>

    <!-- Event box -->
    <tr>
      <td style="padding:0 32px 24px;background:#ffffff;">
        <div style="background:#faf8f5;border-left:3px solid #BCA075;
                    padding:20px 24px;border-radius:2px;">
          <p style="margin:0 0 6px 0;font-size:13px;color:#aaa;
                    text-transform:uppercase;letter-spacing:2px;font-family:Georgia,serif;">
            Euer Termin
          </p>
          <p style="margin:0 0 6px 0;font-size:20px;font-weight:bold;
                    color:#1A3352;font-family:Georgia,serif;">
            Eintägiger Retreat
          </p>
          <p style="margin:0 0 4px 0;font-size:16px;font-family:Georgia,serif;color:#555;">
            <strong>Samstag, 16. Mai 2026</strong>
          </p>
          <p style="margin:0 0 4px 0;font-size:15px;color:#777;font-family:Georgia,serif;">
            8:45 Uhr bis ca. 17–18 Uhr
          </p>
          <p style="margin:0;font-size:15px;color:#777;font-family:Georgia,serif;">
            Guldeinstr. 47, 80339 München
          </p>
        </div>
      </td>
    </tr>

    <!-- Details -->
    <tr>
      <td style="padding:0 32px 28px;background:#ffffff;
                 font-family:Georgia,serif;font-size:17px;line-height:1.7;color:#555;">
        <p style="margin:0 0 20px 0;">
          Bringt gerne lockere Kleidung und eine Yogamatte.
          Falls ihr keine Matte habt, gebt einfach kurz Bescheid —
          kein Problem.
        </p>
        <p style="margin:0 0 28px 0;">
          Wir freuen uns auf einen wunderbaren Tag gemeinsam mit euch.
        </p>
        <p style="margin:0 0 4px 0;">
          Bis nächste Woche,
        </p>
        <p style="margin:0;color:#BCA075;font-size:17px;">
          Marlena und Bennet
        </p>
      </td>
    </tr>

    <!-- Footer note -->
    <tr>
      <td style="padding:16px 32px 24px;background:#ffffff;
                 border-top:1px solid #f0f0f0;">
        <p style="margin:0;font-size:13px;color:#bbb;font-family:Georgia,serif;line-height:1.6;">
          Falls sich etwas ändert oder etwas dazwischen kommt,
          gebt bitte kurz Bescheid — wir sind gerne für euch da.
        </p>
      </td>
    </tr>`;

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>${SUBJECT}</title>
</head>
<body style="margin:0;padding:0;background:#f3f3f3;font-family:Georgia,serif;color:#555555;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f3f3f3;">
    <tr>
      <td align="center" style="padding:20px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0"
          style="max-width:640px;background:#ffffff;">

          <!-- Header -->
          <tr>
            <td style="padding:24px 32px 0;background:#ffffff;">
              <p style="margin:0;font-size:13px;letter-spacing:3px;text-transform:uppercase;
                         color:#BCA075;font-family:Georgia,serif;">
                Transzendentale Meditation · München
              </p>
            </td>
          </tr>

          ${body}

        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}

// ── Send ──────────────────────────────────────────────────────────────────────

let sent = 0;
let failed = 0;

for (const { name, email } of RECIPIENTS) {
  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: FROM,
      to: [email],
      subject: SUBJECT,
      html: buildHtml(name),
    }),
  });

  if (res.ok) {
    console.log(`✓ Sent to ${name} <${email}>`);
    sent++;
  } else {
    const err = await res.json().catch(() => ({}));
    console.error(`✗ Failed for ${name} <${email}>:`, err.message ?? res.status);
    failed++;
  }

  // Brief pause to stay within rate limits
  await new Promise(r => setTimeout(r, 200));
}

console.log(`\nDone: ${sent} sent, ${failed} failed.`);
