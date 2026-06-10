import { Resend } from 'resend';
import { lookupTeachersByFirstNames } from '@/lib/tmw-teachers';
import { updateWhatsappPosted } from '@/lib/veranstaltungen';
import { getCurrentTenant } from '@/lib/tenant';

const resend = new Resend(process.env.RESEND_API_KEY);

type RequestBody = {
  eventId: string;
  eventTitle: string;
  hosts: string;
  text: string;
};

export async function POST(request: Request) {
  const body: RequestBody = await request.json();
  const { eventId, eventTitle, hosts, text } = body;

  if (!eventId || !text) {
    return Response.json({ error: 'Pflichtfelder fehlen.' }, { status: 400 });
  }

  const firstNames = hosts.split(',').map(s => s.trim()).filter(Boolean);
  const [leiter, tenant] = await Promise.all([lookupTeachersByFirstNames(firstNames), getCurrentTenant()]);

  if (leiter.length === 0) {
    return Response.json({ error: 'Keine Leiter-E-Mail-Adressen gefunden.' }, { status: 422 });
  }

  await Promise.all(
    leiter.map(l =>
      resend.emails.send({
        from: tenant.from_email,
        to: l.email,
        subject: `WhatsApp-Post: ${eventTitle}`,
        text,
      })
    )
  );

  await updateWhatsappPosted(eventId, new Date().toISOString(), tenant.tenant).catch(err =>
    console.error('whatsappPostedAt write failed:', err)
  );

  return Response.json({ success: true, sentTo: leiter.map(l => l.email) });
}
