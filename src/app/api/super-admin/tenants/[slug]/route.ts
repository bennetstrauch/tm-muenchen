import bcrypt from "bcryptjs";
import { getSupabase } from "@/lib/supabase";

function parseCenterIds(raw: string): number[] {
  return raw.split(",").map(s => parseInt(s.trim(), 10)).filter(n => !isNaN(n));
}

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ slug: string }> },
) {
  const { slug } = await params;
  const body = await request.json();
  const db = getSupabase();

  let hash: string;
  if (body.password) {
    hash = await bcrypt.hash(body.password, 10);
  } else {
    const { data, error } = await db.from("tenants").select("admin_password_hash").eq("tenant", slug).single();
    if (error || !data) return Response.json({ error: "Tenant not found." }, { status: 404 });
    hash = data.admin_password_hash;
  }

  const row = {
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
  };

  const { data, error } = await db.from("tenants").update(row).eq("tenant", slug);
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data);
}
