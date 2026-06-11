import { notFound } from 'next/navigation';
import { getSupabase } from '@/lib/supabase';
import type { TenantConfig } from '@/lib/tenant';
import TenantForm from '../tenant-form';

export const dynamic = 'force-dynamic';

export default async function EditTenantPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { data } = await getSupabase()
    .from('tenants')
    .select('*')
    .eq('tenant', slug)
    .single();

  if (!data) notFound();

  return <TenantForm tenant={data as TenantConfig} />;
}
