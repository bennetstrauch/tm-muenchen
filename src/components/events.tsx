"use client";

import { useState } from "react";
import { type TMEvent, formatEventDate } from "../lib/events";
import { content } from "../content";

// ── Shared styles ─────────────────────────────────────────

const INPUT_CLS = `
  w-full border border-[#DBEAFE] rounded-md px-4 py-2.5
  text-sm text-[#1A3352] placeholder-[#7A9BB5]
  focus:outline-none focus:border-[#A5C3D7]
  bg-white
`;

// ── IndividualAppointment ─────────────────────────────────

function IndividualAppointment() {
  const { contact } = content;
  return (
    <a
      href={contact.emailHref}
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
        <span className="text-sm font-medium tracking-wide">Individuellen Termin anfragen</span>
      </div>
      <span className="text-[#A5C3D7] group-hover:translate-x-0.5 transition-transform" aria-hidden="true">→</span>
    </a>
  );
}

// ── RegistrationForm ──────────────────────────────────────

type FormState = "idle" | "submitting" | "success" | "error";

function RegistrationForm({ event, onClose }: { event: TMEvent; onClose: () => void }) {
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const { weekday, date } = formatEventDate(event.date);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormState("submitting");
    setErrorMsg("");

    const fd = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          phone: fd.get("phone") || undefined,
          isoDate: event.date,
          eventDate: `${weekday}, ${date}`,
          eventTime: event.time,
          eventType: event.type,
          meetLink: event.type === "Online" ? event.registrationUrl : undefined,
          teacherName: event.teacherName,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error ?? "Unbekannter Fehler");
      }

      setFormState("success");
    } catch (err) {
      setErrorMsg(err instanceof Error ? err.message : "Anmeldung fehlgeschlagen.");
      setFormState("error");
    }
  }

  if (formState === "success") {
    return (
      <div className="py-6 px-1">
        <p className="text-[#287E1A] font-medium text-sm mb-1">Anmeldung erfolgreich!</p>
        <p className="text-[#3D5573] text-sm">
          Wir haben Ihnen eine Bestätigung an Ihre E-Mail-Adresse geschickt.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="py-5 px-1">
      <div className="mb-3">
        <input name="name" type="text" placeholder="Name *" required className={INPUT_CLS} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <input name="email" type="email" placeholder="E-Mail *" required className={INPUT_CLS} />
        <input name="phone" type="tel" placeholder="Telefon (optional)" className={INPUT_CLS} />
      </div>

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
          {formState === "submitting" ? "Wird gesendet…" : "Jetzt anmelden"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="text-[0.68rem] tracking-[0.12em] uppercase text-[#3D5573] hover:text-[#1A3352] transition-colors"
        >
          Abbrechen
        </button>
      </div>
    </form>
  );
}

// ── EventRow ──────────────────────────────────────────────

function EventRow({
  event,
  isOpen,
  onToggle,
}: {
  event: TMEvent;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const { weekday, date } = formatEventDate(event.date);
  const { events: copy } = content;
  const isPresenz = event.type === "Präsenz";

  return (
    <li className="py-7">
      <div className="flex flex-col gap-2">

        {/* Top row: date+meta left, button right */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1 min-w-0">
            <div className="flex items-baseline gap-2 flex-wrap">
              <span className="text-[1rem] tracking-[0.15em] uppercase text-[#1A3352]/60 whitespace-nowrap">{weekday}</span>
              <span className="font-[family-name:var(--font-jakarta)] font-semibold text-[1.05rem] text-[#1A3352] leading-snug whitespace-nowrap">{date}</span>
            </div>
            <div className="flex items-center gap-3 text-start text-[#1A3352]/60">
              <span className="whitespace-nowrap">{event.time} Uhr</span>
              <span className="text-[#DBEAFE]">·</span>
              <span className={`
                text-[0.65rem] tracking-[0.12em] uppercase font-medium px-2 py-0.5 rounded-full whitespace-nowrap
                ${isPresenz ? "bg-[#F59E0B]/20 text-[#1A3352]" : "bg-[#DBEAFE] text-[#1A3352]"}
              `}>
                {event.type}
              </span>
            </div>
            {event.teacherName && (
              <span className="text-[0.75rem] text-[#3D5573] italic">{event.teacherName}</span>
            )}
          </div>

          <button
            onClick={onToggle}
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
            {isOpen ? "Schließen ×" : copy.cta}
          </button>
        </div>

        {/* Location below — full width, no squeezing */}
        {isPresenz && (
          <span className="text-[0.75rem] text-[#3D5573]">{event.location}</span>
        )}

      </div>

      {isOpen && <RegistrationForm event={event} onClose={onToggle} />}
    </li>
  );
}

// ── Events (page section) ─────────────────────────────────

export default function Events({ events }: { events: TMEvent[] }) {
  const { events: copy } = content;
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section id="anmeldung" className="section bg-white pt-6 sm:pt-10">
      <div className="section-inner">

        <div className="text-center mb-6">
          {/* <p className="text-[0.65rem] tracking-[0.3em] uppercase text-[#3D5573] mb-4">
            Transzendentale Meditation · München

          </p> */}
          <h2 className="font-display font-light text-[2rem] sm:text-[2.75rem] text-[#1A3352] leading-tight mb-3">
            {copy.heading}
          </h2>
          <p className="text-sm text-[#3D5573] tracking-wide">{copy.subheading}</p>
        </div>

        {events.length === 0 ? (
          <IndividualAppointment />
        ) : (
          <>
            <ul className="divide-y divide-[#DBEAFE] px-4">
              {events.map((event, i) => (
                <EventRow
                  key={i}
                  event={event}
                  isOpen={openIdx === i}
                  onToggle={() => setOpenIdx(openIdx === i ? null : i)}
                />
              ))}
            </ul>
            <div className="px-4">
              <IndividualAppointment />
            </div>
          </>
        )}

      </div>
    </section>
  );
}
