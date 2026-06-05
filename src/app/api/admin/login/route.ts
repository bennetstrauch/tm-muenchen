import bcrypt from "bcryptjs";
import { getCurrentTenant } from "@/lib/tenant";
import { createSessionToken } from "@/lib/admin-session";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export async function POST(request: Request) {
  const { password } = await request.json();
  const tenant = await getCurrentTenant();

  if (
    typeof password !== "string" ||
    !(await bcrypt.compare(password, tenant.admin_password_hash))
  ) {
    return Response.json({ error: "Passwort falsch." }, { status: 401 });
  }

  const token = createSessionToken(tenant.tenant);
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";

  return new Response(JSON.stringify({ success: true }), {
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": `admin-session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${ONE_YEAR_SECONDS}${secure}`,
    },
  });
}
