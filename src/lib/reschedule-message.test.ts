import { describe, it, expect } from 'vitest';
import { buildRescheduleMessage } from './reschedule-message';

describe('buildRescheduleMessage', () => {
  const msg = buildRescheduleMessage({
    title: 'Meditationsabend',
    oldDate: '2099-06-15',
    oldTime: '19:00',
    newDate: '2099-06-20',
    newTime: '18:00',
  });

  it('names the event and the new date in the subject', () => {
    expect(msg.subject).toContain('Meditationsabend');
    expect(msg.subject).toContain('20. Juni 2099');
  });

  it('states the new date and time in the body', () => {
    expect(msg.body).toContain('20. Juni 2099');
    expect(msg.body).toContain('18:00');
  });

  it('states the previous date and time in the body', () => {
    expect(msg.body).toContain('15. Juni 2099');
    expect(msg.body).toContain('19:00');
  });

  it('does not prepend a greeting (the compose template adds "Hallo [Name],")', () => {
    expect(msg.body.startsWith('Hallo')).toBe(false);
  });
});
