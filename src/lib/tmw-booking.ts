const TMW_BOOKING_URL = 'https://tmw.meditation.de/api/booking';

export type BookingParams = {
  lectureId: number;
  first_name: string;
  last_name: string;
  email: string;
  seats: number;
  source: string;
  news_subscribed: boolean;
  phone?: string;
  zip_code?: string;
};

export type BookingResult = {
  id: number;
  first_name: string;
  last_name: string;
  email: string;
  lecture: number;
  seats: number;
  source: string;
  news_subscribed: boolean;
};

export async function bookInfoabend(params: BookingParams): Promise<BookingResult> {
  const res = await fetch(TMW_BOOKING_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${process.env.TMW_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      lecture: params.lectureId,
      first_name: params.first_name,
      last_name: params.last_name,
      email: params.email,
      seats: params.seats,
      source: params.source,
      news_subscribed: params.news_subscribed,
      phone_number: params.phone ?? '',
      zip_code: params.zip_code ?? '',
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`TMW booking failed ${res.status}: ${text}`);
  }

  return res.json();
}
