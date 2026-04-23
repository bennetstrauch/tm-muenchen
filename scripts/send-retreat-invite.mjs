// One-off: Retreat-Einladung an Miriam & Klaus
// Ausführen: node scripts/send-retreat-invite.mjs
// Danach löschen.

import { readFileSync } from "fs";
import { Resend } from "resend";

// Lese RESEND_API_KEY aus .env.local
const envRaw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const apiKey = envRaw.match(/^RESEND_API_KEY=(.+)$/m)?.[1]?.trim();
if (!apiKey) throw new Error("RESEND_API_KEY nicht gefunden");

const resend = new Resend(apiKey);

const IMAGE_URL = "https://www.tm-muenchen.de/retreat-gruss.jpg";
const REGISTER_URL = "https://tally.so/r/xXP7Dk";

// ─── E-Mail HTML ──────────────────────────────────────────────────────────────

function buildHtml({ salutation }) {
  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
</head>
<body style="margin:0;padding:0;background:#F2EDE4;font-family:Georgia,'Times New Roman',serif;color:#1A3352;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F2EDE4;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0"
               style="max-width:600px;background:#ffffff;border-radius:6px;overflow:hidden;
                      box-shadow:0 2px 12px rgba(26,51,82,0.08);">

          <!-- ── Header ── -->
          <tr>
            <td style="background:#1A3352;padding:28px 32px 24px;">
              <p style="margin:0;font-size:11px;letter-spacing:4px;text-transform:uppercase;
                         color:#E07B2A;font-family:Georgia,serif;">
                Transzendentale Meditation · München
              </p>
            </td>
          </tr>

          <!-- ── Foto ── -->
          <tr>
            <td style="padding:0;line-height:0;">
              <img src="${IMAGE_URL}" alt="TM München Center"
                   width="600" style="display:block;width:100%;max-width:600px;height:auto;" />
            </td>
          </tr>

          <!-- ── Haupttext ── -->
          <tr>
            <td style="padding:36px 36px 24px;">
              <p style="margin:0 0 20px 0;font-size:17px;line-height:1.65;color:#1A3352;">
                ${salutation}
              </p>
              <p style="margin:0 0 16px 0;font-size:17px;line-height:1.65;color:#1A3352;">
                Echt schön, dass ihr am letzten Freitag beim Centerabend mit dabei wart!
                Wir freuen uns, dass ihr an dem Tagesretreat in München interessiert seid.
              </p>
              <p style="margin:0 0 28px 0;font-size:17px;line-height:1.65;color:#1A3352;">
                Es wird ein toller Tag werden, an dem man richtig runterkommen und in
                seinen eigenen Bliss eintauchen kann.
              </p>
            </td>
          </tr>

          <!-- ── Retreat-Info-Box ── -->
          <tr>
            <td style="padding:0 36px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                     style="background:#EEF4FA;border-left:4px solid #E07B2A;border-radius:4px;">
                <tr>
                  <td style="padding:28px 28px 24px;">

                    <p style="margin:0 0 6px 0;font-size:11px;letter-spacing:3px;
                               text-transform:uppercase;color:#E07B2A;">
                      Kommende Veranstaltung
                    </p>
                    <h2 style="margin:0 0 20px 0;font-size:22px;font-weight:normal;
                                color:#1A3352;line-height:1.3;font-style:italic;">
                      Einfach mal die Seele baumeln lassen
                    </h2>

                    <p style="margin:0 0 12px 0;font-size:16px;font-weight:bold;color:#1A3352;">
                      1-Tages-Retreat
                    </p>
                    <p style="margin:0 0 16px 0;font-size:15px;color:#3D5573;line-height:1.5;">
                      mit Yoga-Asanas, Pranayama und Transzendentaler Meditation
                    </p>

                    <table cellpadding="0" cellspacing="0" border="0"
                           style="font-size:15px;line-height:1.8;color:#1A3352;">
                      <tr>
                        <td style="padding-right:12px;color:#E07B2A;font-weight:bold;
                                   white-space:nowrap;vertical-align:top;">Wann?</td>
                        <td style="font-weight:bold;">16. Mai 2026</td>
                      </tr>
                      <tr>
                        <td style="padding-right:12px;color:#E07B2A;font-weight:bold;
                                   white-space:nowrap;vertical-align:top;">Kosten:</td>
                        <td>65 €/P. &nbsp;·&nbsp; 50 €/P. Ehepaare &nbsp;·&nbsp; 40 €/P. Studierende</td>
                      </tr>
                      <tr>
                        <td style="padding-right:12px;color:#E07B2A;font-weight:bold;
                                   white-space:nowrap;vertical-align:top;">Leitung:</td>
                        <td>Bennet und Malena</td>
                      </tr>
                    </table>

                    <p style="margin:16px 0 0 0;font-size:14px;color:#7A9BB5;font-style:italic;">
                      Weitere Infos folgen
                    </p>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- ── CTA ── -->
          <tr>
            <td style="padding:4px 36px 40px;text-align:center;">
              <p style="margin:0 0 24px 0;font-size:16px;line-height:1.65;color:#1A3352;">
                Für mehr Infos und zur offiziellen Anmeldung (Verteiler) einfach
                auf den Button klicken:
              </p>
              <a href="${REGISTER_URL}"
                 style="display:inline-block;background:#E07B2A;color:#ffffff;
                        font-family:Georgia,serif;font-size:15px;letter-spacing:1px;
                        text-decoration:none;padding:14px 36px;border-radius:30px;">
                Jetzt anmelden →
              </a>
            </td>
          </tr>

          <!-- ── Footer ── -->
          <tr>
            <td style="background:#1A3352;padding:20px 32px;">
              <p style="margin:0;font-size:12px;color:#7A9BB5;line-height:1.6;">
                Transzendentale Meditation München · Bei Fragen antworte einfach auf diese E-Mail.
              </p>
            </td>
          </tr>

        </table>
      </td>
    </tr>
  </table>

</body>
</html>`;
}

// ─── Senden ───────────────────────────────────────────────────────────────────

const recipients = [
  { email: "miriam.clemenz@gmail.com",    salutation: "Hallo liebe Miriam," },
  { email: "klaus.plecher@googlemail.com", salutation: "Hallo lieber Klaus," },
];

for (const r of recipients) {
  const { data, error } = await resend.emails.send({
    from: "TM München <noreply@tm-muenchen.de>",
    to: r.email,
    subject: "Tagesretreat München – 16. Mai 2026",
    html: buildHtml({ salutation: r.salutation }),
  });

  if (error) {
    console.error(`❌  ${r.email}:`, error);
  } else {
    console.log(`✅  ${r.email} — ID: ${data?.id}`);
  }
}
