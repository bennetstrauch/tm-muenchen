/**
 * TM München — Persönliche Veranstaltungs-Einladung per E-Mail
 * ─────────────────────────────────────────────────────────────
 * Ausführen:  node scripts/send-retreat-invite.mjs
 *
 * Nur den CONFIG-Block oben anpassen — nichts anderes anfassen.
 * Bild: Datei in /public ablegen, Dateiname unten eintragen.
 */

import { readFileSync } from "fs";
import { Resend } from "resend";

// ═══════════════════════════════════════════════════════════
//  KONFIGURATION — hier alles anpassen
// ═══════════════════════════════════════════════════════════

const CONFIG = {
  // ── Empfänger ─────────────────────────────────────────────
  // Für weibliche Namen: "Hallo liebe …,"  /  männlich: "Hallo lieber …,"
  recipients: [
    { email: "miriam.clemenz@gmail.com", salutation: "Hallo liebe Miriam," },
    {
      email: "klaus.plecher@googlemail.com",
      salutation: "Hallo lieber Klaus,",
    },
    { email: "maike.braun@meditation.de", salutation: "Hallo liebe Maike," },
  ],

  // ── E-Mail-Betreff ────────────────────────────────────────
  subject: "Tagesretreat München – 16. Mai 2026",

  // ── Einleitungstext (2–3 Absätze) ────────────────────────
  intro: [
    "Echt schön, dass du am letzten Freitag beim Centerabend mit dabei warst!",
    "Wir freuen uns, dass du an dem Tagesretreat in München interessiert bist. Es wird ein toller Tag werden, an dem man richtig runterkommen und in seinen eigenen Bliss eintauchen kann.",
  ],

  // ── Info-Box ──────────────────────────────────────────────
  event: {
    label: "Kommende Veranstaltung", // kleines Label über dem Titel
    title: "Einfach mal die Seele baumeln lassen",
    type: "1-Tages-Retreat",
    subtitle: "mit Yoga-Asanas, Pranayama und Transzendentaler Meditation",
    date: "16. Mai 2026",
    price: "65 €/P. · 50 €/P. Ehepaare · 40 €/P. Studierende",
    teachers: "Bennet und Malena",
    note: "Weitere Infos folgen", // leer lassen ("") um wegzulassen
  },

  // ── CTA-Button ────────────────────────────────────────────
  ctaText:
    "Für mehr Infos und zur offiziellen Anmeldung einfach auf den Button klicken:",
  ctaLabel: "Jetzt anmelden →",
  ctaUrl: "https://tally.so/r/xXP7Dk",

  // ── Absender (muss in Resend als Domain verifiziert sein) ─
  from: "TM München <bennet@tm-muenchen.de>",

  // ── Bild (muss in /public liegen und deployed sein) ───────
  imageUrl: "https://www.tm-muenchen.de/retreat-gruss.jpg",
  imageAlt: "TM München Center",
};

// ═══════════════════════════════════════════════════════════
//  AB HIER NICHTS ÄNDERN
// ═══════════════════════════════════════════════════════════

const envRaw = readFileSync(new URL("../.env.local", import.meta.url), "utf8");
const apiKey = envRaw.match(/^RESEND_API_KEY=(.+)$/m)?.[1]?.trim();
if (!apiKey) throw new Error("RESEND_API_KEY nicht gefunden in .env.local");

const resend = new Resend(apiKey);

