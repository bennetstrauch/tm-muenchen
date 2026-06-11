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
    center_image_url: body.center_image_url || null,
    impressum_content: body.impressum_content || "",
  };

  const { data, error } = await getSupabase().from("tenants").insert(row).select().single();
  if (error) return Response.json({ error: error.message }, { status: 500 });
  return Response.json(data, { status: 201 });
}
