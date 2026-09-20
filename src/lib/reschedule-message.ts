import { formatVeranstaltungDate } from './format';

export type RescheduleMessageParams = {
  title: string;
  oldDate: string;
  oldTime: string;
  newDate: string;
  newTime: string;
};

// Suggested Betreff + Nachricht for telling registrants a Veranstaltung was
// verschoben. No greeting — the center email template prepends "Hallo [Name],".
// Used both for the manual "copy subject" path and to pre-fill the compose form.
export function buildRescheduleMessage(p: RescheduleMessageParams): { subject: string; body: string } {
  const newDate = formatVeranstaltungDate(p.newDate);
  const oldDate = formatVeranstaltungDate(p.oldDate);
  return {
    subject: `Terminänderung: ${p.title} – jetzt am ${newDate}`,
    body:
      `unser Termin „${p.title}" wurde verschoben.\n\n` +
      `Neuer Termin: ${newDate} um ${p.newTime} Uhr\n` +
      `(bisher: ${oldDate} um ${p.oldTime} Uhr)\n\n` +
      `Bitte notiere dir den neuen Termin. Wir freuen uns auf dich!`,
  };
}
