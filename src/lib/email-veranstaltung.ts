import { emailWrapper } from './email';

export type LeiterNotificationParams = {
  leiterName: string;
  registrantName: string;
  registrantEmail: string;
  registrantPhone?: string;
  tmLehrer?: string;
  eventTitle: string;
  eventDate: string;
  eventTime: string;
  eventLocation: string;
  magicLink: string;
};

export type EventEmailParams = {
  name: string;
  eventTitle: string;
  eventSubtitle: string;
  eventDate: string;      // "Dienstag, 19. Mai 2026"
  eventTime: string;      // "17:00"
  eventLocation: string;
  isOnline: boolean;
  onlineLink?: string;
  hosts: string;
  price?: string;
};

function footerBlock(): string {
  return `
  <tr>
    <td style="padding:20px;background:#ffffff;font-size:13px;color:#aaa;
               border-top:1px solid #eee;line-height:1.6;">
      <p style="margin:0;">
        Bitte beachten Sie: Dies ist eine automatisch erstellte Nachricht.
        Bei Fragen wenden Sie sich bitte an das TM-Center München:
        <a href="tel:089537224" style="color:#BCA075;">089-537224</a>
      </p>
    </td>
  </tr>`;
}

function eventBox(p: EventEmailParams): string {
  const locationLine = p.isOnline
    ? `Online${p.onlineLink ? ` &nbsp;·&nbsp; <a href="${p.onlineLink}" style="color:#BCA075;">Zoom-Link</a>` : ''}`
    : p.eventLocation;
  return `
  <div style="background:#faf8f5;border-left:3px solid #BCA075;
              padding:16px 20px;margin:0 0 24px;border-radius:2px;">
    <p style="margin:0 0 6px 0;font-size:14px;color:#aaa;
              text-transform:uppercase;letter-spacing:2px;">Ihr Termin</p>
    <p style="margin:0 0 4px 0;font-size:19px;font-weight:bold;color:#1A3352;">
      ${p.eventTitle}
    </p>
    <p style="margin:0 0 8px 0;font-size:14px;color:#888;">${p.eventSubtitle}</p>
    <p style="margin:0 0 4px 0;font-size:16px;">
      <strong>${p.eventDate}</strong>${p.eventTime ? ` &nbsp;·&nbsp; ${p.eventTime} Uhr` : ''}
    </p>
    <p style="margin:0 0 4px 0;font-size:15px;color:#666;">${locationLine}</p>
    ${p.hosts ? `<p style="margin:4px 0 0;font-size:14px;color:#888;">mit ${p.hosts}</p>` : ''}
    ${p.price ? `<p style="margin:6px 0 0;font-size:14px;color:#666;">Kosten: ${p.price}</p>` : ''}
  </div>`;
}

function onlineLinkBlock(url: string, margin = '20px 0'): string {
  return `
  <div style="text-align:center;margin:${margin};">
    <a href="${url}"
      style="display:inline-block;background:#BCA075;color:#ffffff;font-family:Georgia,serif;
             font-size:16px;text-decoration:none;padding:12px 32px;border-radius:20px;">
      Zum Online-Event
    </a>
  </div>
  <p style="margin:0 0 20px 0;font-size:14px;color:#aaa;word-break:break-all;text-align:center;">
    ${url}
  </p>`;
}

export function buildEventConfirmationHtml(p: EventEmailParams): string {
  const body = `
  <tr>
    <td style="padding:20px;background:#ffffff;font-size:16px;line-height:1.6;">
      <p style="margin:0 0 20px 0;">Hallo ${p.name},</p>
      <p style="margin:0 0 24px 0;">
        du hast dich erfolgreich angemeldet! Wir freuen uns, dich zu sehen.
      </p>
      ${eventBox(p)}
      ${p.isOnline && p.onlineLink ? onlineLinkBlock(p.onlineLink) : ''}
      <p style="margin:0 0 8px 0;">
        Solltest du kurzfristig verhindert sein, melde dich bitte direkt beim Center:
      </p>
      <p style="margin:0 0 20px 0;">
        <a href="tel:089537224" style="color:#BCA075;">089-537224</a>
      </p>
      <p style="margin:24px 0 0;font-size:16px;">
        Bis bald und herzliche Grüße,<br>
        <span style="color:#BCA075;">TM-Center München</span>
      </p>
    </td>
  </tr>
  ${footerBlock()}`;

  return emailWrapper(`Bestätigung: ${p.eventTitle}`, body);
}

