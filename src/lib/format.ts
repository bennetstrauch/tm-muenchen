export function eventSlug(event: { title: string; slug?: string }): string {
  if (event.slug) return event.slug;
  return event.title
    .toLowerCase()
    .replace(/ä/g, 'ae').replace(/ö/g, 'oe').replace(/ü/g, 'ue').replace(/ß/g, 'ss')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');
}

export function formatVeranstaltungDate(isoDate: string): string {
  const d = new Date(`${isoDate}T12:00:00`);
  return d.toLocaleDateString('de-DE', {
    weekday: 'long', day: 'numeric', month: 'long', year: 'numeric',
  });
}

export function calcReminderTime(isoDate: string, time: string, hoursBefore: number): string | null {
  const [, month] = isoDate.split('-').map(Number);
  const utcOffset = (month >= 4 && month <= 10) ? 2 : 1;
  const offsetStr = utcOffset === 2 ? '+02:00' : '+01:00';
  const eventUtc = new Date(`${isoDate}T${time}:00${offsetStr}`);
  const reminderUtc = new Date(eventUtc.getTime() - hoursBefore * 3_600_000);
  if (reminderUtc > new Date()) return reminderUtc.toISOString();
  return null;
}
