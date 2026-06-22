"use client";

import { useState } from "react";
import { useTranslations, useLocale } from "next-intl";
import { type TMEvent, formatEventDate } from "../lib/events";
import { content } from "../content";

const INPUT_CLS = `
  w-full border border-[#DBEAFE] rounded-md px-4 py-2.5
  text-sm text-[#1A3352] placeholder-[#7A9BB5]
  focus:outline-none focus:border-[#A5C3D7]
  bg-white
`;

function IndividualAppointment({ emailHref }: { emailHref: string }) {
  const t = useTranslations("Events");
  return (
    <a
      href={emailHref}
      className="
        group flex items-center justify-between gap-4
        px-5 py-4 mt-4
        border border-dashed border-[#A5C3D7]/60 rounded-2xl
        text-[#3D5573] hover:text-[#1A3352] hover:border-[#A5C3D7] hover:bg-[#A5C3D7]/5
        transition-all duration-200
      "
    >
      <div className="flex items-center gap-3">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true"
          className="flex-shrink-0 opacity-60 group-hover:opacity-100 transition-opacity">
          <rect x="1" y="2.5" width="14" height="12.5" rx="1.5" stroke="currentColor" strokeWidth="1" />
          <path d="M1 6.5h14" stroke="currentColor" strokeWidth="1" />
          <path d="M5 1v3M11 1v3" stroke="currentColor" strokeWidth="1" strokeLinecap="round" />
        </svg>
        <span className="text-sm font-medium tracking-wide">{t("individualAppointment")}</span>
      </div>
      <span className="text-[#A5C3D7] group-hover:translate-x-0.5 transition-transform" aria-hidden="true">→</span>
    </a>
  );
}

type FormState = "idle" | "submitting" | "success" | "error";

function RegistrationForm({ event, onClose }: { event: TMEvent; onClose: () => void }) {
  const t = useTranslations("Events");
  const locale = useLocale();
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const { weekday, date } = formatEventDate(event.date, locale);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormState("submitting");
    setErrorMsg("");

    const fd = new FormData(e.currentTarget);
    const eventId = crypto.randomUUID();
    const hasConsent = localStorage.getItem("tm_cookie_consent") === "accepted";

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          phone: fd.get("phone") || undefined,
          lectureId: event.lectureId,
          eventDate: `${weekday}, ${date}`,
          eventTime: event.time,
          eventType: event.type,
          locale,
          eventId,
          hasConsent,
          newsSubscribed: fd.get("newsSubscribed") === "on",
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? t("formErrorUnknown"));
      }

      setFormState("success");
      if (hasConsent) window.fbq?.("track", "Lead", {}, { eventID: eventId });
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : t("formErrorFailed"));
      setFormState("error");
    }
  }

  if (formState === "success") {
    return (
      <div className="py-6 px-1">
        <p className="text-[#287E1A] font-medium text-sm mb-1">{t("formSuccessTitle")}</p>
        <p className="text-[#3D5573] text-sm">{t("formSuccessBody")}</p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="py-5 px-1">
      <div className="mb-3">
        <input name="name" type="text" placeholder={t("formName")} required className={INPUT_CLS} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <input name="email" type="email" placeholder={t("formEmail")} required className={INPUT_CLS} />
        <input name="phone" type="tel" placeholder={t("formPhone")} className={INPUT_CLS} />
      </div>

      <label className="flex items-center gap-2 mb-4 cursor-pointer group">
        <input
          name="newsSubscribed"
          type="checkbox"
          className="w-4 h-4 rounded border-[#DBEAFE] accent-[#A5C3D7] cursor-pointer"
        />
        <span className="text-xs text-[#3D5573] group-hover:text-[#1A3352] transition-colors">
          {t("formNewsSubscribed")}
        </span>
      </label>

      {formState === "error" && (
        <p className="text-red-600 text-xs mb-3">{errorMsg}</p>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="submit"
          disabled={formState === "submitting"}
          className="
            inline-flex items-center gap-2 px-6 py-3
            bg-[#A5C3D7] text-[#1A3352]
            text-[0.68rem] tracking-[0.18em] uppercase font-medium rounded-full
            transition-all duration-300
            hover:bg-[#8BAAC3] hover:shadow-[0_4px_16px_rgba(165,195,215,0.4)]
            disabled:opacity-60 disabled:cursor-not-allowed
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#A5C3D7]
          "
        >
          {formState === "submitting" ? t("formSubmitting") : t("formSubmit")}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="text-[0.68rem] tracking-[0.12em] uppercase text-[#3D5573] hover:text-[#1A3352] transition-colors"
        >
          {t("formCancel")}
        </button>
      </div>
    </form>
  );
}

function EventRow({
  event,
  isOpen,
  onToggle,
}: {
  event: TMEvent;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const t = useTranslations("Events");
  const locale = useLocale();
  const { weekday, date } = formatEventDate(event.date, locale);
  const isPresenz = event.type === "Präsenz";

  return (
    <li className="py-7">
      <div className="flex flex-col gap-2">

        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-[1rem] tracking-[0.15em] uppercase text-[#1A3352]/60 whitespace-nowrap">{weekday}</span>
              <span className="font-[family-name:var(--font-jakarta)] font-semibold text-[1.05rem] text-[#1A3352] leading-snug whitespace-nowrap">{date}</span>
            </div>
            <div className="flex items-center gap-3 text-start text-[#1A3352]/60">
              <span className="whitespace-nowrap">{t("timeDisplay", { time: event.time })}</span>
              <span className="text-[#DBEAFE]">·</span>
              <span className={`
                text-[0.65rem] tracking-[0.12em] uppercase font-medium px-2 py-0.5 rounded-full whitespace-nowrap
                ${isPresenz ? "bg-[#F59E0B]/20 text-[#1A3352]" : "bg-[#DBEAFE] text-[#1A3352]"}
              `}>
                {t(event.type === "Online" ? "typeOnline" : "typePraesenz")}
              </span>
            </div>
            {event.teacherName && (
              <span className="text-[0.75rem] text-[#3D5573] italic">{event.teacherName}</span>
            )}
          </div>

          <button
            onClick={() => {
              if (!isOpen) window.fbq?.("track", "ViewContent");
              onToggle();
            }}
            className="
              inline-flex items-center gap-2 flex-shrink-0
              px-6 py-3
              bg-[#FEF3C7] border border-[#F59E0B]/50 text-[#1A3352]
              text-[0.68rem] tracking-[0.18em] uppercase font-medium rounded-full
              transition-all duration-300
              hover:bg-[#FDE68A] hover:border-[#F59E0B]/80 hover:shadow-[0_4px_16px_rgba(245,158,11,0.25)]
              focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B] focus-visible:ring-offset-2
            "
          >
            {isOpen ? t("close") : t("cta")}
          </button>
        </div>

        {isPresenz && (
          <span className="text-[0.75rem] text-[#3D5573]">{event.location}</span>
        )}

      </div>

      {isOpen && <RegistrationForm event={event} onClose={onToggle} />}
    </li>
  );
}

const INITIAL_COUNT = 3;

export default function Events({ events, emailHref }: { events: TMEvent[]; emailHref?: string }) {
  const t = useTranslations("Events");
  const { contact } = content;
  const resolvedEmailHref = emailHref ?? contact.emailHref;
  const [openIdx, setOpenIdx] = useState<number | null>(null);
  const [showAll, setShowAll] = useState(false);

  const visibleEvents = showAll ? events : events.slice(0, INITIAL_COUNT);
  const hiddenCount = events.length - INITIAL_COUNT;

  return (
    <section id="anmeldung" className="section bg-white pt-6 sm:pt-10">
      <div className="section-inner">

        <div className="text-center mb-6">
          <h2 className="font-display font-light text-[2rem] sm:text-[2.75rem] text-[#1A3352] leading-tight mb-3">
            {t("heading")}
          </h2>
        </div>

        {events.length === 0 ? (
          <IndividualAppointment emailHref={resolvedEmailHref} />
        ) : (
          <>
            <ul className="divide-y divide-[#DBEAFE] px-4">
              {visibleEvents.map((event, i) => (
                <EventRow
                  key={i}
                  event={event}
                  isOpen={openIdx === i}
                  onToggle={() => setOpenIdx(openIdx === i ? null : i)}
                />
              ))}
            </ul>
            <div className="px-4">
              {!showAll && hiddenCount > 0 && (
                <button
                  onClick={() => setShowAll(true)}
                  className="
                    w-full mt-2 mb-1 py-3
                    text-[0.68rem] tracking-[0.18em] uppercase font-medium
                    text-[#3D5573] hover:text-[#1A3352]
                    border border-dashed border-[#A5C3D7]/60 rounded-2xl
                    hover:border-[#A5C3D7] hover:bg-[#A5C3D7]/5
                    transition-all duration-200
                  "
                >
                  {t("showAll", { count: hiddenCount })}
                </button>
              )}
              <IndividualAppointment emailHref={resolvedEmailHref} />
            </div>
          </>
        )}

      </div>
    </section>
  );
}
