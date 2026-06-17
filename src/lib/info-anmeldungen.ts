import { getSupabase } from './supabase';
import type { Registration } from './sheets';

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
  city: string | null;
  news_subscribed: boolean;
};

export async function getInfoAnmeldungen(tenant: string): Promise<Registration[]> {
  const { data, error } = await getSupabase()
    .from('info_anmeldungen')
    .select('created_at, name, email, phone, event_date, event_time, event_type, city, news_subscribed')
    .eq('tenant', tenant)
    .order('created_at', { ascending: false });

  if (error) {
    console.error('[info_anmeldungen] read failed:', error.message);
    return [];
  }

  return (data ?? []).map(r => ({
    timestamp: new Date(r.created_at).toLocaleString('de-DE', { timeZone: 'Europe/Berlin' }),
    name: r.name,
    email: r.email,
    phone: r.phone ?? '',
    eventDate: r.event_date,
    eventTime: r.event_time,
    eventType: r.event_type,
    city: r.city ?? '',
    newsSubscribed: r.news_subscribed,
  }));
}

export async function insertInfoAnmeldung(data: InfoAnmeldungInsert): Promise<void> {
  const { error } = await getSupabase().from('info_anmeldungen').insert(data);
  if (error) console.error('[info_anmeldungen] insert failed:', error.message);
}
