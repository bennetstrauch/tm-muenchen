import { getSupabase } from './supabase';

type InfoAnmeldungInsert = {
  tenant: string;
  locale: string;
  has_consent: boolean;
  meta_pixel_event_id: string | null;
  tmw_registration_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  event_date: string;
  event_time: string;
  event_type: string;
  source: string;
  news_subscribed: boolean;
};

export async function insertInfoAnmeldung(data: InfoAnmeldungInsert): Promise<void> {
  const { error } = await getSupabase().from('info_anmeldungen').insert(data);
  if (error) console.error('[info_anmeldungen] insert failed:', error.message);
}
