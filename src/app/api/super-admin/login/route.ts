import bcrypt from "bcryptjs";
import { createSession } from "@/lib/admin-session";

const ONE_YEAR_SECONDS = 60 * 60 * 24 * 365;

export async function POST(request: Request) {
  const hash = process.env.SUPER_ADMIN_PASSWORD_HASH;
  if (!hash) {
    return Response.json({ error: "Super-admin not configured." }, { status: 500 });
  }

  const { password } = await request.json();
  if (typeof password !== "string" || !(await bcrypt.compare(password, hash))) {
    return Response.json({ error: "Passwort falsch." }, { status: 401 });
  }

  const token = await createSession("super-admin");
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";

  return new Response(JSON.stringify({ success: true }), {
    headers: {
      "Content-Type": "application/json",
      "Set-Cookie": `super-admin-session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${ONE_YEAR_SECONDS}${secure}`,
    },
  });
}
