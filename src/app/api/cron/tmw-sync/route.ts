import { syncTmw } from '@/lib/tmw-sync';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const auth = request.headers.get('authorization');
  if (auth !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 });
  }
  try {
    const result = await syncTmw();
    console.log('[tmw-sync cron]', JSON.stringify(result));
    return Response.json(result);
  } catch (e) {
    console.error('[tmw-sync cron] failed:', e);
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
