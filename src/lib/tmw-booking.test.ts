import { describe, it, expect } from 'vitest';
import { bookInfoabend } from './tmw-booking';

// Requires TMW_API_KEY in the environment — skipped in CI.
// Uses lecture pk=32028 (Bennet Strauch, 23. Juni 2026, Online).
describe.skipIf(!process.env.TMW_API_KEY)('bookInfoabend integration', () => {
  it('creates a booking and returns a numeric id', async () => {
    const result = await bookInfoabend({
      lectureId: 32028,
      first_name: 'Integration',
      last_name: 'Test',
      email: 'bennetstrauch@googlemail.com',
      seats: 1,
      source: 'tm-muenchen.de',
      news_subscribed: false,
    });

    expect(typeof result.id).toBe('number');
    expect(result.id).toBeGreaterThan(0);
  });
});
