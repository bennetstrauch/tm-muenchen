"use client";

import { useState } from "react";
import { type TMEvent, formatEventDate } from "../lib/events";
import { content } from "../content";

type FormState = "idle" | "submitting" | "success" | "error";

function RegistrationForm({
  event,
  onClose,
}: {
  event: TMEvent;
  onClose: () => void;
}) {
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
        <p className="text-[#3a7a3a] font-medium text-sm mb-1">
          Anmeldung erfolgreich!
        </p>
        <p className="text-[#5c4d38] text-sm">
          Wir haben Ihnen eine Bestätigung an Ihre E-Mail-Adresse geschickt.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="py-5 px-1">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <input
          name="name"
          type="text"
          placeholder="Name *"
          required
          className="
            w-full border border-[#d4c5a9] rounded-md px-4 py-2.5
            text-sm text-[#1a1208] placeholder-[#b0a090]
            focus:outline-none focus:border-[#c4962a]
            bg-[#faf8f5]
          "
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <input
          name="email"
          type="email"
          placeholder="E-Mail *"
          required
          className="
            w-full border border-[#d4c5a9] rounded-md px-4 py-2.5
            text-sm text-[#1a1208] placeholder-[#b0a090]
            focus:outline-none focus:border-[#c4962a]
            bg-[#faf8f5]
          "
        />
        <input
          name="phone"
          type="tel"
          placeholder="Telefon (optional)"
          className="
            w-full border border-[#d4c5a9] rounded-md px-4 py-2.5
            text-sm text-[#1a1208] placeholder-[#b0a090]
            focus:outline-none focus:border-[#c4962a]
            bg-[#faf8f5]
          "
        />
      </div>

      {formState === "error" && (
        <p className="text-red-600 text-xs mb-3">{errorMsg}</p>
      )}

      <div className="flex items-center gap-3 flex-wrap">
        <button
          type="submit"
          disabled={formState === "submitting"}
          className="
            inline-flex items-center gap-2
            px-6 py-3
            bg-[#c4962a] text-white
            text-[0.68rem] tracking-[0.18em] uppercase font-medium
            rounded-full
            transition-all duration-300
            hover:bg-[#a87d22] hover:shadow-[0_4px_16px_rgba(196,150,42,0.3)]
            disabled:opacity-60 disabled:cursor-not-allowed
            focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c4962a]
          "
        >
          {formState === "submitting" ? "Wird gesendet…" : "Jetzt anmelden"}
        </button>
        <button
          type="button"
          onClick={onClose}
          className="text-[0.68rem] tracking-[0.12em] uppercase text-[#8b7355] hover:text-[#5c4d38] transition-colors"
        >
          Abbrechen
        </button>
      </div>
    </form>
  );
}

export default function Events({ events }: { events: TMEvent[] }) {
  const { events: copy } = content;
  const [openIdx, setOpenIdx] = useState<number | null>(null);

  return (
    <section id="anmeldung" className="bg-white px-6 py-20 sm:py-28">
      <div className="max-w-2xl mx-auto">

        {/* Heading */}
        <div className="text-center mb-14">
          <p className="text-[0.65rem] tracking-[0.3em] uppercase text-[#8b7355] mb-4">
            Transzendentale Meditation · München
          </p>
          <h2 className="font-display font-light text-[2rem] sm:text-[2.75rem] text-[#1a1208] leading-tight mb-3">
            {copy.heading}
          </h2>
          <p className="text-sm text-[#8b7355] tracking-wide">
            {copy.subheading}
          </p>
        </div>

        {/* Event list */}
        {events.length === 0 ? (
          <p className="text-center text-[#5c4d38] text-sm py-8">
            {copy.empty}
          </p>
        ) : (
          <ul className="divide-y divide-[#e8e0d4] px-4">
            {events.map((event, i) => {
              const { weekday, date } = formatEventDate(event.date);
              const isOpen = openIdx === i;
              return (
                <li key={i} className="py-7">
                  <div className="flex flex-wrap items-center justify-between gap-x-6 gap-y-3">
                    {/* Date + meta */}
                    <div className="flex flex-col gap-1">
                      <div className="flex items-baseline gap-2">
                        <span className="text-[0.7rem] tracking-[0.15em] uppercase text-[#8b7355]">
                          {weekday}
                        </span>
                        <span className="font-display font-light text-[1.35rem] text-[#1a1208] leading-none">
                          {date}
                        </span>
                      </div>
                      <div className="flex items-center gap-3 text-sm text-[#5c4d38]">
                        <span>{event.time} Uhr</span>
                        <span className="text-[#d4c5a9]">·</span>
                        <span
                          className={`
                            text-[0.65rem] tracking-[0.12em] uppercase font-medium px-2 py-0.5 rounded-full
                            ${event.type === "Online"
                              ? "bg-[#f0f4f8] text-[#4a7090]"
                              : "bg-[#faf0e4] text-[#8b5e2a]"
                            }
                          `}
                        >
                          {event.type}
                        </span>
                        {event.type === "Präsenz" && (
                          <span className="text-[#5c4d38]">{event.location}</span>
                        )}
                      </div>
                      {event.teacherName && (
                        <span className="text-[0.75rem] text-[#8b7355] italic">
                          {event.teacherName}
                        </span>
                      )}
                    </div>

                    {/* CTA */}
                    <button
                      onClick={() => setOpenIdx(isOpen ? null : i)}
                      className="
                        inline-flex items-center gap-2 self-start sm:self-auto
                        px-6 py-3
                        border border-[#c4962a] text-[#c4962a]
                        text-[0.68rem] tracking-[0.18em] uppercase font-medium
                        rounded-full
                        transition-all duration-300
                        hover:bg-[#c4962a] hover:text-white hover:shadow-[0_4px_16px_rgba(196,150,42,0.25)]
                        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#c4962a] focus-visible:ring-offset-2
                      "
                    >
                      {isOpen ? "Schließen ×" : copy.cta}
                    </button>
                  </div>

                  {/* Inline registration form */}
                  {isOpen && (
                    <RegistrationForm
                      event={event}
                      onClose={() => setOpenIdx(null)}
                    />
                  )}
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
