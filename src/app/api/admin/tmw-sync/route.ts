import { syncTmw } from '@/lib/tmw-sync';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const result = await syncTmw();
    return Response.json(result);
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
