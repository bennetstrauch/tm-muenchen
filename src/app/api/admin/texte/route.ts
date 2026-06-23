import { getCurrentTenant } from '@/lib/tenant';
import { isAuthorizedAdminApi } from '@/lib/admin-api-gate';
import { readDeCopy, commitDeCopy, GitHubConflictError } from '@/lib/github-copy';
import { allSubsetKeys } from '@/lib/copy-subset';

export const dynamic = 'force-dynamic';

function parseCookieHeader(header: string | null, name: string): string | undefined {
  if (!header) return undefined;
  const match = header.split(';').map(s => s.trim()).find(s => s.startsWith(`${name}=`));
  return match ? match.slice(name.length + 1) : undefined;
}

async function authorize(request: Request): Promise<boolean> {
  const sessionToken = parseCookieHeader(request.headers.get('cookie'), 'admin-session');
  const tokenHeader = request.headers.get('x-admin-token') ?? undefined;
  const tokenEvent = request.headers.get('x-admin-token-event') ?? undefined;
  const { tenant } = await getCurrentTenant();
  return isAuthorizedAdminApi('/api/admin/texte', tenant, { sessionToken, tokenHeader, tokenEvent });
}

function getNestedValue(obj: Record<string, unknown>, dotPath: string): unknown {
  return dotPath.split('.').reduce<unknown>((cur, key) => {
    if (cur && typeof cur === 'object') return (cur as Record<string, unknown>)[key];
    return undefined;
  }, obj);
}

function setNestedValue(obj: Record<string, unknown>, dotPath: string, value: unknown): void {
  const keys = dotPath.split('.');
  let cur: Record<string, unknown> = obj;
  for (let i = 0; i < keys.length - 1; i++) {
    if (!cur[keys[i]] || typeof cur[keys[i]] !== 'object') cur[keys[i]] = {};
    cur = cur[keys[i]] as Record<string, unknown>;
  }
  cur[keys[keys.length - 1]] = value;
}

export async function GET(request: Request) {
  if (!await authorize(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const { content } = await readDeCopy();
    const subset = Object.fromEntries(
      allSubsetKeys().map(key => [key, getNestedValue(content, key) ?? ''])
    );
    return Response.json(subset);
  } catch (err) {
    console.error('[texte] GET failed:', err);
    return Response.json({ error: 'Fehler beim Laden.' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  if (!await authorize(request)) {
    return Response.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const updates = await request.json() as Record<string, string>;
    const { content, sha } = await readDeCopy();
    const allowed = new Set(allSubsetKeys());

    for (const [key, value] of Object.entries(updates)) {
      if (allowed.has(key)) setNestedValue(content, key, value);
    }

    await commitDeCopy(content, sha);
    return Response.json({ ok: true });
  } catch (err) {
    if (err instanceof GitHubConflictError) {
      return Response.json({ error: 'Jemand hat die Datei gleichzeitig bearbeitet. Bitte Seite neu laden.' }, { status: 409 });
    }
    console.error('[texte] PUT failed:', err);
    return Response.json({ error: 'Fehler beim Speichern.' }, { status: 500 });
  }
}
