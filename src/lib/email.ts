export type RegistrationEmailParams = {
  name: string;
  email: string;
  phone?: string;
  eventDate: string;    // "11. April 2026"
  eventTime: string;    // "19:00"
  eventType: "Online" | "Präsenz";
  meetLink?: string;
  locale?: string;
  centerName?: string;
  teacher: {
    name: string;
    email: string;
    phone: string;
    imageUrl: string;
    bio: string;
  } | null;
};

type EmailStrings = {
  confirmationSubject: (date: string, time: string, isOnline: boolean) => string;
  reminderSubject: (time: string, isOnline: boolean) => string;
  headerBrand: string;
  greeting: (name: string) => string;
  registrationConfirmed: (date: string, time: string, isOnline: boolean) => string;
  joinButtonLabel: (isOnline: boolean) => string;
  tmIntro: string;
  benefits: [string, string, string];
  agendaHeading: string;
  agendaItems: [string, string, string];
  footerDisclaimer: string;
  teacherHeading: string;
  reminderIntro: (isOnline: boolean) => string;
  yourAppointment: string;
  reservedFor: string;
  infoabendDescription: string;
  questionsText: string;
  signoff: string;
  cancellationNote: (teacherName: string, email: string, phone: string) => string;
  fallbackCancellation: string;
  linkFallback: string;
};

