export type RegistrationEmailParams = {
  name: string;
  email: string;
  phone?: string;
  eventDate: string;    // "11. April 2026"
  eventTime: string;    // "19:00"
  eventType: "Online" | "Präsenz";
  meetLink?: string;
  teacher: {
    name: string;
    email: string;
    phone: string;
    imageUrl: string;
    bio: string;
  } | null;
};

export function buildConfirmationHtml(p: RegistrationEmailParams): string {
  const isOnline = p.eventType === "Online";
  const subject = isOnline
    ? `Online-Infovortrag am ${p.eventDate} um ${p.eventTime}`
    : `Infovortrag am ${p.eventDate} um ${p.eventTime}`;

  const meetSection = isOnline && p.meetLink ? `
    <p style="margin:0 0 8px 0;">Über diesen Link können Sie teilnehmen:</p>
    <p style="margin:0 0 20px 0;">
      <a href="${p.meetLink}" style="color:#BCA075;">${p.meetLink}</a>
    </p>
    <div style="text-align:center;margin:20px 0;">
      <a href="${p.meetLink}"
        style="display:inline-block;background:#BCA075;color:#ffffff;font-family:Georgia,serif;
               font-size:16px;text-decoration:none;padding:10px 30px;border-radius:3px;">
        Zum Online-Vortrag
      </a>
    </div>
  ` : "";

  const teacherSection = p.teacher ? `
    <div style="background:#FCF5F0;padding:30px 20px;">
      <p style="text-align:center;font-size:20px;font-weight:bold;color:#555;
                font-family:Georgia,serif;margin:0 0 20px 0;">
        Ihr Lehrer für Transzendentale Meditation
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="200" valign="top" style="padding:0 20px 0 0;">
            <img src="${p.teacher.imageUrl}"
              alt="${p.teacher.name}"
              width="180"
              style="display:block;border-radius:4px;max-width:180px;height:auto;" />
          </td>
          <td valign="top" style="font-family:Georgia,serif;font-size:16px;color:#555;">
            <p style="font-weight:bold;font-size:18px;margin:0 0 12px 0;">${p.teacher.name}</p>
            <p style="margin:0 0 16px 0;line-height:1.5;">${p.teacher.bio}</p>
            <p style="margin:0 0 4px 0;"><strong>E-Mail:</strong>
              <a href="mailto:${p.teacher.email}" style="color:#BCA075;">${p.teacher.email}</a>
            </p>
            <p style="margin:0;"><strong>Telefon:</strong> ${p.teacher.phone}</p>
          </td>
        </tr>
      </table>
    </div>
  ` : "";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>Bestätigung: TM-${subject}</title>
</head>
<body style="margin:0;padding:0;background:#f3f3f3;font-family:Georgia,serif;color:#555555;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="background:#f3f3f3;">
    <tr>
      <td align="center" style="padding:20px 0;">
        <table width="100%" cellpadding="0" cellspacing="0" border="0"
          style="max-width:640px;background:#ffffff;">

          <!-- Header -->
          <tr>
            <td style="padding:24px 20px 0;background:#ffffff;">
              <p style="margin:0;font-size:13px;letter-spacing:3px;text-transform:uppercase;
                         color:#BCA075;">Transzendentale Meditation · München</p>
            </td>
          </tr>

          <!-- Confirmation -->
          <tr>
            <td style="padding:20px;background:#ffffff;font-size:16px;line-height:1.6;">
              <p style="margin:0 0 12px 0;">Hallo ${p.name},</p>
              <p style="margin:0 0 20px 0;">
                Sie haben sich erfolgreich zum ${isOnline ? "Online-" : ""}Infovortrag über
                Transzendentale Meditation (TM) am <strong>${p.eventDate} um ${p.eventTime}</strong>
                angemeldet.
              </p>
              ${meetSection}
              <p style="font-size:20px;color:#BCA075;margin:24px 0 8px 0;">
                TM ist eine einfache, wirkungsvolle Technik, mit deren Hilfe es Ihnen
                auf ganz bequeme Weise gelingt,
              </p>
              <ul style="padding-left:20px;margin:0 0 20px 0;line-height:1.8;">
                <li>in wenigen Minuten komplett herunterzufahren und tiefe, erholsame Ruhe zu erfahren,</li>
                <li>Ihren Energie- und Glücks-Akku aufzuladen,</li>
                <li>Ihren Kopf wieder klarzubekommen für zielgerichtetes Handeln,
                    größeren Erfolg und mehr Lebensqualität.</li>
              </ul>
              <p style="margin:0 0 8px 0;">Dies erwartet Sie im Vortrag:</p>
              <ul style="padding-left:20px;margin:0 0 20px 0;line-height:1.8;">
                <li>Ein Überblick: was ist TM, woher kommt sie, was bringt sie</li>
                <li>Was ist einzigartig an der TM, wie unterscheidet sie sich von anderen Methoden</li>
                <li>Wie einfach sie funktioniert und wie man sie erlernt</li>
              </ul>
            </td>
          </tr>

          <!-- Teacher -->
          <tr><td>${teacherSection}</td></tr>

          <!-- Footer -->
          <tr>
            <td style="padding:20px;background:#ffffff;font-size:13px;color:#999;
                       border-top:1px solid #eee;line-height:1.6;">
              <p style="margin:0 0 8px 0;">
                Der kostenlose Informationsvortrag ist die Grundlage für das Erlernen der
                Transzendentalen Meditation.
                Sollten Sie kurzfristig verhindert sein, bitten wir um Terminänderungswunsch
                oder Absage direkt bei dem Referenten.
              </p>
              <p style="margin:0;">
                Bitte beachten Sie: Dies ist eine automatisch erstellte Nachricht.
                Bei Fragen wenden Sie sich bitte direkt an den vortragenden Lehrer für
                Transzendentale Meditation.
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

export function buildTeacherNotificationHtml(p: RegistrationEmailParams): string {
  const isOnline = p.eventType === "Online";
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Neue Anmeldung</title></head>
<body style="margin:0;padding:20px;font-family:Georgia,serif;color:#555;background:#f3f3f3;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:540px;">
    <tr>
      <td style="background:#ffffff;padding:24px;border-radius:4px;">
        <p style="margin:0 0 4px 0;font-size:13px;letter-spacing:3px;
                   text-transform:uppercase;color:#BCA075;">Neue Anmeldung</p>
        <h2 style="margin:0 0 20px 0;font-size:20px;">
          ${isOnline ? "Online-" : ""}Infovortrag · ${p.eventDate} um ${p.eventTime}
        </h2>
        <table cellpadding="6" cellspacing="0" border="0"
          style="font-size:16px;line-height:1.5;width:100%;">
          <tr>
            <td style="color:#999;white-space:nowrap;padding-right:16px;">Name</td>
            <td><strong>${p.name}</strong></td>
          </tr>
          <tr>
            <td style="color:#999;">E-Mail</td>
            <td><a href="mailto:${p.email}" style="color:#BCA075;">${p.email}</a></td>
          </tr>
          ${p.phone ? `
          <tr>
            <td style="color:#999;">Telefon</td>
            <td>${p.phone}</td>
          </tr>` : ""}
        </table>
        ${isOnline && p.meetLink ? `
        <p style="margin:20px 0 0;font-size:14px;color:#999;">
          Meet-Link: <a href="${p.meetLink}" style="color:#BCA075;">${p.meetLink}</a>
        </p>` : ""}
      </td>
    </tr>
  </table>
</body>
</html>`;
}
