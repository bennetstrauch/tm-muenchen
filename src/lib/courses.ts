export type CourseSlot = {
  pk: number;
  time: string;
  teacherName: string;
  teacherImage: string;
  teacherGender: 'M' | 'F';
};

export type TMCourse = {
  date: string;
  genderRestricted: boolean;
  slots: CourseSlot[];
  followUps: { date: string; time: string }[];
};

const DE_MONTHS: Record<string, string> = {
  Januar: '01', Februar: '02', März: '03', April: '04',
  Mai: '05', Juni: '06', Juli: '07', August: '08',
  September: '09', Oktober: '10', November: '11', Dezember: '12',
};

function parseGermanDate(str: string): string {
  const match = str.match(/(\d{1,2})\.\s+(\w+)\s+(\d{4})/);
  if (!match) return '';
  const [, day, month, year] = match;
  return `${year}-${DE_MONTHS[month] ?? '01'}-${day.padStart(2, '0')}`;
}

function parseGermanDateTime(str: string): { date: string; time: string } {
  const match = str.match(/(\d{1,2})\.\s+(\w+)\s+(\d{4}),?\s+um\s+(\d{2}:\d{2})/);
  if (!match) return { date: '', time: '' };
  const [, day, month, year, time] = match;
  return {
    date: `${year}-${DE_MONTHS[month] ?? '01'}-${day.padStart(2, '0')}`,
    time,
  };
}

type RawSlot = {
  pk: number;
  booked: string;
  time: string;
  duration: number;
  teacher: { name: string; image_url: string; gender: string };
};

type RawCourse = {
  date: string;
  gender_restricted: boolean;
  follow_up1: string; follow_up1_online: boolean;
  follow_up2: string; follow_up2_online: boolean;
  follow_up3: string; follow_up3_online: boolean;
  slots: RawSlot[];
};

function parseCourse(raw: RawCourse, today: string): TMCourse | null {
  const date = parseGermanDate(raw.date);
  if (!date || date < today) return null;

  const slots: CourseSlot[] = raw.slots
    .filter(s => s.booked === 'no')
    .map(s => ({
      pk: s.pk,
      time: s.time,
      teacherName: s.teacher.name,
      teacherImage: s.teacher.image_url,
      teacherGender: s.teacher.gender as 'M' | 'F',
    }));

  if (slots.length === 0) return null;

  const followUps: { date: string; time: string }[] = [];
  for (const n of [1, 2, 3] as const) {
    const dateStr = raw[`follow_up${n}`];
    const isOnline = raw[`follow_up${n}_online`];
    if (!dateStr || isOnline) continue;
    const parsed = parseGermanDateTime(dateStr);
    if (parsed.date) followUps.push(parsed);
  }

  return { date, genderRestricted: raw.gender_restricted, slots, followUps };
}

async function fetchCenter(id: number, token: string, today: string): Promise<TMCourse[]> {
  const res = await fetch(`https://tmw.meditation.de/api/center/${id}/courses`, {
    headers: { Authorization: `Token ${token}` },
    next: { revalidate: 300 },
  } as RequestInit);
  if (!res.ok) throw new Error(`TMW courses API error ${id}: ${res.status}`);
  const raw = await res.json() as RawCourse[];
  return raw.flatMap(r => {
    const course = parseCourse(r, today);
    return course ? [course] : [];
  });
}

export async function getCourses(centerIds: number[]): Promise<TMCourse[]> {
  const token = process.env.TMW_API_KEY;
  if (!token) return [];
  const today = new Date().toISOString().slice(0, 10);
  try {
    const settled = await Promise.allSettled(centerIds.map(id => fetchCenter(id, token, today)));
    return settled.flatMap(r => r.status === 'fulfilled' ? r.value : []);
  } catch {
    return [];
  }
}
