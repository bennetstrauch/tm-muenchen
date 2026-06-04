import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY,
);

const ok = (b) => (b ? '✅' : '❌');
let allGood = true;
const fail = () => { allGood = false; };

console.log('\n=== Migration verification ===\n');

// --- 001: tenants ---
{
  const { data, error } = await supabase
    .from('tenants')
    .select('tenant, hostname, admin_password_hash, active_locales, whatsapp_enabled, whatsapp_link, contact_email, contact_phone, from_email, instagram_link, city, center_image_url, tmw_center_ids, impressum_content')
    .eq('tenant', 'muenchen')
    .single();

  if (error) { console.log(`${ok(false)} tenants table / münchen row:`, error.message); fail(); }
  else {
    console.log(`${ok(true)} tenants table exists, münchen row present`);
    const checks = {
      hostname: data.hostname === 'tm-muenchen.de',
      city: data.city === 'München',
      instagram_link: data.instagram_link === 'https://www.instagram.com/muenchentranszendiert',
      from_email: data.from_email === 'info@tm-muenchen.de',
      tmw_center_ids: JSON.stringify(data.tmw_center_ids) === JSON.stringify([108, 109]),
      admin_password_hash_set: typeof data.admin_password_hash === 'string' && data.admin_password_hash.startsWith('$2'),
      admin_password_not_placeholder: data.admin_password_hash !== 'REPLACE_WITH_ADMIN_PASSWORD',
      impressum_has_content: typeof data.impressum_content === 'string' && data.impressum_content.includes('§ 5 TMG'),
      impressum_guldein_owner: typeof data.impressum_content === 'string' && !data.impressum_content.includes('Guldenstraße'),
      active_locales_preserved: Array.isArray(data.active_locales) && data.active_locales.length > 0,
    };
    for (const [k, v] of Object.entries(checks)) { console.log(`    ${ok(v)} ${k}`); if (!v) fail(); }
    console.log(`    ↳ tmw_center_ids = ${JSON.stringify(data.tmw_center_ids)}, active_locales = ${JSON.stringify(data.active_locales)}`);
  }
}

// --- 002: operational tables exist & are tenant-scoped ---
for (const table of ['vorlagen', 'veranstaltungen', 'anmeldungen']) {
  const { error, count } = await supabase.from(table).select('*', { count: 'exact', head: true });
  if (error) { console.log(`${ok(false)} ${table}:`, error.message); fail(); }
  else console.log(`${ok(true)} ${table} table exists (rows: ${count})`);
}
// probe a tenant-scoped column on each
for (const [table, col] of [['vorlagen', 'name'], ['veranstaltungen', 'whatsapp_posted_at'], ['anmeldungen', 'veranstaltung_id']]) {
  const { error } = await supabase.from(table).select(`tenant, ${col}`).limit(1);
  if (error) { console.log(`${ok(false)} ${table}.${col} column:`, error.message); fail(); }
  else console.log(`${ok(true)} ${table} has tenant + ${col} columns`);
}

// --- 003: teacher_languages.tenant ---
{
  const { data, error } = await supabase
    .from('teacher_languages')
    .select('tenant, teacher_name, locale');
  if (error) { console.log(`${ok(false)} teacher_languages.tenant column:`, error.message); fail(); }
  else {
    console.log(`${ok(true)} teacher_languages has tenant column (rows: ${data.length})`);
    const allMuenchen = data.every((r) => r.tenant === 'muenchen');
    console.log(`    ${ok(allMuenchen)} all rows backfilled tenant='muenchen'`);
    if (!allMuenchen) fail();
  }
}

console.log(`\n=== ${allGood ? 'ALL CHECKS PASSED ✅' : 'SOME CHECKS FAILED ❌'} ===\n`);
process.exit(allGood ? 0 : 1);