function buildHtml({ salutation }) {
  const { event, intro, ctaText, ctaLabel, ctaUrl, imageUrl, imageAlt } =
    CONFIG;

  const introParagraphs = intro
    .map(
      (p) =>
        `<p style="margin:0 0 16px 0;font-size:17px;line-height:1.65;color:#1A3352;">${p}</p>`,
    )
    .join("\n              ");

  const noteRow = event.note
    ? `<p style="margin:16px 0 0 0;font-size:14px;color:#7A9BB5;font-style:italic;">${event.note}</p>`
    : "";

  return `<!DOCTYPE html>
<html lang="de">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@300;400&display=swap');
  </style>
</head>
<body style="margin:0;padding:0;background:#F2EDE4;font-family:Georgia,'Times New Roman',serif;color:#1A3352;">

  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#F2EDE4;">
    <tr>
      <td align="center" style="padding:32px 16px;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0"
               style="max-width:600px;background:#ffffff;border-radius:6px;overflow:hidden;
                      box-shadow:0 2px 12px rgba(26,51,82,0.08);">

          <!-- Header -->
          <tr>
            <td style="background:#1A3352;padding:32px 32px 28px;text-align:center;">
              <p style="margin:0 0 6px 0;font-size:18px;letter-spacing:5px;text-transform:uppercase;
                         color:#C9A84C;font-family:'Cormorant Garamond',Cormorant,Georgia,'Times New Roman',serif;
                         font-weight:400;line-height:1.3;">
                Transzendentale Meditation
              </p>
              <p style="margin:0;font-size:12px;letter-spacing:6px;text-transform:uppercase;
                         color:#C9A84C;font-family:'Cormorant Garamond',Cormorant,Georgia,'Times New Roman',serif;
                         font-weight:300;">
                · München ·
              </p>
            </td>
          </tr>

          <!-- Foto (obere 2/3) -->
          <tr>
            <td style="padding:0;line-height:0;">
              <img src="${imageUrl}" alt="${imageAlt}"
                   width="600" style="display:block;width:100%;max-width:600px;
                                      height:300px;object-fit:cover;object-position:top;" />
            </td>
          </tr>

          <!-- Haupttext -->
          <tr>
            <td style="padding:36px 36px 24px;">
              <p style="margin:0 0 20px 0;font-size:17px;line-height:1.65;color:#1A3352;">
                ${salutation}
              </p>
              ${introParagraphs}
            </td>
          </tr>

          <!-- Info-Box -->
          <tr>
            <td style="padding:0 36px 28px;">
              <table width="100%" cellpadding="0" cellspacing="0" border="0"
                     style="background:#EEF4FA;border-left:4px solid #E07B2A;border-radius:4px;">
                <tr>
                  <td style="padding:28px 28px 24px;">
                    <p style="margin:0 0 6px 0;font-size:11px;letter-spacing:3px;
                               text-transform:uppercase;color:#E07B2A;">${event.label}</p>
                    <h2 style="margin:0 0 20px 0;font-size:22px;font-weight:normal;
                                color:#1A3352;line-height:1.3;font-style:italic;">${event.title}</h2>
                    <p style="margin:0 0 12px 0;font-size:16px;font-weight:bold;color:#1A3352;">${event.type}</p>
                    <p style="margin:0 0 16px 0;font-size:15px;color:#3D5573;line-height:1.5;">${event.subtitle}</p>
                    <table cellpadding="0" cellspacing="0" border="0"
                           style="font-size:15px;line-height:1.8;color:#1A3352;">
                      <tr>
                        <td style="padding-right:12px;color:#E07B2A;font-weight:bold;white-space:nowrap;vertical-align:top;">Wann?</td>
                        <td style="font-weight:bold;">${event.date}</td>
                      </tr>
                      <tr>
                        <td style="padding-right:12px;color:#E07B2A;font-weight:bold;white-space:nowrap;vertical-align:top;">Kosten:</td>
                        <td>${event.price}</td>
                      </tr>
                      <tr>
                        <td style="padding-right:12px;color:#E07B2A;font-weight:bold;white-space:nowrap;vertical-align:top;">Leitung:</td>
                        <td>${event.teachers}</td>
                      </tr>
                    </table>
                    ${noteRow}
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- CTA -->
          <tr>
            <td style="padding:4px 36px 40px;text-align:center;">
              <p style="margin:0 0 24px 0;font-size:16px;line-height:1.65;color:#1A3352;">${ctaText}</p>
              <a href="${ctaUrl}"
                 style="display:inline-block;background:#E07B2A;color:#ffffff;
                        font-family:Georgia,serif;font-size:15px;letter-spacing:1px;
                        text-decoration:none;padding:14px 36px;border-radius:30px;">
                ${ctaLabel}
              </a>
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background:#1A3352;padding:22px 32px;">
              <p style="margin:0;font-size:15px;color:#F0EAE0;line-height:1.6;">
                TM München · Bei Fragen antworte einfach auf diese E-Mail.
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

for (const r of CONFIG.recipients) {
  const { data, error } = await resend.emails.send({
    from: CONFIG.from,
    to: r.email,
    subject: CONFIG.subject,
    html: buildHtml({ salutation: r.salutation }),
  });

  if (error) {
    console.error(`❌  ${r.email}:`, error);
  } else {
    console.log(`✅  ${r.email} — ID: ${data?.id}`);
  }
}
