import { createClient, SupabaseClient } from "@supabase/supabase-js";

type TranslationCacheRow = {
  id: string;
  source_hash: string;
  locale: string;
  translated_text: string;
  created_at: string;
};

type TeacherLanguagesRow = {
  teacher_name: string;
  locale: string;
  bio_override: string | null;
  created_at: string;
  updated_at: string;
};

type TenantRow = {
  tenant: string;
  hostname: string;
  admin_password_hash: string;
  active_locales: string[];
  whatsapp_enabled: boolean;
  whatsapp_link: string | null;
  contact_email: string;
  contact_phone: string;
  from_email: string;
  instagram_link: string;
  city: string;
  center_image_url: string | null;
  tmw_center_ids: number[];
  impressum_content: string;
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
