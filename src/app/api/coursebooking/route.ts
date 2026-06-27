import { bookCourse } from '@/lib/course-booking';
import { insertKursAnmeldung } from '@/lib/kurs-anmeldungen';
import { getCurrentTenant } from '@/lib/tenant';

type RequestBody = {
  slot: number;
  first_name: string;
  last_name: string;
  email: string;
  gender: 'M' | 'F' | 'X';
  birthdate: string;
  phone?: string;
  address1?: string;
  zip_code?: string;
  city?: string;
  news_subscribed?: boolean;
  locale?: string;
};

export async function POST(request: Request) {
  const body: RequestBody = await request.json();
  const {
    slot, first_name, last_name, email, gender, birthdate,
    phone, address1, zip_code, city, news_subscribed = false,
    locale = 'de',
  } = body;

  if (!slot || !first_name?.trim() || !last_name?.trim() || !email?.trim() || !gender || !birthdate) {
    return Response.json({ error: 'Pflichtfelder fehlen.' }, { status: 400 });
  }

  const source = request.headers.get('host') ?? 'unbekannt';
  const tenant = await getCurrentTenant();

  let tmwId: number;
  try {
    const result = await bookCourse({
      slot,
      first_name,
      last_name,
      email,
      gender,
      birthdate,
      phone_number: phone,
      address1,
      zip_code,
      city,
      news_subscribed,
      source,
    });
    tmwId = result.id;
  } catch (err) {
    const msg = err instanceof Error ? err.message : 'Buchung fehlgeschlagen.';
    return Response.json({ error: msg }, { status: 502 });
  }

  insertKursAnmeldung({
    tenant: tenant.tenant,
    slot_pk: slot,
    tmw_booking_id: tmwId,
    first_name,
    last_name,
    email,
    phone: phone ?? null,
    gender,
    birthdate,
    address1: address1 ?? null,
    zip_code: zip_code ?? null,
    city: city ?? null,
    news_subscribed,
    locale,
    source,
  }).catch(err => console.error('[coursebooking] Supabase write failed:', err));

  return Response.json({ id: tmwId });
}
