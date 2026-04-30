export async function POST(request: Request) {
  const { username, password } = await request.json();

  if (
    username !== process.env.ADMIN_USER ||
    password !== process.env.ADMIN_PASS
  ) {
    return Response.json({ error: 'Benutzername oder Passwort falsch.' }, { status: 401 });
  }

  const token = btoa(`${username}:${password}`);
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';

  return new Response(JSON.stringify({ success: true }), {
    headers: {
      'Content-Type': 'application/json',
      'Set-Cookie': `admin-session=${token}; Path=/; HttpOnly; SameSite=Lax; Max-Age=${60 * 60 * 24 * 365}${secure}`,
    },
  });
}
