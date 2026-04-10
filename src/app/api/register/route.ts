import { Resend } from "resend";
import { buildConfirmationHtml, buildTeacherNotificationHtml } from "@/lib/email";
import type { RegistrationEmailParams } from "@/lib/email";

const resend = new Resend(process.env.RESEND_API_KEY);

type RequestBody = {
  name: string;
  email: string;
  phone?: string;
  eventDate: string;
  eventTime: string;
  eventType: "Online" | "Präsenz";
  meetLink?: string;
  teacherName?: string;
};

type TMWTeacher = {
  name: string;
  email: string;
  phone_number: string;
  image_url: string;
  short_bio: string;
};

export async function POST(request: Request) {
  const body: RequestBody = await request.json();
  const { name, email, phone, eventDate, eventTime, eventType, meetLink, teacherName } = body;

  if (!name?.trim() || !email?.trim()) {
    return Response.json({ error: "Pflichtfelder fehlen." }, { status: 400 });
  }

  // Fetch teacher details from TMW API
  let teacher: RegistrationEmailParams["teacher"] = null;
  if (teacherName) {
    try {
      const res = await fetch("https://tmw.meditation.de/api/center/108", {
        headers: { Authorization: `Token ${process.env.TMW_API_KEY}` },
        next: { revalidate: 3600 },
      });
      if (res.ok) {
        const data = await res.json();
        const found: TMWTeacher | undefined = data.teachers?.find(
          (t: TMWTeacher) => t.name.trim() === teacherName.trim()
        );
        if (found) {
          teacher = {
            name: found.name,
            email: found.email,
            phone: found.phone_number,
            imageUrl: found.image_url,
            bio: found.short_bio,
          };
        }
      }
    } catch {
      // Non-fatal — send emails without teacher details
    }
  }

  const params: RegistrationEmailParams = {
    name, email, phone,
    eventDate, eventTime, eventType, meetLink,
    teacher,
  };

  const isOnline = eventType === "Online";
  const subject = `Bestätigung: TM-${isOnline ? "Online-" : ""}Infovortrag am ${eventDate} um ${eventTime}`;

  // Send both emails concurrently
  await Promise.all([
    resend.emails.send({
      from: "TM München <noreply@tm-muenchen.de>",
      to: email,
      subject,
      html: buildConfirmationHtml(params),
    }),
    teacher?.email
      ? resend.emails.send({
          from: "TM München <noreply@tm-muenchen.de>",
          to: teacher.email,
          subject: `Neue Anmeldung: ${isOnline ? "Online-" : ""}Infovortrag am ${eventDate} um ${eventTime}`,
          html: buildTeacherNotificationHtml(params),
        })
      : Promise.resolve(),
  ]);

  return Response.json({ success: true });
}
