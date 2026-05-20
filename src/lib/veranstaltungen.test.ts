import { describe, it, expect } from 'vitest';
import { parseVeranstaltungRow } from './veranstaltungen';

// Minimal valid row up to column 27 (reminderBody2), then whatsappPostedAt at 28
function makeRow(overrides: Partial<Record<number, string>> = {}): string[] {
  const row = Array(29).fill('');
  row[0] = 'evt-1';
  row[1] = 'Gruppenmeditation';
  row[5] = '2026-06-10';
  row[6] = '19:00';
  Object.entries(overrides).forEach(([i, v]) => { row[Number(i)] = v; });
  return row;
}

describe('parseVeranstaltungRow', () => {
  it('parses whatsappPostedAt when present at column 28', () => {
    const row = makeRow({ 28: '2026-06-10T14:00:00.000Z' });
    const result = parseVeranstaltungRow(row);
    expect(result.whatsappPostedAt).toBe('2026-06-10T14:00:00.000Z');
  });

  it('returns undefined for whatsappPostedAt when column is empty string', () => {
    const row = makeRow({ 28: '' });
    const result = parseVeranstaltungRow(row);
    expect(result.whatsappPostedAt).toBeUndefined();
  });

  it('returns undefined for whatsappPostedAt when row is too short', () => {
    const row = makeRow();
    row.length = 28; // truncate — column 28 missing
    const result = parseVeranstaltungRow(row);
    expect(result.whatsappPostedAt).toBeUndefined();
  });
});
