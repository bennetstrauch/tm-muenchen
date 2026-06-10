import { syncTmw } from '@/lib/tmw-sync';
import { getCurrentTenant } from '@/lib/tenant';

export const dynamic = 'force-dynamic';

export async function POST() {
  try {
    const { tenant } = await getCurrentTenant();
    const result = await syncTmw(tenant);
    return Response.json(result);
  } catch (e) {
    return Response.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
