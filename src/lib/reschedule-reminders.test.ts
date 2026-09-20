import { describe, it, expect, vi, beforeEach } from 'vitest';
import type { Veranstaltung } from './veranstaltungen';

vi.mock('./veranstaltungen', () => ({
  getEventReminderTargets: vi.fn(),
  setReminderEmailIds: vi.fn(),
}));

import { resyncEventReminders, resyncRemindersAfterUpdate, scheduleChanged } from './reschedule-reminders';
import { getEventReminderTargets, setReminderEmailIds } from './veranstaltungen';

function makeEvent(overrides: Partial<Veranstaltung> = {}): Veranstaltung {
  return {
    id: 'ev-1',
    title: 'Infoabend',
    subtitle: '',
    description: '',
    longDescription: '',
    date: '2099-06-15',
    time: '19:00',
    location: 'München',
    isOnline: false,
    onlineLink: '',
    hosts: 'Anna',
    price: '',
    targetAudience: '',
    notes: '',
    reminder1Hours: 24,
    reminder2Hours: 0,
    registrationOpen: true,
    visible: true,
    isPriority: false,
    auchFuerNichtMeditierende: false,
    ...overrides,
  };
}

function fakeResend() {
  return { emails: { update: vi.fn().mockResolvedValue({ data: {}, error: null }), cancel: vi.fn().mockResolvedValue({ data: {}, error: null }) } };
}

beforeEach(() => {
  vi.clearAllMocks();
});

describe('scheduleChanged', () => {
  it('is true when the date differs', () => {
    expect(scheduleChanged(makeEvent({ date: '2099-06-15' }), makeEvent({ date: '2099-06-16' }))).toBe(true);
  });
  it('is true when the time differs', () => {
    expect(scheduleChanged(makeEvent({ time: '19:00' }), makeEvent({ time: '18:00' }))).toBe(true);
  });
  it('is false when only a non-schedule field differs', () => {
    expect(scheduleChanged(makeEvent({ title: 'A' }), makeEvent({ title: 'B' }))).toBe(false);
  });
});

describe('resyncEventReminders', () => {
  it('moves each registrant reminder to the recomputed time', async () => {
    vi.mocked(getEventReminderTargets).mockResolvedValue([
      { id: 'reg-1', reminder1EmailId: 'resend-a', reminder2EmailId: null },
      { id: 'reg-2', reminder1EmailId: 'resend-b', reminder2EmailId: null },
    ]);
    const resend = fakeResend();

    // Event 2099-06-15 19:00 München, 24h reminder → 2099-06-14 19:00 +02:00 (summer) = 17:00Z
    await resyncEventReminders(makeEvent(), 'muenchen', resend as never);

    expect(resend.emails.update).toHaveBeenCalledWith({ id: 'resend-a', scheduledAt: '2099-06-14T17:00:00.000Z' });
    expect(resend.emails.update).toHaveBeenCalledWith({ id: 'resend-b', scheduledAt: '2099-06-14T17:00:00.000Z' });
    expect(resend.emails.cancel).not.toHaveBeenCalled();
  });

  it('cancels and clears a reminder whose new time is in the past', async () => {
    vi.mocked(getEventReminderTargets).mockResolvedValue([
      { id: 'reg-1', reminder1EmailId: 'resend-a', reminder2EmailId: null },
    ]);
    const resend = fakeResend();

    // Event in the past → calcReminderTime returns null → cancel + clear stored id.
    await resyncEventReminders(makeEvent({ date: '2000-01-01' }), 'muenchen', resend as never);

    expect(resend.emails.cancel).toHaveBeenCalledWith('resend-a');
    expect(resend.emails.update).not.toHaveBeenCalled();
    expect(vi.mocked(setReminderEmailIds)).toHaveBeenCalledWith('reg-1', { id1: null, id2: null }, 'muenchen');
  });

  it('skips reminder slots that were never scheduled', async () => {
    vi.mocked(getEventReminderTargets).mockResolvedValue([
      { id: 'reg-1', reminder1EmailId: null, reminder2EmailId: null },
    ]);
    const resend = fakeResend();

    await resyncEventReminders(makeEvent(), 'muenchen', resend as never);

    expect(resend.emails.update).not.toHaveBeenCalled();
    expect(resend.emails.cancel).not.toHaveBeenCalled();
  });
});

describe('resyncRemindersAfterUpdate', () => {
  it('does nothing when the schedule did not change', async () => {
    const resend = fakeResend();
    await resyncRemindersAfterUpdate(makeEvent({ title: 'A' }), makeEvent({ title: 'B' }), 'muenchen', resend as never);
    expect(getEventReminderTargets).not.toHaveBeenCalled();
    expect(resend.emails.update).not.toHaveBeenCalled();
  });

  it('resyncs when the date changed', async () => {
    vi.mocked(getEventReminderTargets).mockResolvedValue([
      { id: 'reg-1', reminder1EmailId: 'resend-a', reminder2EmailId: null },
    ]);
    const resend = fakeResend();
    await resyncRemindersAfterUpdate(makeEvent(), makeEvent({ date: '2099-06-20' }), 'muenchen', resend as never);
    expect(getEventReminderTargets).toHaveBeenCalledWith('ev-1', 'muenchen');
    expect(resend.emails.update).toHaveBeenCalledWith({ id: 'resend-a', scheduledAt: '2099-06-19T17:00:00.000Z' });
  });
});