const STRINGS: Record<string, EmailStrings> = {
  de: {
    confirmationSubject: (date, time, isOnline) =>
      `Bestätigung: TM-${isOnline ? "Online-" : ""}Infoabend am ${date} um ${time} Uhr`,
    reminderSubject: (time, isOnline) =>
      `Erinnerung: Morgen um ${time} Uhr findet Ihr TM-${isOnline ? "Online-" : ""}Infoabend statt`,
    headerBrand: "Transzendentale Meditation",
    greeting: (name) => `Hallo ${name},`,
    registrationConfirmed: (date, time, isOnline) =>
      `Sie haben sich erfolgreich zum ${isOnline ? "Online-" : ""}Infoabend über Transzendentale Meditation (TM) am <strong>${date} um ${time} Uhr</strong> angemeldet.`,
    joinButtonLabel: (isOnline) => `Zum ${isOnline ? "Online-" : ""}Vortrag`,
    tmIntro: "TM ist eine einfache, wirkungsvolle Technik, mit deren Hilfe es Ihnen auf ganz bequeme Weise gelingt,",
    benefits: [
      "in wenigen Minuten komplett herunterzufahren und tiefe, erholsame Ruhe zu erfahren,",
      "Ihren Energie- und Glücks-Akku aufzuladen,",
      "Ihren Kopf wieder klarzubekommen für zielgerichtetes Handeln, größeren Erfolg und mehr Lebensqualität.",
    ],
    agendaHeading: "Dies erwartet Sie im Infoabend:",
    agendaItems: [
      "Ein Überblick: was ist TM, woher kommt sie, was bringt sie",
      "Was ist einzigartig an der TM — wie unterscheidet sie sich von anderen Methoden",
      "Wie einfach sie funktioniert und wie man sie erlernt",
    ],
    footerDisclaimer: "Bitte beachten Sie: Dies ist eine automatisch erstellte Nachricht. Bei Fragen wenden Sie sich bitte direkt an den vortragenden Lehrer.",
    teacherHeading: "Ihr Lehrer für Transzendentale Meditation",
    reminderIntro: (isOnline) =>
      `vielen Dank für Ihre Anmeldung zu dem einführenden ${isOnline ? "Online-" : ""}Infoabend über Transzendentale Meditation — wir möchten Sie daran erinnern.`,
    yourAppointment: "Ihr Termin",
    reservedFor: "Platz reserviert für:",
    infoabendDescription: "Der kostenlose Infoabend ist die Grundlage für das Erlernen der Transzendentalen Meditation.",
    questionsText: "Auch wenn Sie jetzt schon Fragen zu besonderen Schwerpunkten haben, können Sie dies dem Vortragenden mitteilen — z.B. TM und Stressabbau, TM und Herzkreislaufgesundheit, oder warum sich TM von anderen Meditationstechniken unterscheidet.",
    signoff: "Mit freundlichen Grüßen,",
    cancellationNote: (teacherName, email, phone) =>
      `Bei kurzfristiger Verhinderung oder Fragen wenden Sie sich bitte direkt an ${teacherName}:<br><a href="mailto:${email}" style="color:#BCA075;">${email}</a>&nbsp;·&nbsp; ${phone}`,
    fallbackCancellation: "Sollten Sie kurzfristig verhindert sein, bitten wir um Absage direkt beim Referenten.",
    linkFallback: "Falls der Button nicht funktioniert, kopieren Sie diesen Link:",
  },
  en: {
    confirmationSubject: (date, time, isOnline) =>
      `Confirmation: TM Info${isOnline ? " Online" : ""} Session on ${date} at ${time}`,
    reminderSubject: (time, isOnline) =>
      `Reminder: Your TM Info${isOnline ? " Online" : ""} Session is tomorrow at ${time}`,
    headerBrand: "Transcendental Meditation",
    greeting: (name) => `Hello ${name},`,
    registrationConfirmed: (date, time, isOnline) =>
      `You have successfully registered for the ${isOnline ? "online " : ""}Transcendental Meditation (TM) info session on <strong>${date} at ${time}</strong>.`,
    joinButtonLabel: () => "Join Session",
    tmIntro: "TM is a simple, effortless technique that allows you to:",
    benefits: [
      "fully unwind in minutes and experience deep, restful calm,",
      "recharge your energy and well-being,",
      "clear your mind for focused action, greater success, and better quality of life.",
    ],
    agendaHeading: "What to expect at the info session:",
    agendaItems: [
      "An overview: what TM is, where it comes from, and what it does",
      "What makes TM unique — how it differs from other techniques",
      "How simple it is and how it is learned",
    ],
    footerDisclaimer: "This is an automated message. For questions, please contact the presenting teacher directly.",
    teacherHeading: "Your Transcendental Meditation Teacher",
    reminderIntro: (isOnline) =>
      `Thank you for registering for the ${isOnline ? "online " : ""}Transcendental Meditation info session — this is your friendly reminder.`,
    yourAppointment: "Your Appointment",
    reservedFor: "Seat reserved for:",
    infoabendDescription: "The free info session is the first step toward learning Transcendental Meditation.",
    questionsText: "If you already have questions about specific topics — such as TM and stress reduction, TM and cardiovascular health, or how TM differs from other meditation techniques — feel free to mention them to the presenter.",
    signoff: "Kind regards,",
    cancellationNote: (teacherName, email, phone) =>
      `If you need to cancel or have questions, please contact ${teacherName} directly:<br><a href="mailto:${email}" style="color:#BCA075;">${email}</a>&nbsp;·&nbsp; ${phone}`,
    fallbackCancellation: "If you need to cancel, please notify the presenter directly.",
    linkFallback: "If the button doesn't work, copy this link:",
  },
  fr: {
    confirmationSubject: (date, time, isOnline) =>
      `Confirmation : Soirée d'info TM${isOnline ? " en ligne" : ""} le ${date} à ${time}`,
    reminderSubject: (time, isOnline) =>
      `Rappel : Votre soirée d'info TM${isOnline ? " en ligne" : ""} est demain à ${time}`,
    headerBrand: "Méditation Transcendantale",
    greeting: (name) => `Bonjour ${name},`,
    registrationConfirmed: (date, time, isOnline) =>
      `Tu t'es inscrit(e) avec succès à la soirée d'information${isOnline ? " en ligne" : ""} sur la Méditation Transcendantale (MT) le <strong>${date} à ${time}</strong>.`,
    joinButtonLabel: () => "Rejoindre la séance",
    tmIntro: "La MT est une technique simple et sans effort qui te permet de :",
    benefits: [
      "décompresser complètement en quelques minutes et ressentir un repos profond et réparateur,",
      "recharger ton énergie et ton bien-être,",
      "clarifier ton esprit pour agir avec intention, plus de succès et une meilleure qualité de vie.",
    ],
    agendaHeading: "Ce qui t'attend à la soirée :",
    agendaItems: [
      "Un aperçu : qu'est-ce que la MT, d'où vient-elle, à quoi sert-elle",
      "Ce qui rend la MT unique — en quoi elle diffère des autres techniques",
      "À quel point elle est simple et comment elle s'apprend",
    ],
    footerDisclaimer: "Ceci est un message automatique. Pour toute question, contacte directement l'enseignant(e).",
    teacherHeading: "Ton enseignant(e) de Méditation Transcendantale",
    reminderIntro: (isOnline) =>
      `Merci de t'être inscrit(e) à la soirée d'information${isOnline ? " en ligne" : ""} sur la Méditation Transcendantale — voici ton rappel.`,
    yourAppointment: "Ton rendez-vous",
    reservedFor: "Place réservée pour :",
    infoabendDescription: "La soirée d'info gratuite est la première étape pour apprendre la Méditation Transcendantale.",
    questionsText: "Si tu as déjà des questions sur des sujets particuliers — comme la MT et la réduction du stress, la MT et la santé cardiovasculaire, ou en quoi la MT diffère des autres techniques — n'hésite pas à en parler à l'enseignant(e).",
    signoff: "Cordialement,",
    cancellationNote: (teacherName, email, phone) =>
      `En cas d'annulation ou de questions, contacte ${teacherName} directement :<br><a href="mailto:${email}" style="color:#BCA075;">${email}</a>&nbsp;·&nbsp; ${phone}`,
    fallbackCancellation: "Si tu dois annuler, merci de prévenir l'enseignant(e) directement.",
    linkFallback: "Si le bouton ne fonctionne pas, copie ce lien :",
  },
  es: {
    confirmationSubject: (date, time, isOnline) =>
      `Confirmación: Sesión informativa TM${isOnline ? " online" : ""} el ${date} a las ${time}`,
    reminderSubject: (time, isOnline) =>
      `Recordatorio: Tu sesión informativa TM${isOnline ? " online" : ""} es mañana a las ${time}`,
    headerBrand: "Meditación Trascendental",
    greeting: (name) => `Hola ${name},`,
    registrationConfirmed: (date, time, isOnline) =>
      `Te has inscrito con éxito a la sesión informativa${isOnline ? " online" : ""} sobre Meditación Trascendental (MT) el <strong>${date} a las ${time}</strong>.`,
    joinButtonLabel: () => "Unirse a la sesión",
    tmIntro: "La MT es una técnica sencilla y sin esfuerzo que te permite:",
    benefits: [
      "desconectar por completo en minutos y experimentar un descanso profundo y reparador,",
      "recargar tu energía y bienestar,",
      "despejar tu mente para actuar con propósito, mayor éxito y mejor calidad de vida.",
    ],
    agendaHeading: "Lo que puedes esperar en la sesión:",
    agendaItems: [
      "Una visión general: qué es la MT, de dónde viene y qué aporta",
      "Qué hace única a la MT — en qué se diferencia de otras técnicas",
      "Lo sencilla que es y cómo se aprende",
    ],
    footerDisclaimer: "Este es un mensaje automático. Para cualquier pregunta, contacta directamente con el/la profesor/a.",
    teacherHeading: "Tu profesor/a de Meditación Trascendental",
    reminderIntro: (isOnline) =>
      `Gracias por inscribirte a la sesión informativa${isOnline ? " online" : ""} sobre Meditación Trascendental — este es tu recordatorio.`,
    yourAppointment: "Tu cita",
    reservedFor: "Plaza reservada para:",
    infoabendDescription: "La sesión informativa gratuita es el primer paso para aprender Meditación Trascendental.",
    questionsText: "Si ya tienes preguntas sobre temas concretos — como la MT y la reducción del estrés, la MT y la salud cardiovascular, o en qué se diferencia la MT de otras técnicas de meditación — coméntaselas al/a la profesor/a.",
    signoff: "Un saludo cordial,",
    cancellationNote: (teacherName, email, phone) =>
      `Si necesitas cancelar o tienes preguntas, contacta directamente con ${teacherName}:<br><a href="mailto:${email}" style="color:#BCA075;">${email}</a>&nbsp;·&nbsp; ${phone}`,
    fallbackCancellation: "Si necesitas cancelar, avisa directamente al/a la profesor/a.",
    linkFallback: "Si el botón no funciona, copia este enlace:",
  },
};

