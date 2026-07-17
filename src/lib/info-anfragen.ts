import { getSupabase } from './supabase';

type InfoAnfrageInsert = {
  tenant: string;
  locale: string;
  name: string;
  email: string;
  phone: string | null;
  message: string | null;
  source: string;
  tmw_registration_id: string | null;
  news_subscribed: boolean;
  city: string | null;
  zip_code: string | null;
};

export async function insertInfoAnfrage(data: InfoAnfrageInsert): Promise<void> {
  const { error } = await getSupabase().from('info_anfragen').insert(data);
  if (error) console.error('[info_anfragen] insert failed:', error.message);
}
