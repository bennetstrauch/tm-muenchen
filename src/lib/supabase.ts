import { createClient, SupabaseClient } from "@supabase/supabase-js";

export type Database = {
  public: {
    Tables: {
      translation_cache: {
        Row: {
          id: string;
          source_hash: string;
          locale: string;
          translated_text: string;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["translation_cache"]["Row"],
          "id" | "created_at"
        >;
      };
      teacher_languages: {
        Row: {
          teacher_name: string;
          locale: string;
          bio_override: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["teacher_languages"]["Row"],
          "created_at" | "updated_at"
        >;
      };
      settings: {
        Row: {
          tenant: string;
          active_locales: string[];
          whatsapp_enabled: boolean;
          whatsapp_link: string | null;
          contact_email: string;
          contact_phone: string;
        };
        Insert: Database["public"]["Tables"]["settings"]["Row"];
      };
    };
  };
};

let _client: SupabaseClient<Database> | null = null;

export function getSupabase(): SupabaseClient<Database> {
  if (_client) return _client;
  const url = process.env.SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("SUPABASE_URL and SUPABASE_ANON_KEY must be set");
  _client = createClient<Database>(url, key);
  return _client;
}
