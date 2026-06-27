import { describe, it, expect, vi, afterEach } from 'vitest';
import { getCourses } from './courses';

const mockFetch = vi.fn();
vi.stubGlobal('fetch', mockFetch);

afterEach(() => vi.clearAllMocks());

const TODAY = new Date().toISOString().slice(0, 10); // "YYYY-MM-DD"

function isoToGerman(iso: string): string {
  const DE_MONTHS = ['Januar','Februar','März','April','Mai','Juni','Juli','August','September','Oktober','November','Dezember'];
  const [y, m, d] = iso.split('-');
  return `Sa., ${parseInt(d)}. ${DE_MONTHS[parseInt(m) - 1]} ${y}`;
}

function futureDate(daysFromNow: number): string {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  return d.toISOString().slice(0, 10);
}

function futureDateGerman(daysFromNow: number): string {
  return isoToGerman(futureDate(daysFromNow));
}

function makeSlot(pk: number, booked: 'yes' | 'no', gender: 'M' | 'F' = 'M') {
  return {
    pk,
    booked,
    time: '10:00',
    duration: 60,
    teacher: { name: 'Test Lehrer', image_url: 'https://example.com/img.jpg', gender },
  };
}

function makeCourse(overrides: object = {}) {
  return {
    date: futureDateGerman(30),
    gender_restricted: true,
    follow_up1: `Sa., 5. Juli 2030, um 18:00`,
    follow_up1_online: false,
    follow_up2: `So., 6. Juli 2030, um 18:00`,
    follow_up2_online: false,
    follow_up3: `Mo., 7. Juli 2030, um 18:00`,
    follow_up3_online: false,
    slots: [makeSlot(1, 'no'), makeSlot(2, 'no', 'F')],
    ...overrides,
  };
}

function mockResponse(data: unknown) {
  mockFetch.mockResolvedValue({ ok: true, json: async () => data });
}

describe('getCourses', () => {
  it('returns available slots only (booked === "no")', async () => {
    mockResponse([makeCourse({ slots: [makeSlot(1, 'yes'), makeSlot(2, 'no')] })]);
    const courses = await getCourses([108]);
    expect(courses[0].slots).toHaveLength(1);
    expect(courses[0].slots[0].pk).toBe(2);
  });

  it('excludes courses that have zero available slots after filtering', async () => {
    mockResponse([makeCourse({ slots: [makeSlot(1, 'yes'), makeSlot(2, 'yes')] })]);
    const courses = await getCourses([108]);
    expect(courses).toHaveLength(0);
  });

  it('excludes courses in the past', async () => {
    mockResponse([makeCourse({ date: 'Sa., 1. Januar 2020' })]);
    const courses = await getCourses([108]);
    expect(courses).toHaveLength(0);
  });

  it('maps slot fields to CourseSlot shape', async () => {
    mockResponse([makeCourse()]);
    const [course] = await getCourses([108]);
    const slot = course.slots[0];
    expect(slot).toMatchObject({
      pk: 1,
      time: '10:00',
      teacherName: 'Test Lehrer',
      teacherImage: 'https://example.com/img.jpg',
      teacherGender: 'M',
    });
  });

  it('maps gender_restricted to genderRestricted', async () => {
    mockResponse([makeCourse({ gender_restricted: false })]);
    const [course] = await getCourses([108]);
    expect(course.genderRestricted).toBe(false);
  });

  it('includes only in-person follow-ups', async () => {
    mockResponse([makeCourse({ follow_up2_online: true })]);
    const [course] = await getCourses([108]);
    expect(course.followUps).toHaveLength(2);
  });

  it('merges results from multiple center IDs', async () => {
    mockFetch
      .mockResolvedValueOnce({ ok: true, json: async () => [makeCourse()] })
      .mockResolvedValueOnce({ ok: true, json: async () => [makeCourse()] });
    const courses = await getCourses([108, 109]);
    expect(courses).toHaveLength(2);
  });

  it('returns empty array when fetch fails', async () => {
    mockFetch.mockRejectedValue(new Error('Network error'));
    const courses = await getCourses([108]);
    expect(courses).toEqual([]);
  });
});
