import { getSupabase } from './supabase';

export type KursAnmeldungInsert = {
  tenant: string;
  slot_pk: number;
  tmw_booking_id: number | null;
  first_name: string;
  last_name: string;
  email: string;
  phone: string | null;
  gender: string;
  birthdate: string;
  address1: string | null;
  zip_code: string | null;
  city: string | null;
  news_subscribed: boolean;
  locale: string;
  source: string | null;
};

export async function insertKursAnmeldung(data: KursAnmeldungInsert): Promise<void> {
  const { error } = await getSupabase().from('kurs_anmeldungen').insert(data);
  if (error) console.error('[kurs_anmeldungen] insert failed:', error.message);
}
