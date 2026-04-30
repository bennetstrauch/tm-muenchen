"use client";

import { useState } from "react";
import type { Veranstaltung } from "@/lib/veranstaltungen";
import { formatVeranstaltungDate } from "@/lib/format";

const INPUT_CLS = `
  w-full border border-[#DBEAFE] rounded-md px-4 py-2.5
  text-sm text-[#1A3352] placeholder-[#7A9BB5]
  focus:outline-none focus:border-[#A5C3D7]
  bg-white
`;

// ── Registration form ──────────────────────────────────────

type FormState = "idle" | "submitting" | "success" | "error";

function RegistrationForm({
  event,
  onClose,
}: {
  event: Veranstaltung;
  onClose: () => void;
}) {
  const [formState, setFormState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormState("submitting");
    setErrorMsg("");

    const fd = new FormData(e.currentTarget);

    try {
      const res = await fetch("/api/register-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: fd.get("name"),
          email: fd.get("email"),
          phone: fd.get("phone") || undefined,
          eventId: event.id,
          eventTitle: event.title,
          eventSubtitle: event.subtitle,
          isoDate: event.date,
          eventDate: formatVeranstaltungDate(event.date),
          eventTime: event.time,
          eventLocation: event.location,
          isOnline: event.isOnline,
          onlineLink: event.onlineLink || undefined,
          hosts: event.hosts,
          price: event.price || undefined,
          reminder1Hours: event.reminder1Hours,
          reminder2Hours: event.reminder2Hours,
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
          Wir haben dir eine Bestätigung per E-Mail geschickt.
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

// ── EventCard ──────────────────────────────────────────────

function EventCard({
  event,
  isOpen,
  onToggle,
}: {
  event: Veranstaltung;
  isOpen: boolean;
  onToggle: () => void;
}) {
  const fullDate = formatVeranstaltungDate(event.date);
  const [expanded, setExpanded] = useState(false);
  const hasDetails = !!(event.description || event.hosts || event.price || event.notes);

  return (
    <li className="py-8 first:pt-0">
      <div className="flex flex-col gap-3">

        {/* Header row */}
        <div className="flex items-start justify-between gap-4">
          <div className="flex flex-col gap-1 min-w-0">
            <h2 className="font-[family-name:var(--font-jakarta)] font-semibold text-[1.1rem] text-[#1A3352] leading-snug">
              {event.title}
            </h2>
            {event.subtitle && (
              <p className="text-sm font-semibold italic text-[#C2541A]">{event.subtitle}</p>
            )}
          </div>

          {event.registrationOpen && (
            <button
              onClick={onToggle}
              className="
                inline-flex items-center gap-2 flex-shrink-0
                px-5 py-2.5
                bg-[#FEF3C7] border border-[#F59E0B]/50 text-[#1A3352]
                text-[0.68rem] tracking-[0.18em] uppercase font-medium rounded-full
                transition-all duration-300
                hover:bg-[#FDE68A] hover:border-[#F59E0B]/80
                hover:shadow-[0_4px_16px_rgba(245,158,11,0.25)]
                focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#F59E0B] focus-visible:ring-offset-2
              "
            >
              {isOpen ? "Schließen ×" : "Anmelden"}
            </button>
          )}
        </div>

        {/* Meta row */}
        <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#1A3352]/70">
          <span>{fullDate}</span>
          {event.time && (
            <>
              <span className="text-[#DBEAFE]">·</span>
              <span>{event.time} Uhr</span>
            </>
          )}
          <span className="text-[#DBEAFE]">·</span>
          <span className={`
            text-[0.65rem] tracking-[0.12em] uppercase font-medium px-2 py-0.5 rounded-full
            ${event.isOnline ? "bg-[#DBEAFE] text-[#1A3352]" : "bg-[#F59E0B]/20 text-[#1A3352]"}
          `}>
            {event.isOnline ? "Online" : "Präsenz"}
          </span>
          {!event.isOnline && event.location && (
            <>
              <span className="text-[#DBEAFE]">·</span>
              <span className="text-[0.75rem]">{event.location}</span>
            </>
          )}
        </div>

        {/* Expand toggle */}
        {hasDetails && (
          <button
            onClick={() => setExpanded(e => !e)}
            className="flex items-center gap-1.5 self-start text-[0.72rem] text-[#7A9BB5] hover:text-[#1A3352] transition-colors"
          >
            <svg
              width="12" height="12" viewBox="0 0 12 12" fill="none" aria-hidden="true"
              className={`transition-transform duration-200 ${expanded ? "rotate-180" : ""}`}
            >
              <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            {expanded ? "Weniger" : "Details"}
          </button>
        )}

        {/* Expandable details */}
        {expanded && (
          <div className="flex flex-col gap-2 pt-1">
            {event.description && (
              <p className="text-sm text-[#3D5573] leading-relaxed">{event.description}</p>
            )}
            {(event.hosts || event.price) && (
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-[0.78rem] text-[#3D5573]">
                {event.hosts && <span className="italic">mit {event.hosts}</span>}
                {event.price && <span className="font-medium text-[#1A3352]/70">{event.price}</span>}
              </div>
            )}
            {event.notes && (
              <p className="text-[0.75rem] text-[#3D5573]/70 italic">{event.notes}</p>
            )}
          </div>
        )}

      </div>

      {isOpen && <RegistrationForm event={event} onClose={onToggle} />}
    </li>
  );
}

// ── MeditierendenEvents ────────────────────────────────────

export default function MeditierendenEvents({ events }: { events: Veranstaltung[] }) {
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  if (events.length === 0) {
    return (
      <div className="py-12 text-center">
        <p className="text-[#3D5573] text-sm">
          Aktuell sind keine Termine eingetragen. Schreib uns gerne:
        </p>
        <a
          href="mailto:newsletter@tm-muenchen.de"
          className="mt-3 inline-block text-[#BCA075] text-sm hover:underline"
        >
          newsletter@tm-muenchen.de
        </a>
      </div>
    );
  }

  return (
    <ul className="divide-y divide-[#DBEAFE]">
      {events.map((event, i) => (
        <EventCard
          key={event.id}
          event={event}
          isOpen={openIdx === i}
          onToggle={() => setOpenIdx(openIdx === i ? null : i)}
        />
      ))}
    </ul>
  );
}
