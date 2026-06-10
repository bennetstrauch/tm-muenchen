import { getSupabase } from './supabase';
import type { Veranstaltung } from './veranstaltungen';

export type Vorlage = Veranstaltung & { name: string };

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromRow(row: any): Vorlage {
  return {
    id: row.id,
    name: row.name,
    title: row.title,
    subtitle: row.subtitle,
    description: row.description,
    longDescription: row.long_description,
    date: row.date ?? '',
    time: row.time,
    location: row.location,
    isOnline: row.is_online,
    onlineLink: row.online_link,
    hosts: row.hosts,
    price: row.price,
    targetAudience: row.target_audience,
    notes: row.notes,
    reminder1Hours: row.reminder1_hours,
    reminder2Hours: row.reminder2_hours,
    registrationOpen: row.registration_open,
    visible: row.visible,
    isPriority: row.is_priority,
    imageUrl: row.image_url ?? undefined,
    auchFuerNichtMeditierende: row.auch_fuer_nicht_meditierende,
    slug: row.slug ?? undefined,
    endTime: row.end_time ?? undefined,
    reminderSubject1: row.reminder_subject1 ?? undefined,
    reminderBody1: row.reminder_body1 ?? undefined,
    reminderSubject2: row.reminder_subject2 ?? undefined,
    reminderBody2: row.reminder_body2 ?? undefined,
  };
}

function toRow(v: Omit<Vorlage, 'id'>, tenant: string) {
  return {
    tenant,
    name: v.name,
    title: v.title,
    subtitle: v.subtitle,
    description: v.description,
    long_description: v.longDescription,
    date: v.date || null,
    time: v.time,
    location: v.location,
    is_online: v.isOnline,
    online_link: v.onlineLink,
    hosts: v.hosts,
    price: v.price,
    target_audience: v.targetAudience,
    notes: v.notes,
    reminder1_hours: v.reminder1Hours,
    reminder2_hours: v.reminder2Hours,
    registration_open: v.registrationOpen,
    visible: v.visible,
    is_priority: v.isPriority,
    image_url: v.imageUrl ?? null,
    auch_fuer_nicht_meditierende: v.auchFuerNichtMeditierende,
    slug: v.slug ?? null,
    end_time: v.endTime ?? null,
    reminder_subject1: v.reminderSubject1 ?? null,
    reminder_body1: v.reminderBody1 ?? null,
    reminder_subject2: v.reminderSubject2 ?? null,
    reminder_body2: v.reminderBody2 ?? null,
  };
}

export async function getAllVorlagen(tenant: string): Promise<Vorlage[]> {
  const { data } = await getSupabase()
    .from('vorlagen')
    .select('*')
    .eq('tenant', tenant);
  return (data ?? []).map(fromRow);
}

export async function createVorlage(v: Omit<Vorlage, 'id'>, tenant: string): Promise<Vorlage> {
  const { data, error } = await getSupabase()
    .from('vorlagen')
    .insert(toRow(v, tenant))
    .select()
    .single();
  if (error) throw error;
  return fromRow(data);
}

export async function updateVorlage(v: Vorlage, tenant: string): Promise<void> {
  const { error } = await getSupabase()
    .from('vorlagen')
    .update(toRow(v, tenant))
    .eq('id', v.id)
    .eq('tenant', tenant);
  if (error) throw error;
}

export async function deleteVorlage(id: string, tenant: string): Promise<void> {
  const { error } = await getSupabase()
    .from('vorlagen')
    .delete()
    .eq('id', id)
    .eq('tenant', tenant);
  if (error) throw error;
}
