"use client";

import { useState, useEffect } from "react";
import type { Veranstaltung } from "@/lib/veranstaltungen";
import { formatVeranstaltungDate } from "@/lib/format";

const INPUT_CLS = `
  w-full border border-[#DBEAFE] rounded-md px-4 py-2.5
  text-sm text-[#1A3352] placeholder-[#7A9BB5]
  focus:outline-none focus:border-[#A5C3D7]
  bg-white
`;

const DEFAULT_IMAGE = '/retreat-gruss.jpg';

// ── Saved profile (localStorage) ───────────────────────────

const PROFILE_KEY = "tm-saved-profile";

type SavedProfile = {
  name: string;
  email: string;
  phone: string;
  tmLehrer: string;
  datumErlernen: string;
  saveProfile: boolean;
};

function loadProfile(): SavedProfile | null {
  try {
    const raw = localStorage.getItem(PROFILE_KEY);
    return raw ? (JSON.parse(raw) as SavedProfile) : null;
  } catch {
    return null;
  }
}

function persistProfile(p: SavedProfile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(p));
}

function clearProfile() {
  localStorage.removeItem(PROFILE_KEY);
}

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

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [tmLehrer, setTmLehrer] = useState("");
  const [datumErlernen, setDatumErlernen] = useState("");
  const [saveProfile, setSaveProfile] = useState(false);

  useEffect(() => {
    const saved = loadProfile();
    if (!saved) return;
    setName(saved.name ?? "");
    setEmail(saved.email ?? "");
    setPhone(saved.phone ?? "");
    setTmLehrer(saved.tmLehrer ?? "");
    setDatumErlernen(saved.datumErlernen ?? "");
    setSaveProfile(saved.saveProfile ?? false);
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setFormState("submitting");
    setErrorMsg("");

    const existing = loadProfile();
    const profile: SavedProfile = {
      name, email, phone, saveProfile,
      tmLehrer: event.auchFuerNichtMeditierende ? (existing?.tmLehrer ?? '') : tmLehrer,
      datumErlernen: event.auchFuerNichtMeditierende ? (existing?.datumErlernen ?? '') : datumErlernen,
    };
    if (saveProfile) {
      persistProfile(profile);
    } else {
      clearProfile();
    }

    try {
      const res = await fetch("/api/register-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          phone: phone || undefined,
          tmLehrer,
          datumErlernen,
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
        <input
          type="text"
          placeholder="Name *"
          required
          value={name}
          onChange={e => setName(e.target.value)}
          className={INPUT_CLS}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
        <input
          type="email"
          placeholder="E-Mail *"
          required
          value={email}
          onChange={e => setEmail(e.target.value)}
          className={INPUT_CLS}
        />
        <input
          type="tel"
          placeholder="Telefon (optional)"
          value={phone}
          onChange={e => setPhone(e.target.value)}
          className={INPUT_CLS}
        />
      </div>
      {!event.auchFuerNichtMeditierende && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
          <input
            type="text"
            placeholder="TM-Lehrer *"
            required
            value={tmLehrer}
            onChange={e => setTmLehrer(e.target.value)}
            className={INPUT_CLS}
          />
          <div>
            <label className="block text-[0.7rem] text-[#7A9BB5] mb-1 ml-1">
              Datum des Erlernens *
            </label>
            <input
              type="date"
              required
              value={datumErlernen}
              onChange={e => setDatumErlernen(e.target.value)}
              max={new Date().toISOString().slice(0, 10)}
              className={INPUT_CLS}
            />
          </div>
        </div>
      )}

      <label className="flex items-center gap-2.5 mb-4 cursor-pointer select-none">
        <input
          type="checkbox"
          checked={saveProfile}
          onChange={e => setSaveProfile(e.target.checked)}
          className="h-4 w-4 rounded border-[#DBEAFE] accent-[#A5C3D7] cursor-pointer"
        />
        <span className="text-[0.75rem] text-[#3D5573]">
          Daten für zukünftige Anmeldungen speichern
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
  index,
}: {
  event: Veranstaltung;
  isOpen: boolean;
  onToggle: () => void;
  index: number;
}) {
  const fullDate = formatVeranstaltungDate(event.date);
  const [expanded, setExpanded] = useState(false);
  const hasDetails = !!(event.description || event.longDescription || event.hosts || event.price || event.notes);
  const imageFirst = index % 2 === 0;
  const imageUrl = event.imageUrl || DEFAULT_IMAGE;

  const eventContent = (
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
      <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-[#1A3352]">
        <span className="font-medium">{fullDate}</span>
        {event.time && (
          <>
            <span className="text-[#A5C3D7]">·</span>
            <span className="font-medium">{event.time} Uhr</span>
          </>
        )}
        <span className="text-[#A5C3D7]">·</span>
        <span className={`
          text-[0.65rem] tracking-[0.12em] uppercase font-medium px-2 py-0.5 rounded-full
          ${event.isOnline ? "bg-[#DBEAFE] text-[#1A3352]" : "bg-[#F59E0B]/20 text-[#1A3352]"}
        `}>
          {event.isOnline ? "Online" : "Präsenz"}
        </span>
        {event.auchFuerNichtMeditierende && (
          <span className="text-[0.65rem] tracking-[0.12em] uppercase font-medium px-2 py-0.5 rounded-full bg-[#F0FDF4] text-[#166534]">
            Auch für Nicht-Meditierende
          </span>
        )}
        {!event.isOnline && event.location && (
          <>
            <span className="text-[#A5C3D7]">·</span>
            <span className="text-[0.75rem] text-[#3D5573]">{event.location}</span>
          </>
        )}
      </div>

      {/* Expand toggle */}
      {hasDetails && (
        <button
          onClick={() => setExpanded(e => !e)}
          className="flex items-center gap-1.5 self-start text-[0.72rem] text-[#3D5573] hover:text-[#1A3352] transition-colors"
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
        <div className="bg-white/90 rounded-xl px-4 py-3 flex flex-col gap-2.5">
          {event.description && (
            <p className="text-sm text-[#3D5573] leading-relaxed">{event.description}</p>
          )}
          {event.longDescription && (
            <p className="text-sm text-[#3D5573] leading-relaxed whitespace-pre-line">
              {event.longDescription}
            </p>
          )}
          {(event.hosts || event.price) && (
            <div className="flex flex-wrap gap-x-4 gap-y-1 text-[0.78rem] text-[#3D5573]">
              {event.hosts && <span className="italic">mit {event.hosts}</span>}
              {event.price && <span className="font-medium text-[#1A3352]">{event.price}</span>}
            </div>
          )}
          {event.notes && (
            <p className="text-[0.75rem] text-[#3D5573] italic">{event.notes}</p>
          )}
        </div>
      )}
    </div>
  );

  return (
    <li>
      {/* ── Mobile: background-image card ─────────────────── */}
      <div
        className="md:hidden relative rounded-2xl overflow-hidden"
        style={{ backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}
      >
        {/* Directional gradient overlay: opaque top-left → transparent bottom-right */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(135deg, rgba(255,255,255,0.92) 40%, rgba(255,255,255,0.50) 100%)' }}
        />
        <div className="relative z-10 px-5 py-7">
          {eventContent}
          {isOpen && <RegistrationForm event={event} onClose={onToggle} />}
        </div>
      </div>

      {/* ── Desktop: alternating 1/3 image + 2/3 text grid ── */}
      <div className="hidden md:grid md:grid-cols-3 md:gap-8 md:items-stretch md:py-10 first:md:pt-0">
        {imageFirst ? (
          <>
            <div className="relative overflow-hidden rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
            </div>
            <div className="md:col-span-2 flex flex-col justify-center">
              {eventContent}
            </div>
          </>
        ) : (
          <>
            <div className="md:col-span-2 flex flex-col justify-center">
              {eventContent}
            </div>
            <div className="relative overflow-hidden rounded-xl">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={imageUrl} alt="" className="absolute inset-0 w-full h-full object-cover" />
            </div>
          </>
        )}
      </div>
      {isOpen && <div className="hidden md:block"><RegistrationForm event={event} onClose={onToggle} /></div>}
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
    <ul className="space-y-4 md:space-y-0 md:divide-y md:divide-[#DBEAFE]">
      {events.map((event, i) => (
        <EventCard
          key={event.id}
          event={event}
          index={i}
          isOpen={openIdx === i}
          onToggle={() => setOpenIdx(openIdx === i ? null : i)}
        />
      ))}
    </ul>
  );
}