function strings(locale = "de"): EmailStrings {
  return STRINGS[locale] ?? STRINGS.de;
}

export function buildConfirmationSubject(date: string, time: string, isOnline: boolean, locale = "de"): string {
  return strings(locale).confirmationSubject(date, time, isOnline);
}

export function buildReminderSubject(time: string, isOnline: boolean, locale = "de"): string {
  return strings(locale).reminderSubject(time, isOnline);
}

// ── Shared pieces ─────────────────────────────────────────

export function emailWrapper(title: string, body: string, headerBrand: string): string {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width">
  <title>${title}</title>
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
                         color:#BCA075;">${headerBrand}</p>
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

function teacherBlock(teacher: NonNullable<RegistrationEmailParams["teacher"]>, locale = "de"): string {
  const s = strings(locale);
  return `
    <div style="background:#FCF5F0;padding:30px 20px;">
      <p style="text-align:center;font-size:20px;font-weight:bold;color:#555;
                font-family:Georgia,serif;margin:0 0 20px 0;">
        ${s.teacherHeading}
      </p>
      <table width="100%" cellpadding="0" cellspacing="0" border="0">
        <tr>
          <td width="180" valign="top" style="padding:0 20px 0 0;">
            <img src="${teacher.imageUrl}" alt="${teacher.name}" width="160"
              style="display:block;border-radius:4px;max-width:160px;height:auto;" />
          </td>
          <td valign="top" style="font-family:Georgia,serif;font-size:15px;color:#555;line-height:1.5;">
            <p style="font-weight:bold;font-size:17px;margin:0 0 10px 0;">${teacher.name}</p>
            <p style="margin:0 0 14px 0;">${teacher.bio}</p>
            <p style="margin:0 0 4px 0;"><strong>E-Mail:</strong>
              <a href="mailto:${teacher.email}" style="color:#BCA075;">${teacher.email}</a>
            </p>
            <p style="margin:0;"><strong>Telefon:</strong> ${teacher.phone}</p>
          </td>
        </tr>
      </table>
    </div>`;
}

function footerBlock(locale = "de"): string {
  return `
    <tr>
      <td style="padding:20px;background:#ffffff;font-size:13px;color:#aaa;
                 border-top:1px solid #eee;line-height:1.6;">
        <p style="margin:0;">${strings(locale).footerDisclaimer}</p>
      </td>
    </tr>`;
}

// ── Confirmation email ────────────────────────────────────

export function buildConfirmationHtml(p: RegistrationEmailParams): string {
  const isOnline = p.eventType === "Online";
  const s = strings(p.locale);
  const headerBrand = p.centerName ? `${s.headerBrand} · ${p.centerName}` : s.headerBrand;

  const meetSection = isOnline && p.meetLink ? `
    <div style="text-align:center;margin:20px 0;">
      <a href="${p.meetLink}"
        style="display:inline-block;background:#BCA075;color:#ffffff;font-family:Georgia,serif;
               font-size:16px;text-decoration:none;padding:12px 32px;border-radius:20px;">
        ${s.joinButtonLabel(isOnline)}
      </a>
    </div>
    <p style="margin:0 0 20px 0;font-size:14px;color:#aaa;word-break:break-all;">
      ${p.meetLink}
    </p>` : "";

  const body = `
    <tr>
      <td style="padding:20px;background:#ffffff;font-size:16px;line-height:1.6;">
        <p style="margin:0 0 12px 0;">${s.greeting(p.name)}</p>
        <p style="margin:0 0 20px 0;">${s.registrationConfirmed(p.eventDate, p.eventTime, isOnline)}</p>
        ${meetSection}
        <p style="font-size:18px;color:#BCA075;margin:24px 0 8px 0;line-height:1.4;">
          ${s.tmIntro}
        </p>
        <ul style="padding-left:20px;margin:0 0 20px 0;line-height:1.8;">
          ${s.benefits.map(b => `<li>${b}</li>`).join("")}
        </ul>
        <p style="margin:0 0 8px 0;">${s.agendaHeading}</p>
        <ul style="padding-left:20px;margin:0 0 8px 0;line-height:1.8;">
          ${s.agendaItems.map(a => `<li>${a}</li>`).join("")}
        </ul>
      </td>
    </tr>
    <tr><td>${p.teacher ? teacherBlock(p.teacher, p.locale) : ""}</td></tr>
    <tr>
      <td style="padding:20px;background:#ffffff;font-size:14px;color:#999;line-height:1.6;">
        <p style="margin:0 0 8px 0;">${s.infoabendDescription}</p>
      </td>
    </tr>
    ${footerBlock(p.locale)}`;

  return emailWrapper(s.confirmationSubject(p.eventDate, p.eventTime, isOnline), body, headerBrand);
}

// ── Reminder email ────────────────────────────────────────

export function buildReminderHtml(p: RegistrationEmailParams): string {
  const isOnline = p.eventType === "Online";
  const s = strings(p.locale);
  const headerBrand = p.centerName ? `${s.headerBrand} · ${p.centerName}` : s.headerBrand;

  const meetSection = isOnline && p.meetLink ? `
    <div style="text-align:center;margin:24px 0 16px;">
      <a href="${p.meetLink}"
        style="display:inline-block;background:#BCA075;color:#ffffff;font-family:Georgia,serif;
               font-size:16px;text-decoration:none;padding:12px 32px;border-radius:20px;">
        ${s.joinButtonLabel(isOnline)}
      </a>
    </div>
    <p style="margin:0 0 4px 0;font-size:14px;color:#999;">${s.linkFallback}</p>
    <p style="margin:0 0 20px 0;font-size:14px;color:#aaa;word-break:break-all;">
      ${p.meetLink}
    </p>` : "";

  const teacherContact = p.teacher ? `
    <p style="margin:16px 0 0;font-size:15px;line-height:1.6;">
      ${s.cancellationNote(p.teacher.name, p.teacher.email, p.teacher.phone)}
    </p>` : `
    <p style="margin:16px 0 0;font-size:15px;color:#999;">${s.fallbackCancellation}</p>`;

  const body = `
    <tr>
      <td style="padding:20px;background:#ffffff;font-size:16px;line-height:1.6;">
        <p style="margin:0 0 16px 0;">${s.greeting(p.name)}</p>
        <p style="margin:0 0 16px 0;">${s.reminderIntro(isOnline)}</p>

        <div style="background:#faf8f5;border-left:3px solid #BCA075;
                    padding:16px 20px;margin:0 0 24px;border-radius:2px;">
          <p style="margin:0 0 6px 0;font-size:14px;color:#aaa;
                    text-transform:uppercase;letter-spacing:2px;">${s.yourAppointment}</p>
          <p style="margin:0 0 4px 0;font-size:17px;">
            <strong>${p.eventDate} · ${p.eventTime}</strong>
          </p>
          <p style="margin:0;font-size:15px;color:#888;">${s.reservedFor} ${p.name}</p>
        </div>

        ${meetSection}

        <p style="margin:0 0 12px 0;font-size:15px;line-height:1.7;color:#777;">
          ${s.infoabendDescription}
        </p>
        <p style="margin:0 0 12px 0;font-size:15px;line-height:1.7;color:#777;">
          ${s.questionsText}
        </p>
        ${teacherContact}
        <p style="margin:24px 0 0;font-size:16px;">
          ${s.signoff}<br>
          <span style="color:#BCA075;">${headerBrand}</span>
        </p>
      </td>
    </tr>
    <tr><td>${p.teacher ? teacherBlock(p.teacher, p.locale) : ""}</td></tr>
    ${footerBlock(p.locale)}`;

  return emailWrapper(s.reminderSubject(p.eventTime, isOnline), body, headerBrand);
}

// ── Teacher notification email ────────────────────────────

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
          ${isOnline ? "Online-" : ""}Infoabend · ${p.eventDate} um ${p.eventTime} Uhr
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
