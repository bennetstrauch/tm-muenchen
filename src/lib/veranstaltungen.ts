import { getSupabase } from './supabase';
import { formatVeranstaltungDate, calcReminderTime } from './format';

export { formatVeranstaltungDate, calcReminderTime };

export type Veranstaltung = {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  longDescription: string;
  date: string;
  time: string;
  location: string;
  isOnline: boolean;
  onlineLink: string;
  hosts: string;
  price: string;
  targetAudience: string;
  notes: string;
  reminder1Hours: number;
  reminder2Hours: number;
  registrationOpen: boolean;
  visible: boolean;
  isPriority: boolean;
  imageUrl?: string;
  auchFuerNichtMeditierende: boolean;
  slug?: string;
  vorlageId?: string;
  endTime?: string;
  reminderSubject1?: string;
  reminderBody1?: string;
  reminderSubject2?: string;
  reminderBody2?: string;
  whatsappPostedAt?: string;
};

export type EventRegistration = {
  eventId: string;
  eventTitle: string;
  eventDate: string;
  name: string;
  email: string;
  phone: string;
  tmLehrer: string;
  datumErlernen: string;
};

export type EventRegistrationRecord = {
  timestamp: string;
  eventId: string;
  eventTitle: string;
  eventDate: string;
  name: string;
  email: string;
  phone: string;
  tmLehrer: string;
  datumErlernen: string;
};

export function parseBool(val: string): boolean {
  return ['true', 'ja', '1', 'yes', 'x'].includes((val ?? '').toLowerCase().trim());
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function fromRow(row: any): Veranstaltung {
  return {
    id: row.id,
    title: row.title,
    subtitle: row.subtitle,
    description: row.description,
    longDescription: row.long_description,
    date: row.date,
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
    vorlageId: row.vorlage_id ?? undefined,
    endTime: row.end_time ?? undefined,
    reminderSubject1: row.reminder_subject1 ?? undefined,
    reminderBody1: row.reminder_body1 ?? undefined,
    reminderSubject2: row.reminder_subject2 ?? undefined,
    reminderBody2: row.reminder_body2 ?? undefined,
    whatsappPostedAt: row.whatsapp_posted_at ?? undefined,
  };
}

function toRow(v: Omit<Veranstaltung, 'id'>, tenant: string) {
  return {
    tenant,
    title: v.title,
    subtitle: v.subtitle,
    description: v.description,
    long_description: v.longDescription,
    date: v.date,
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
    vorlage_id: v.vorlageId ?? null,
    end_time: v.endTime ?? null,
    reminder_subject1: v.reminderSubject1 ?? null,
    reminder_body1: v.reminderBody1 ?? null,
    reminder_subject2: v.reminderSubject2 ?? null,
    reminder_body2: v.reminderBody2 ?? null,
    whatsapp_posted_at: v.whatsappPostedAt ?? null,
  };
}

export async function getVeranstaltungById(id: string, tenant: string): Promise<Veranstaltung | null> {
  const { data } = await getSupabase()
    .from('veranstaltungen')
    .select('*')
    .eq('id', id)
    .eq('tenant', tenant)
    .single();
  return data ? fromRow(data) : null;
}

export async function getAllVeranstaltungen(tenant: string): Promise<Veranstaltung[]> {
  const { data } = await getSupabase()
    .from('veranstaltungen')
    .select('*')
    .eq('tenant', tenant);
  return (data ?? []).map(fromRow);
}

export async function getVeranstaltungen(tenant: string): Promise<Veranstaltung[]> {
  const today = new Date().toISOString().slice(0, 10);
  const { data } = await getSupabase()
    .from('veranstaltungen')
    .select('*')
    .eq('tenant', tenant)
    .eq('visible', true)
    .gte('date', today)
    .order('is_priority', { ascending: false })
    .order('date', { ascending: true })
    .order('time', { ascending: true });
  return (data ?? []).map(fromRow);
}

export async function createVeranstaltung(v: Omit<Veranstaltung, 'id'>, tenant: string): Promise<Veranstaltung> {
  const { data, error } = await getSupabase()
    .from('veranstaltungen')
    .insert(toRow(v, tenant))
    .select()
    .single();
  if (error) throw error;
  return fromRow(data);
}

export async function updateVeranstaltung(v: Veranstaltung, tenant: string): Promise<void> {
  const { error } = await getSupabase()
    .from('veranstaltungen')
    .update(toRow(v, tenant))
    .eq('id', v.id)
    .eq('tenant', tenant);
  if (error) throw error;
}

export async function deleteVeranstaltung(id: string, tenant: string): Promise<void> {
  const { error } = await getSupabase()
    .from('veranstaltungen')
    .delete()
    .eq('id', id)
    .eq('tenant', tenant);
  if (error) throw error;
}

export async function updateWhatsappPosted(id: string, timestamp: string, tenant: string): Promise<void> {
  const { error } = await getSupabase()
    .from('veranstaltungen')
    .update({ whatsapp_posted_at: timestamp })
    .eq('id', id)
    .eq('tenant', tenant);
  if (error) throw error;
}

export async function appendEventRegistration(r: EventRegistration, tenant: string): Promise<void> {
  const { error } = await getSupabase()
    .from('anmeldungen')
    .insert({
      tenant,
      event_id: r.eventId,
      event_title: r.eventTitle,
      event_date: r.eventDate,
      name: r.name,
      email: r.email,
      phone: r.phone || null,
      tm_lehrer: r.tmLehrer || null,
      datum_erlernen: r.datumErlernen || null,
    });
  if (error) throw error;
}

export async function getEventRegistrations(tenant: string): Promise<EventRegistrationRecord[]> {
  const { data } = await getSupabase()
    .from('anmeldungen')
    .select('*')
    .eq('tenant', tenant)
    .order('timestamp', { ascending: false });
  return (data ?? []).map(row => ({
    timestamp: row.timestamp,
    eventId: row.event_id,
    eventTitle: row.event_title,
    eventDate: row.event_date,
    name: row.name,
    email: row.email,
    phone: row.phone ?? '',
    tmLehrer: row.tm_lehrer ?? '',
    datumErlernen: row.datum_erlernen ?? '',
  }));
}
