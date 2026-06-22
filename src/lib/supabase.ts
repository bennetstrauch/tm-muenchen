import { createClient, SupabaseClient } from "@supabase/supabase-js";

type TranslationCacheRow = {
  id: string;
  source_hash: string;
  locale: string;
  translated_text: string;
  created_at: string;
};

type TeacherLanguagesRow = {
  tenant: string;
  teacher_name: string;
  locale: string;
  bio_override: string | null;
  created_at: string;
  updated_at: string;
};

type VeranstaltungRow = {
  id: string;
  tenant: string;
  title: string;
  subtitle: string;
  description: string;
  long_description: string;
  date: string;
  time: string;
  location: string;
  is_online: boolean;
  online_link: string;
  hosts: string;
  price: string;
  target_audience: string;
  notes: string;
  reminder1_hours: number;
  reminder2_hours: number;
  registration_open: boolean;
  visible: boolean;
  is_priority: boolean;
  image_url: string | null;
  auch_fuer_nicht_meditierende: boolean;
  slug: string | null;
  vorlage_id: string | null;
  end_time: string | null;
  reminder_subject1: string | null;
  reminder_body1: string | null;
  reminder_subject2: string | null;
  reminder_body2: string | null;
  whatsapp_posted_at: string | null;
};

type VorlageRow = {
  id: string;
  tenant: string;
  name: string;
  title: string;
  subtitle: string;
  description: string;
  long_description: string;
  date: string | null;
  time: string;
  location: string;
  is_online: boolean;
  online_link: string;
  hosts: string;
  price: string;
  target_audience: string;
  notes: string;
  reminder1_hours: number;
  reminder2_hours: number;
  registration_open: boolean;
  visible: boolean;
  is_priority: boolean;
  image_url: string | null;
  auch_fuer_nicht_meditierende: boolean;
  slug: string | null;
  end_time: string | null;
  reminder_subject1: string | null;
  reminder_body1: string | null;
  reminder_subject2: string | null;
  reminder_body2: string | null;
};

type InfoAnfrageRow = {
  id: string;
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
  created_at: string;
};

type InfoAnmeldungRow = {
  id: string;
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
  created_at: string;
};

type AnmeldungRow = {
  id: string;
  tenant: string;
  veranstaltung_id: string | null;
  timestamp: string;
  event_id: string;
  event_title: string;
  event_date: string;
  name: string;
  email: string;
  phone: string | null;
  tm_lehrer: string | null;
  datum_erlernen: string | null;
};

type TenantRow = {
  tenant: string;
  hostname: string;
  admin_password_hash: string;
  active_locales: string[];
  whatsapp_enabled: boolean;
  whatsapp_link: string | null;
  whatsapp_number: string | null;
  contact_email: string;
  contact_phone: string;
  from_email: string;
  instagram_link: string;
  city: string;
  center_image_url: string | null;
  tmw_center_ids: number[];
  impressum_content: string;
  logo_url: string | null;
  logo_label: string | null;
  infoabend_duration_minutes: number;
  show_teachers: boolean;
  show_meditators_section: boolean;
  center_banner_label: string | null;
  can_edit_copy: boolean;
};

export type Database = {
  public: {
    Tables: {
      translation_cache: {
        Row: TranslationCacheRow;
        Insert: Omit<TranslationCacheRow, "id" | "created_at">;
        Update: Partial<Omit<TranslationCacheRow, "id" | "created_at">>;
        Relationships: [];
      };
      teacher_languages: {
        Row: TeacherLanguagesRow;
        Insert: Omit<TeacherLanguagesRow, "created_at" | "updated_at">;
        Update: Partial<Omit<TeacherLanguagesRow, "created_at" | "updated_at">>;
        Relationships: [];
      };
      tenants: {
        Row: TenantRow;
        Insert: TenantRow;
        Update: Partial<TenantRow>;
        Relationships: [];
      };
      veranstaltungen: {
        Row: VeranstaltungRow;
        Insert: Omit<VeranstaltungRow, "id">;
        Update: Partial<Omit<VeranstaltungRow, "id">>;
        Relationships: [];
      };
      vorlagen: {
        Row: VorlageRow;
        Insert: Omit<VorlageRow, "id">;
        Update: Partial<Omit<VorlageRow, "id">>;
        Relationships: [];
      };
      anmeldungen: {
        Row: AnmeldungRow;
        Insert: Omit<AnmeldungRow, "id" | "timestamp" | "veranstaltung_id"> & { timestamp?: string; veranstaltung_id?: string | null };
        Update: Partial<Omit<AnmeldungRow, "id">>;
        Relationships: [];
      };
      info_anmeldungen: {
        Row: InfoAnmeldungRow;
        Insert: Omit<InfoAnmeldungRow, "id" | "created_at">;
        Update: Partial<Omit<InfoAnmeldungRow, "id" | "created_at">>;
        Relationships: [];
      };
      info_anfragen: {
        Row: InfoAnfrageRow;
        Insert: Omit<InfoAnfrageRow, "id" | "created_at">;
        Update: Partial<Omit<InfoAnfrageRow, "id" | "created_at">>;
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
  };
};

let _client: SupabaseClient<Database> | null = null;

export function getSupabase(): SupabaseClient<Database> {
  if (_client) return _client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set");
  _client = createClient<Database>(url, key);
  return _client;
}
