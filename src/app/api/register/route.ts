import { Resend } from "resend";
import { buildConfirmationHtml, buildReminderHtml, buildTeacherNotificationHtml } from "@/lib/email";
import type { RegistrationEmailParams } from "@/lib/email";

const resend = new Resend(process.env.RESEND_API_KEY);

type RequestBody = {
  name: string;
  email: string;
  phone?: string;
  isoDate: string;      // "2026-04-11"
  eventDate: string;    // "Sa., 11. April 2026"
  eventTime: string;    // "19:00"
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
  const { name, email, phone, isoDate, eventDate, eventTime, eventType, meetLink, teacherName } = body;

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
      // Non-fatal — proceed without teacher details
    }
  }

  const params: RegistrationEmailParams = {
    name, email, phone,
    eventDate, eventTime, eventType, meetLink,
    teacher,
  };

  const isOnline = eventType === "Online";

  // Calculate reminder time: 9:00 AM Munich time (07:00 UTC) the day before
  let reminderScheduledAt: string | undefined;
  if (isoDate) {
    const eventDay = new Date(`${isoDate}T00:00:00Z`);
    eventDay.setUTCDate(eventDay.getUTCDate() - 1);
    const reminderDate = new Date(`${eventDay.toISOString().slice(0, 10)}T07:00:00Z`);
    if (reminderDate > new Date()) {
      reminderScheduledAt = reminderDate.toISOString();
    }
  }

  await Promise.all([
    // Confirmation to registrant
    resend.emails.send({
      from: "TM München <noreply@tm-muenchen.de>",
      to: email,
      subject: `Bestätigung: TM-${isOnline ? "Online-" : ""}Infovortrag am ${eventDate} um ${eventTime} Uhr`,
      html: buildConfirmationHtml(params),
    }),

    // Notification to teacher
    teacher?.email
      ? resend.emails.send({
          from: "TM München <noreply@tm-muenchen.de>",
          to: teacher.email,
          subject: `Neue Anmeldung: ${isOnline ? "Online-" : ""}Infovortrag am ${eventDate} um ${eventTime} Uhr`,
          html: buildTeacherNotificationHtml(params),
        })
      : Promise.resolve(),

    // Scheduled reminder — day before at 9:00 AM Munich time
    reminderScheduledAt
      ? resend.emails.send({
          from: "TM München <noreply@tm-muenchen.de>",
          to: email,
          subject: `Erinnerung: Morgen um ${eventTime} Uhr findet Ihr TM-${isOnline ? "Online-" : ""}Infovortrag statt`,
          html: buildReminderHtml(params),
          scheduledAt: reminderScheduledAt,
        })
      : Promise.resolve(),
  ]);

  return Response.json({ success: true });
}
