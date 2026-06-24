import { emailWrapper } from './email';

type InfoAnfrageEmailStrings = {
  userSubject: string;
  userGreeting: (name: string) => string;
  userBody: string;
  userSignoff: (cityName: string) => string;
};

const USER_STRINGS: Record<string, InfoAnfrageEmailStrings> = {
  de: {
    userSubject: 'Deine Anfrage für einen individuellen TM-Termin',
    userGreeting: (name) => `Hallo ${name},`,
    userBody: 'vielen Dank für deine Anfrage! Wir freuen uns, von dir zu hören, und melden uns in Kürze bei dir, um gemeinsam einen Termin zu finden, der für dich passt.\n\nBis bald – wir freuen uns auf das Gespräch mit dir.',
    userSignoff: (city) => `Herzliche Grüße,\nDein TM-Team ${city}`,
  },
  en: {
    userSubject: 'Your request for a personal TM appointment',
    userGreeting: (name) => `Hello ${name},`,
    userBody: "Thank you so much for reaching out! We're really glad you did, and we'll be in touch very soon to find a time that works for you.\n\nLooking forward to connecting with you.",
    userSignoff: (city) => `Warm regards,\nYour TM Team ${city}`,
  },
  fr: {
    userSubject: 'Ta demande de rendez-vous TM individuel',
    userGreeting: (name) => `Bonjour ${name},`,
    userBody: "Merci beaucoup d'avoir pris contact avec nous ! Nous sommes ravis de ta démarche et te répondrons très bientôt pour trouver un créneau qui te convient.\n\nÀ très vite !",
    userSignoff: (city) => `Chaleureusement,\nTon équipe MT ${city}`,
  },
  es: {
    userSubject: 'Tu solicitud de cita TM individual',
    userGreeting: (name) => `Hola ${name},`,
    userBody: '¡Muchas gracias por ponerte en contacto con nosotros! Nos alegra mucho saber de ti y te responderemos muy pronto para encontrar un momento que te venga bien.\n\n¡Hasta pronto!',
    userSignoff: (city) => `Un saludo cálido,\nTu equipo de MT ${city}`,
  },
};

function userStrings(locale = 'de'): InfoAnfrageEmailStrings {
  return USER_STRINGS[locale] ?? USER_STRINGS.de;
}

export function buildInfoAnfrageUserSubject(locale = 'de'): string {
  return userStrings(locale).userSubject;
}

export function buildInfoAnfrageUserHtml(params: { name: string; locale?: string; cityName?: string }): string {
  const s = userStrings(params.locale);
  const signoff = s.userSignoff(params.cityName ?? 'TM');
  const body = `
    <tr>
      <td style="padding:20px;background:#ffffff;font-size:16px;line-height:1.8;color:#555;">
        <p style="margin:0 0 12px 0;">${s.userGreeting(params.name)}</p>
        ${s.userBody.split('\n\n').map(p => `<p style="margin:0 0 16px 0;">${p}</p>`).join('')}
        <p style="margin:24px 0 0;">${signoff.replace('\n', '<br>')}</p>
      </td>
    </tr>`;
  return emailWrapper(s.userSubject, body);
}

export function buildInfoAnfrageCenterSubject(name: string): string {
  return `Neue Termin-Anfrage: ${name}`;
}

export function buildInfoAnfrageCenterHtml(params: {
  name: string;
  email: string;
  phone?: string;
  message?: string;
}): string {
  const { name, email, phone, message } = params;
  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Neue Termin-Anfrage</title></head>
<body style="margin:0;padding:20px;font-family:Georgia,serif;color:#555;background:#f3f3f3;">
  <table width="100%" cellpadding="0" cellspacing="0" border="0" style="max-width:540px;">
    <tr>
      <td style="background:#ffffff;padding:24px;border-radius:4px;">
        <p style="margin:0 0 4px 0;font-size:13px;letter-spacing:3px;
                   text-transform:uppercase;color:#BCA075;">Neue Anfrage</p>
        <h2 style="margin:0 0 20px 0;font-size:20px;">Individueller Info-Termin</h2>
        <table cellpadding="6" cellspacing="0" border="0"
          style="font-size:16px;line-height:1.5;width:100%;">
          <tr>
            <td style="color:#999;white-space:nowrap;padding-right:16px;">Name</td>
            <td><strong>${name}</strong></td>
          </tr>
          <tr>
            <td style="color:#999;">E-Mail</td>
            <td><a href="mailto:${email}" style="color:#BCA075;">${email}</a></td>
          </tr>
          ${phone ? `
          <tr>
            <td style="color:#999;">Telefon</td>
            <td>${phone}</td>
          </tr>` : ''}
          ${message ? `
          <tr>
            <td style="color:#999;vertical-align:top;">Verfügbarkeit</td>
            <td>${message}</td>
          </tr>` : ''}
        </table>
      </td>
    </tr>
  </table>
</body>
</html>`;
}