export function buildCustomEmailHtml(name: string, body: string): string {
  const paragraphs = body
    .split(/\n\n+/)
    .map(p => p.trim())
    .filter(Boolean)
    .map(p => `<p style="margin:0 0 16px 0;">${p.replace(/\n/g, '<br>')}</p>`)
    .join('\n');

  const content = `
  <tr>
    <td style="padding:20px;background:#ffffff;font-size:16px;line-height:1.7;color:#555;">
      <p style="margin:0 0 20px 0;">Hallo ${name},</p>
      ${paragraphs}
      <p style="margin:28px 0 0;font-size:16px;">
        Herzliche Grüße,<br>
        <span style="color:#BCA075;">TM-Center München</span>
      </p>
    </td>
  </tr>
  ${footerBlock()}`;

  return emailWrapper('Nachricht vom TM-Center München', content);
}

export function buildEventReminderHtml(p: EventEmailParams, customBody?: string): string {
  const introText = customBody
    ? customBody
        .split(/\n\n+/)
        .map(s => s.trim())
        .filter(Boolean)
        .map(s => `<p style="margin:0 0 16px 0;">${s.replace(/\n/g, '<br>')}</p>`)
        .join('\n')
    : `<p style="margin:0 0 24px 0;">wir möchten dich an deine Anmeldung erinnern:</p>`;

  const body = `
  <tr>
    <td style="padding:20px;background:#ffffff;font-size:16px;line-height:1.6;">
      <p style="margin:0 0 20px 0;">Hallo ${p.name},</p>
      ${introText}
      ${eventBox(p)}
      ${p.isOnline && p.onlineLink ? onlineLinkBlock(p.onlineLink, '24px 0 16px') : ''}
      <p style="margin:0 0 20px 0;font-size:15px;color:#777;line-height:1.7;">
        Solltest du kurzfristig verhindert sein, melde dich bitte direkt beim Center:
        <a href="tel:089537224" style="color:#BCA075;">089-537224</a>
      </p>
      <p style="margin:24px 0 0;font-size:16px;">
        Wir freuen uns auf dich!<br>
        <span style="color:#BCA075;">TM-Center München</span>
      </p>
    </td>
  </tr>
  ${footerBlock()}`;

  return emailWrapper(`Erinnerung: ${p.eventTitle} – ${p.eventDate}`, body);
}

export function buildLeiterNotificationHtml(p: LeiterNotificationParams): string {
  const body = `
  <tr>
    <td style="padding:20px;background:#ffffff;font-size:16px;line-height:1.6;">
      <p style="margin:0 0 20px 0;">Hallo liebe/r ${p.leiterName},</p>
      <p style="margin:0 0 24px 0;">
        es gibt eine neue Anmeldung für deine Veranstaltung:
      </p>
      <div style="background:#faf8f5;border-left:3px solid #BCA075;
                  padding:16px 20px;margin:0 0 24px;border-radius:2px;">
        <p style="margin:0 0 6px 0;font-size:14px;color:#aaa;
                  text-transform:uppercase;letter-spacing:2px;">Veranstaltung</p>
        <p style="margin:0 0 4px 0;font-size:19px;font-weight:bold;color:#1A3352;">
          ${p.eventTitle}
        </p>
        <p style="margin:0 0 4px 0;font-size:16px;">
          <strong>${p.eventDate}</strong>${p.eventTime ? ` &nbsp;·&nbsp; ${p.eventTime} Uhr` : ''}
        </p>
        <p style="margin:0;font-size:15px;color:#666;">${p.eventLocation}</p>
      </div>
      <table cellpadding="6" cellspacing="0" border="0"
        style="font-size:15px;line-height:1.5;width:100%;margin:0 0 28px;">
        <tr>
          <td style="color:#999;white-space:nowrap;padding-right:16px;vertical-align:top;">Name</td>
          <td><strong>${p.registrantName}</strong></td>
        </tr>
        <tr>
          <td style="color:#999;vertical-align:top;">E-Mail</td>
          <td><a href="mailto:${p.registrantEmail}" style="color:#BCA075;">${p.registrantEmail}</a></td>
        </tr>
        ${p.registrantPhone ? `
        <tr>
          <td style="color:#999;vertical-align:top;">Telefon</td>
          <td>${p.registrantPhone}</td>
        </tr>` : ''}
        ${p.tmLehrer ? `
        <tr>
          <td style="color:#999;vertical-align:top;">TM-Lehrer</td>
          <td>${p.tmLehrer}</td>
        </tr>` : ''}
      </table>
      <div style="text-align:center;margin:0 0 28px;">
        <a href="${p.magicLink}"
          style="display:inline-block;background:#BCA075;color:#ffffff;font-family:Georgia,serif;
                 font-size:16px;text-decoration:none;padding:12px 32px;border-radius:20px;">
          Alle Anmeldungen ansehen →
        </a>
      </div>
      <p style="margin:0;font-size:16px;">
        Hochachtungsvoll,<br>
        <span style="color:#BCA075;">Dein TM-München-IT-TEAM 😉</span>
      </p>
    </td>
  </tr>`;

  return emailWrapper(`Neue Anmeldung: ${p.eventTitle} – ${p.eventDate}`, body);
}
