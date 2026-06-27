const TMW_COURSEBOOKING_URL = 'https://tmw.meditation.de/api/coursebooking';

export type CourseBookingParams = {
  slot: number;
  first_name: string;
  last_name: string;
  email: string;
  gender: 'M' | 'F' | 'X';
  birthdate: string; // DD.MM.YYYY
  phone_number?: string;
  address1?: string;
  zip_code?: string;
  city?: string;
  news_subscribed?: boolean;
  source?: string;
};

export async function bookCourse(params: CourseBookingParams): Promise<{ id: number }> {
  const res = await fetch(TMW_COURSEBOOKING_URL, {
    method: 'POST',
    headers: {
      Authorization: `Token ${process.env.TMW_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ...params,
      phone_number: params.phone_number ?? '',
      address1: params.address1 ?? '',
      zip_code: params.zip_code ?? '',
      city: params.city ?? '',
      news_subscribed: params.news_subscribed ?? false,
      source: params.source ?? 'unbekannt',
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`TMW coursebooking failed ${res.status}: ${text}`);
  }

  return res.json();
}
