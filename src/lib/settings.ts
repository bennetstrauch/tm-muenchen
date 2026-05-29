import { getSupabase } from './supabase';

export type SiteSettings = {
  active_locales: string[];
  whatsapp_enabled: boolean;
  whatsapp_link: string | null;
  contact_email: string;
  contact_phone: string;
};

const DEFAULTS: SiteSettings = {
  active_locales: ['de', 'en', 'fr', 'es'],
  whatsapp_enabled: true,
  whatsapp_link: 'https://chat.whatsapp.com/JyYjiLgQ7dn4ewQLedUVC4?mode=gi_t',
  contact_email: 'info@tm-muenchen.de',
  contact_phone: '+49 163 7354 836',
};

export async function getSettings(): Promise<SiteSettings> {
  try {
    const { data } = await getSupabase()
      .from('settings')
      .select('active_locales, whatsapp_enabled, whatsapp_link, contact_email, contact_phone')
      .eq('tenant', 'muenchen')
      .single();
    return data ?? DEFAULTS;
  } catch {
    return DEFAULTS;
  }
}
