import bcrypt from "bcryptjs";
import { getSupabase } from "@/lib/supabase";

function parseCenterIds(raw: string): number[] {
  return raw.split(",").map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
}

export async function GET() {
  const { data, error } = await getSupabase().from("tenants").select("*").order("tenant");
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}

export async function POST(request: Request) {
  const body = await request.json();
  const hash = await bcrypt.hash(body.password, 10);

  const row = {
    tenant: body.tenant,
    hostname: body.hostname,
    city: body.city,
    admin_password_hash: hash,
    active_locales: body.active_locales,
    tmw_center_ids: parseCenterIds(body.tmw_center_ids),
    contact_email: body.contact_email,
    contact_phone: body.contact_phone,
    from_email: body.from_email,
    instagram_link: body.instagram_link || "https://www.instagram.com/tmdeutschland",
    whatsapp_enabled: body.whatsapp_enabled ?? false,
    whatsapp_link: body.whatsapp_link || null,
    whatsapp_number: body.whatsapp_number || null,
    center_image_url: body.center_image_url || null,
    impressum_content: body.impressum_content || "",
    logo_url: body.logo_url || null,
    logo_label: body.logo_label || null,
    infoabend_duration_minutes: body.infoabend_duration_minutes ?? 30,
    show_teachers: body.show_teachers ?? true,
    show_meditators_section: body.show_meditators_section ?? true,
    center_banner_label: body.center_banner_label || null,
    can_edit_copy: body.can_edit_copy ?? false,
    show_courses: body.show_courses ?? false,
    course_locales: body.course_locales ?? ['de'],
    meditators_ueberpruefung_url: body.meditators_ueberpruefung_url || null,
    meditators_vertiefung_url: body.meditators_vertiefung_url || null,
    meditators_treffen_url: body.meditators_treffen_url || null,
    meditators_fortgeschrittenentechniken_url: body.meditators_fortgeschrittenentechniken_url || null,
  };

  const { data, error } = await getSupabase().from("tenants").insert(row).select().single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data, { status: 201 });
}
