const TMW_INFOBOOKING_URL = 'https://tmw.meditation.de/api/infobooking';

export type InfoTerminParams = {
  first_name: string;
  last_name: string;
  email: string;
  center: number;
  phone_number?: string;
  message?: string;
  news_subscribed?: boolean;
  source?: string;
  zip_code?: string;
};

export async function requestInfoTermin(params: InfoTerminParams): Promise<number> {
  const res = await fetch(TMW_INFOBOOKING_URL, {
    method: 'POST',
    headers: {
      'Authorization': `Token ${process.env.TMW_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      first_name: params.first_name,
      last_name: params.last_name,
      email: params.email,
      center: params.center,
      phone_number: params.phone_number ?? '',
      message: params.message ?? '',
      news_subscribed: params.news_subscribed ?? false,
      source: params.source ?? '',
      zip_code: params.zip_code ?? '',
    }),
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`TMW infobooking failed ${res.status}: ${text}`);
  }

  const data = await res.json() as { id: number };
  return data.id;
}
