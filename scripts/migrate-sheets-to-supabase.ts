// Run: npx tsx scripts/migrate-sheets-to-supabase.ts
// Reads all München data from Google Sheets and writes to Supabase.
// Run this ONCE before deploying the #45 lib rewrites.

// IMPORTANT: env vars must be loaded before any module that reads them at import time.
// Static imports are hoisted in ESM; dynamic imports below execute after env loading.
import { readFileSync } from 'fs';

try {
  const lines = readFileSync('.env.local', 'utf-8').split('\n');
  for (const line of lines) {
    const eq = line.indexOf('=');
    if (eq === -1 || line.trimStart().startsWith('#')) continue;
    const key = line.slice(0, eq).trim();
    const val = line.slice(eq + 1).trim().replace(/^["']|["']$/g, '');
    if (key && !(key in process.env)) process.env[key] = val;
  }
} catch { /* .env.local not found — env vars must be set externally */ }

import type { SupabaseClient } from '@supabase/supabase-js';
import type { Vorlage } from '../src/lib/vorlagen';
import type { Veranstaltung, EventRegistrationRecord } from '../src/lib/veranstaltungen';

const TENANT = 'muenchen';

function parseGermanTimestamp(s: string): string | null {
  if (!s) return null;
  const d = new Date(s);
  if (!isNaN(d.getTime())) return d.toISOString();
  const m = s.match(/^(\d{1,2})\.(\d{1,2})\.(\d{4}),\s*(\d{2}):(\d{2}):(\d{2})$/);
  if (m) {
    const [, day, month, year, h, min, sec] = m;
    return new Date(`${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}T${h}:${min}:${sec}+02:00`).toISOString();
  }
  return null;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function migrateVorlagen(supabase: SupabaseClient<any>, getAllVorlagen: () => Promise<Vorlage[]>): Promise<Map<string, string>> {
  const vorlagen = await getAllVorlagen();
  console.log(`\nVorlagen in Sheets: ${vorlagen.length}`);

  const idMap = new Map<string, string>();

  for (const v of vorlagen) {
    const { data, error } = await supabase
      .from('vorlagen')
      .insert({
        tenant: TENANT,
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
      })
      .select('id')
      .single();

    if (error) throw new Error(`Vorlage "${v.name}" (${v.id}): ${error.message}`);
    idMap.set(v.id, data.id);
    process.stdout.write('.');
  }

  const { count } = await supabase
    .from('vorlagen')
    .select('*', { count: 'exact', head: true })
    .eq('tenant', TENANT);

  console.log(`\nVorlagen in Supabase: ${count}`);
  return idMap;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function migrateVeranstaltungen(supabase: SupabaseClient<any>, getAllVeranstaltungen: () => Promise<Veranstaltung[]>, vorlageIdMap: Map<string, string>): Promise<Map<string, string>> {
  const alle = await getAllVeranstaltungen();
  console.log(`\nVeranstaltungen in Sheets: ${alle.length}`);

  const idMap = new Map<string, string>();
  let skipped = 0;

  for (const v of alle) {
    if (!v.date) {
      console.warn(`  SKIP: "${v.title}" (${v.id}) — no date`);
      skipped++;
      continue;
    }

    const { data, error } = await supabase
      .from('veranstaltungen')
      .insert({
        tenant: TENANT,
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
        vorlage_id: v.vorlageId ? (vorlageIdMap.get(v.vorlageId) ?? null) : null,
        end_time: v.endTime ?? null,
        reminder_subject1: v.reminderSubject1 ?? null,
        reminder_body1: v.reminderBody1 ?? null,
        reminder_subject2: v.reminderSubject2 ?? null,
        reminder_body2: v.reminderBody2 ?? null,
        whatsapp_posted_at: v.whatsappPostedAt ? parseGermanTimestamp(v.whatsappPostedAt) : null,
      })
      .select('id')
      .single();

    if (error) throw new Error(`Veranstaltung "${v.title}" (${v.id}): ${error.message}`);
    idMap.set(v.id, data.id);
    process.stdout.write('.');
  }

  const { count } = await supabase
    .from('veranstaltungen')
    .select('*', { count: 'exact', head: true })
    .eq('tenant', TENANT);

  console.log(`\nVeranstaltungen in Supabase: ${count} (${skipped} skipped — no date)`);
  return idMap;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function migrateAnmeldungen(supabase: SupabaseClient<any>, getEventRegistrations: () => Promise<EventRegistrationRecord[]>, eventIdMap: Map<string, string>): Promise<void> {
  const anmeldungen = await getEventRegistrations();
  console.log(`\nAnmeldungen in Sheets: ${anmeldungen.length}`);

  const rows = anmeldungen.map(a => ({
    tenant: TENANT,
    veranstaltung_id: eventIdMap.get(a.eventId) ?? null,
    timestamp: parseGermanTimestamp(a.timestamp) ?? new Date().toISOString(),
    event_id: a.eventId,
    event_title: a.eventTitle,
    event_date: a.eventDate,
    name: a.name,
    email: a.email,
    phone: a.phone || null,
    tm_lehrer: a.tmLehrer || null,
    datum_erlernen: a.datumErlernen || null,
  }));

  if (rows.length > 0) {
    const { error } = await supabase.from('anmeldungen').insert(rows);
    if (error) throw new Error(`Anmeldungen insert failed: ${error.message}`);
  }

  const { count } = await supabase
    .from('anmeldungen')
    .select('*', { count: 'exact', head: true })
    .eq('tenant', TENANT);

  console.log(`Anmeldungen in Supabase: ${count}`);
}

async function main() {
  console.log('=== München Sheets → Supabase Migration ===');

  // Dynamic imports run AFTER env vars are loaded above
  const { createClient } = await import('@supabase/supabase-js');
  const { getAllVeranstaltungen, getEventRegistrations } = await import('../src/lib/veranstaltungen');
  const { getAllVorlagen } = await import('../src/lib/vorlagen');

  const supabase = createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );

  // Note: lib functions now read from Supabase (not Sheets). This script has
  // already been run; the closures below satisfy the type signatures it expects.
  const vorlageIdMap = await migrateVorlagen(supabase, () => getAllVorlagen(TENANT));
  const eventIdMap = await migrateVeranstaltungen(supabase, () => getAllVeranstaltungen(TENANT), vorlageIdMap);
  await migrateAnmeldungen(supabase, () => getEventRegistrations(TENANT), eventIdMap);

  console.log('\n✓ Migration complete. Verify counts above match before deploying #45.');
}

main().catch(err => {
  console.error('\n✗ Migration failed:', err.message);
  process.exit(1);
});
